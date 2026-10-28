from models import db, Collection, Link, normalize_url

def seed_sample_data():
    """
    Seeds initial realistic sample resources for demonstration.
    Only seeds if the database is currently empty.
    All sample resources are marked with is_sample=True.
    """
    if Link.query.first() is not None:
        return

    print("Seeding initial sample data for LinkNest...")

    # Collections
    c_aws = Collection(
        name="AWS & Cloud",
        description="Cloud architecture guides, deployment walkthroughs, and serverless tutorials",
        color="#f59e0b",
        icon="Cloud",
        is_sample=True
    )
    c_python = Collection(
        name="Python & Flask",
        description="Python backend engineering, REST APIs, and database patterns",
        color="#3b82f6",
        icon="Code2",
        is_sample=True
    )
    c_frontend = Collection(
        name="Modern Web UI",
        description="React patterns, Tailwind CSS components, and web design inspiration",
        color="#8b5cf6",
        icon="Layout",
        is_sample=True
    )
    c_system_design = Collection(
        name="System Design",
        description="Scalability case studies, distributed systems, and database optimization",
        color="#10b981",
        icon="Cpu",
        is_sample=True
    )

    db.session.add_all([c_aws, c_python, c_frontend, c_system_design])
    db.session.commit()

    sample_links = [
        Link(
            url="https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html",
            normalized_url=normalize_url("https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html"),
            title="AWS Amplify Hosting Documentation",
            domain="docs.aws.amazon.com",
            description="Complete official documentation on deploying single-page React applications with CI/CD on AWS Amplify.",
            personal_notes="Crucial reference for setting up custom build commands, Vite environment variables, and branch preview deployments.",
            category="Documentation",
            collection_id=c_aws.id,
            tags="aws, amplify, hosting, deployment, vite",
            reading_status="completed",
            is_favorite=True,
            is_sample=True
        ),
        Link(
            url="https://flask.palletsprojects.com/en/stable/tutorial/views/",
            normalized_url=normalize_url("https://flask.palletsprojects.com/en/stable/tutorial/views/"),
            title="Flask Blueprints & REST API Patterns",
            domain="flask.palletsprojects.com",
            description="Official tutorial explaining Blueprints, route modularization, and application factories in Flask.",
            personal_notes="Great structure reference for organizing routes into separate modules like links, collections, and uploads.",
            category="Documentation",
            collection_id=c_python.id,
            tags="flask, python, rest-api, backend",
            reading_status="completed",
            is_favorite=True,
            is_sample=True
        ),
        Link(
            url="https://www.youtube.com/watch?v=KeZxteB_w-Q",
            normalized_url=normalize_url("https://www.youtube.com/watch?v=KeZxteB_w-Q"),
            title="Deploying Flask Apps with Gunicorn and Nginx on AWS EC2",
            domain="youtube.com",
            description="Step-by-step video guide explaining systemd service creation, socket binding, and reverse proxy setup on Ubuntu EC2.",
            personal_notes="Watch before configuring production EC2 instance. The section on systemd automatic restarts after reboot is gold.",
            category="YouTube",
            collection_id=c_aws.id,
            tags="youtube, ec2, gunicorn, nginx, devops",
            reading_status="reading",
            is_favorite=True,
            is_sample=True
        ),
        Link(
            url="https://github.com/donnemartin/system-design-primer",
            normalized_url=normalize_url("https://github.com/donnemartin/system-design-primer"),
            title="The System Design Primer - GitHub",
            domain="github.com",
            description="Comprehensive open-source collection of system design concepts, microservice architectures, and interview patterns.",
            personal_notes="Review the database caching and S3 pre-signed URL patterns for high-throughput media uploads.",
            category="GitHub",
            collection_id=c_system_design.id,
            tags="github, architecture, scalability, open-source",
            reading_status="reading",
            is_favorite=True,
            is_sample=True
        ),
        Link(
            url="https://lucide.dev/icons/",
            normalized_url=normalize_url("https://lucide.dev/icons/"),
            title="Lucide Icons Directory & Search",
            domain="lucide.dev",
            description="Beautiful, consistent open-source iconography library built for modern React and web applications.",
            personal_notes="Used for every navigation element, action icon, and status badge across LinkNest.",
            category="Tools",
            collection_id=c_frontend.id,
            tags="icons, react, ui-ux, design",
            reading_status="unread",
            is_favorite=False,
            is_sample=True
        ),
        Link(
            url="https://aws.amazon.com/s3/pricing/",
            normalized_url=normalize_url("https://aws.amazon.com/s3/pricing/"),
            title="Amazon S3 Pricing & Free Tier Limits",
            domain="aws.amazon.com",
            description="Official AWS S3 storage pricing, request tier costs, and 5GB Free Tier tier details.",
            personal_notes="Check this to calculate monthly cost estimates and configure the budget alert before attaching the S3 bucket.",
            category="Articles",
            collection_id=c_aws.id,
            tags="aws, s3, pricing, cost-control",
            reading_status="unread",
            is_favorite=False,
            is_sample=True
        )
    ]

    db.session.add_all(sample_links)
    db.session.commit()
    print("Sample data seeded successfully!")
