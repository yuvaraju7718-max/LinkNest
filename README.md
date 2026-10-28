# LinkNest — Your Personal Internet Library

> Save, organize, and retrieve YouTube tutorials, technical articles, GitHub repositories, and documentation from one central location — with the context on **what you saved and why you saved it**.

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?logo=react)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Backend-Python%20Flask-000000?logo=flask)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57?logo=sqlite)](https://www.sqlite.org/)
[![AWS Amplify](https://img.shields.io/badge/Deploy-AWS%20Amplify-FF9900?logo=awsamplify)](https://aws.amazon.com/amplify/)
[![Amazon EC2](https://img.shields.io/badge/Host-Amazon%20EC2-FF9900?logo=amazonec2)](https://aws.amazon.com/ec2/)
[![Amazon S3](https://img.shields.io/badge/Storage-Amazon%20S3-569A31?logo=amazons3)](https://aws.amazon.com/s3/)

---

## 🚀 Key Features

- **💡 Personal Notes ("Why I Saved This")**: Every bookmark includes dedicated personal notes so you remember the exact takeaway or reference point.
- **🛡️ Smart Duplicate Detection**: Real-time URL normalization detects if a link is already in your library and offers to open the existing resource.
- **⚡ Automated Metadata Extraction**: Automatically fetches page titles, descriptions, and domains from web pages.
- **📚 Curated Collections**: Organize resources into themed folders (AWS & Cloud, Python, Web UI, System Design) with custom colors and icons.
- **📖 Reading & Learning Pipeline**: Track status from *Unread* to *In Progress* to *Completed* with visual breakdown statistics.
- **🔍 Instant Search & Multi-Filters**: Filter by category (YouTube, Articles, GitHub, Docs, Tools, Online Courses), tags, collections, and starred favorites.
- **📎 Private S3 Attachments**: Optional direct uploads to Amazon S3 using secure, short-lived presigned URLs.
- **🌓 Dark & Light Modes**: Polished modern productivity UI supporting deep navy dark theme and crisp light theme with instant toggling.
- **☁️ Cloud Deployment Ready**: Preconfigured for AWS Amplify (frontend SPA), Amazon EC2 Ubuntu (Flask + Gunicorn + Nginx + systemd), and Amazon S3.

---

## 📁 Project Architecture

```
LinkNest/
├── frontend/                     # React + Vite Single-Page Application
│   ├── src/
│   │   ├── components/           # UI Components (Navbar, Sidebar, LinkCard, Modals)
│   │   ├── pages/                # Views (Landing, Dashboard, All Links, Collections, Favorites, Reading List, Settings)
│   │   ├── context/              # Toast & Theme Context Providers
│   │   ├── services/api.js       # Centralized REST API Client
│   │   └── styles/index.css      # Tailwind CSS & Design System
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/                      # Python Flask REST API
│   ├── app.py                    # Application Factory & Health Endpoints
│   ├── models.py                 # SQLAlchemy Models (Link, Collection)
│   ├── seed.py                   # Initial Realistic Sample Demonstration Data
│   ├── routes/                   # Modular Blueprints (links, collections, meta, uploads)
│   ├── services/                 # Metadata extraction & S3 presigned URL engine
│   ├── test_api.py               # Automated Unit Test Suite
│   ├── requirements.txt
│   └── linknest.db               # Local SQLite Database
├── docs/
│   ├── API.md                    # Complete REST API Specification
│   └── AWS_DEPLOYMENT.md         # Step-by-Step AWS Deployment Walkthrough
└── README.md
```

---

## 💻 Local Setup & Development

Follow these steps in your VS Code terminal to run LinkNest locally.

### 1. Prerequisites
- **Node.js**: v18+ (verified on v24)
- **Python**: 3.10+ (verified on v3.13)
- **Git**

---

### 2. Run the Backend (Flask API)

Open a terminal in VS Code:

```powershell
# Navigate into backend directory
cd backend

# Create Python virtual environment (if not already created)
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
# source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Start the Flask API server
python app.py
```

The Flask API will start at **`http://localhost:5000`** and will automatically initialize the database and seed demonstration resources.

Verify API health:
- Visit `http://localhost:5000/api/health`

---

### 3. Run the Frontend (React + Vite)

Open a **second** terminal window in VS Code:

```powershell
# Navigate into frontend directory
cd frontend

# Install node packages (if not already done)
npm install

# Start the Vite development server
npm run dev
```

The Vite dev server will launch at **`http://localhost:5173`**.

Open **`http://localhost:5173`** in your browser to start using LinkNest!

---

## 🧪 Running Automated Tests

Run the backend unit test suite:

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest test_api.py
```

Test the frontend build:

```powershell
cd frontend
npm run build
```

---

## ☁️ AWS Deployment Overview

LinkNest is structured for smooth deployment to AWS:

1. **Frontend**: Deploy to **AWS Amplify Hosting** with automatic GitHub CI/CD, connected to `frontend/dist`.
2. **Backend**: Host on **Amazon EC2 (Ubuntu 24.04)** running Gunicorn WSGI behind Nginx with automatic systemd restart on reboot.
3. **Storage**: Attach an **Amazon S3** private bucket using IAM role-based presigned URLs (no hardcoded keys).

👉 See [**`docs/AWS_DEPLOYMENT.md`**](file:///c:/Users/yuvar/OneDrive/Desktop/WEB/docs/AWS_DEPLOYMENT.md) for full step-by-step instructions with AWS Free Tier tips and Zero-Spend Budget Alerts.

---

## 📄 License
MIT License. Built for students, developers, and knowledge curators.
