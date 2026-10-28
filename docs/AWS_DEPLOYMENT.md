# AWS Deployment Guide for LinkNest

This guide walks through deploying the LinkNest full-stack application to Amazon Web Services (AWS) using a production-minded, cost-conscious architecture.

```
                              ┌──────────────────────────────────┐
                              │           User Browser           │
                              └───────┬──────────────────┬───────┘
                                      │                  │
                1. Static Assets (React)                 │ 2. Direct S3 Upload/Download
                                      ▼                  ▼
                         ┌────────────────────┐   ┌──────────────────────┐
                         │ AWS Amplify Hosting│   │   Amazon S3 Bucket   │
                         │ (React + Vite SPA) │   │  (Private Documents) │
                         └────────────────────┘   └──────────▲───────────┘
                                      │                      │
                             REST API │ Calls                │ Presigned URLs
                                      ▼                      │
                         ┌───────────────────────────────────┴───┐
                         │        Amazon EC2 (Ubuntu 24.04)      │
                         │  ┌─────────────────────────────────┐  │
                         │  │       Nginx Reverse Proxy       │  │
                         │  └────────────────┬────────────────┘  │
                         │                   ▼                   │
                         │  ┌─────────────────────────────────┐  │
                         │  │     Gunicorn WSGI Server        │  │
                         │  └────────────────┬────────────────┘  │
                         │                   ▼                   │
                         │  ┌─────────────────────────────────┐  │
                         │  │     Flask REST API Engine       │  │
                         │  └────────────────┬────────────────┘  │
                         │                   ▼                   │
                         │  ┌─────────────────────────────────┐  │
                         │  │  Persistent SQLite (linknest.db)│  │
                         │  └─────────────────────────────────┘  │
                         └───────────────────────────────────────┘
```

---

## Architecture Summary

| Component | AWS Service | Purpose | Free Tier / Cost Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | AWS Amplify Hosting | Hosts the Vite React frontend with automatic CI/CD from GitHub. | Includes 1,000 build minutes/month and 5 GB hosted storage. |
| **Backend API** | Amazon EC2 (Ubuntu) | Runs Flask via Gunicorn WSGI behind an Nginx reverse proxy. | `t2.micro` or `t3.micro` instance is 100% Free Tier eligible (750 hours/month for 12 months). |
| **Database** | Local SQLite on EC2 EBS | Persistent database on the EC2 root volume. | Included in EC2 30 GB EBS free tier. |
| **File Storage** | Amazon S3 (Private) | Stores optional attachments via short-lived pre-signed URLs. | 5 GB standard storage in Free Tier. |

---

## Phase 1: Deploy Backend on Amazon EC2

### Step 1: Launch an Ubuntu EC2 Instance
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **EC2** → **Instances** → **Launch Instances**.
3. Configure the instance:
   - **Name**: `linknest-api-backend`
   - **AMI**: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type
   - **Instance Type**: `t2.micro` (or `t3.micro` if in newer regions) — marked *Free Tier eligible*.
   - **Key Pair**: Create or select an existing `.pem` key pair (e.g. `linknest-key.pem`).
4. **Network Settings (Security Group)**:
   Create a Security Group with the following Inbound Rules:
   - **SSH** (Port 22): Source `My IP` (for your personal secure access).
   - **HTTP** (Port 80): Source `0.0.0.0/0` (Anywhere IPv4).
   - **HTTPS** (Port 443): Source `0.0.0.0/0` (Anywhere IPv4).
   - **Custom TCP** (Port 5000, optional for quick direct testing): Source `Anywhere`.
5. Click **Launch Instance**. Note the **Public IPv4 address** assigned to the instance.

---

### Step 2: Connect to Your EC2 Instance via SSH
From your VS Code terminal (or PowerShell on Windows):
```bash
# If on Windows, ensure your .pem file has restricted permissions
ssh -i "path/to/linknest-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

---

### Step 3: Install System Dependencies & Clone Repository
Run inside the EC2 Ubuntu terminal:
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Python, virtual environment tools, and Nginx
sudo apt install -y python3-pip python3-venv git nginx

# 3. Clone your GitHub repository
git clone https://github.com/yuvaraju7718-max/LinkNest.git
cd LinkNest/backend

# 4. Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 5. Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Step 4: Configure Production Environment File
Create the `.env` file on the EC2 server:
```bash
nano .env
```
Paste the production configuration:
```ini
FLASK_ENV=production
FLASK_DEBUG=0
PORT=5000
SECRET_KEY=generate-a-random-64-char-string-here
DATABASE_URL=sqlite:////home/ubuntu/LinkNest/backend/linknest.db
CORS_ORIGINS=*
AWS_REGION=us-east-1
S3_BUCKET_NAME=
```
*(Press `Ctrl+O`, `Enter`, then `Ctrl+X` to save and exit nano).*

---

### Step 5: Test Gunicorn WSGI
Test that Gunicorn can serve the app:
```bash
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```
Test with curl in a separate session: `curl http://localhost:5000/api/health`. Press `Ctrl+C` to stop.

---

### Step 6: Create a Systemd Service for Auto-Restart
To ensure the Flask backend restarts automatically after server reboots or crashes, create a systemd service:

```bash
sudo nano /etc/systemd/system/linknest.service
```

Add the following configuration:
```ini
[Unit]
Description=LinkNest Flask REST API Production Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/LinkNest/backend
Environment="PATH=/home/ubuntu/LinkNest/backend/venv/bin"
ExecStart=/home/ubuntu/LinkNest/backend/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:5000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable linknest
sudo systemctl start linknest
sudo systemctl status linknest
```

---

### Step 7: Configure Nginx as Reverse Proxy
Configure Nginx to proxy incoming public port 80/443 traffic to Gunicorn on `127.0.0.1:5000`:

```bash
sudo nano /etc/nginx/sites-available/linknest
```

Paste:
```nginx
server {
    listen 80;
    server_name <YOUR-EC2-PUBLIC-IP>;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/linknest /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Now, visit `http://<YOUR-EC2-PUBLIC-IP>/api/health` in your browser. You will receive:
```json
{
  "database": "connected",
  "environment": "production",
  "service": "LinkNest API",
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## Phase 2: Deploy Frontend on AWS Amplify Hosting

AWS Amplify provides global CDN hosting with automated GitHub deployments for Vite Single-Page Applications (SPAs).

### Step 1: Open AWS Amplify Console
1. In the AWS Management Console, search for **AWS Amplify**.
2. Click **Host web app** (or **New app** → **Host web app**).
3. Select **GitHub** as the source code provider and click **Next**.
4. Authorize AWS Amplify to access your GitHub account.
5. Select:
   - **Repository**: `yuvaraju7718-max/LinkNest`
   - **Branch**: `main`
6. Check **"Connecting a monorepo or subfolder?"**:
   - Set root directory to: `frontend`

---

### Step 2: Configure Build Settings
Amplify automatically detects Vite. Verify the build specification (`amplify.yml`):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

### Step 3: Configure Environment Variables
In the **Advanced settings** section (or under **App settings** → **Environment variables** after creation):
- **Variable**: `VITE_API_BASE_URL`
- **Value**: `http://<YOUR-EC2-PUBLIC-IP>/api` *(or your custom domain HTTPS URL)*

Click **Save and deploy**.

Amplify will automatically pull your latest code from GitHub, run `npm run build`, and publish your application to a global URL (e.g., `https://main.d123456789.amplifyapp.com`).

---

### Step 4: Configure SPA Rewrites in Amplify
Because LinkNest is a client-side Single-Page Application (SPA), ensure 404s route back to `index.html`:
1. In the Amplify Console, go to **Hosting** → **Rewrites and redirects**.
2. Ensure there is a rule:
   - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - **Target address**: `/index.html`
   - **Type**: `200 (Rewrite)`

---

## Phase 3: Amazon S3 Private Attachments Setup (Optional)

LinkNest is 100% functional locally without S3. When you are ready to enable file attachments:

### Step 1: Create an S3 Bucket
1. Open the **Amazon S3** console → **Create bucket**.
2. **Bucket name**: e.g., `linknest-storage-<your-student-id>` (must be globally unique).
3. **Region**: `us-east-1` (match your EC2 region).
4. **Block Public Access settings**: Keep **Block *all* public access** checked! Objects remain 100% private.
5. Click **Create bucket**.

### Step 2: Add S3 CORS Policy
In your S3 bucket → **Permissions** tab → **Cross-origin resource sharing (CORS)**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://*.amplifyapp.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Step 3: Attach IAM Role to EC2 (Zero Hardcoded Keys!)
Rather than saving AWS secret keys in configuration files:
1. Open **IAM** → **Roles** → **Create role**.
2. Select **AWS service** → **EC2**.
3. Attach an inline policy granting minimum necessary permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<YOUR-BUCKET-NAME>/*"
    }
  ]
}
```
4. Name the role `LinkNest-EC2-S3-Role`.
5. Attach the role to your EC2 instance: **EC2 Console** → Select instance → **Actions** → **Security** → **Modify IAM role** → Select `LinkNest-EC2-S3-Role`.
6. Update `S3_BUCKET_NAME=<YOUR-BUCKET-NAME>` in `backend/.env` on EC2, and restart the service (`sudo systemctl restart linknest`).

---

## Phase 4: AWS Cost Management & Guardrails

As a student, safeguarding against unintended cloud charges is paramount:

### 1. Set Up an AWS Zero-Spend Budget Alert
1. In the AWS Console, search for **AWS Budgets**.
2. Click **Create budget** → select **Zero spend budget**.
3. Enter your email address to receive immediate alerts whenever costs exceed **$0.01**.

### 2. Stopping vs Terminating Resources
- **When testing is finished for the day**: Go to **EC2** → select your instance → **Instance state** → **Stop instance**. A stopped instance incurs zero compute charges.
- **When completely done with the project**: Select **Terminate instance** to delete the EC2 instance and its attached volume.
- **Delete S3 bucket contents**: S3 buckets must be emptied before deletion.
- **Delete Amplify App**: Open Amplify → **Actions** → **Delete app**.
