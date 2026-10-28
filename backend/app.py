import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Link, Collection
from routes.links import links_bp
from routes.collections import collections_bp
from routes.meta import meta_bp
from routes.uploads import uploads_bp
from services.s3_service import is_s3_configured
from seed import seed_sample_data

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "linknest-dev-fallback-secret-2026")
    db_uri = os.getenv("DATABASE_URL", "sqlite:///linknest.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # CORS Configuration
    cors_origins_env = os.getenv("CORS_ORIGINS", "*")
    if cors_origins_env == "*":
        allowed_origins = "*"
    else:
        allowed_origins = [orig.strip() for orig in cors_origins_env.split(",") if orig.strip()]

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )

    # Initialize extensions
    db.init_app(app)

    # Register blueprints with /api prefix
    app.register_blueprint(links_bp, url_prefix="/api")
    app.register_blueprint(collections_bp, url_prefix="/api")
    app.register_blueprint(meta_bp, url_prefix="/api")
    app.register_blueprint(uploads_bp, url_prefix="/api")

    # Global Health Check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_status = "connected"
        try:
            # Simple query to verify DB connectivity
            db.session.execute(db.text("SELECT 1"))
        except Exception as e:
            db_status = f"error: {str(e)}"

        return jsonify({
            "status": "healthy" if "error" not in db_status else "degraded",
            "database": db_status,
            "version": "1.0.0",
            "service": "LinkNest API",
            "s3_configured": is_s3_configured(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "environment": os.getenv("FLASK_ENV", "development")
        }), 200

    # Reset/reload sample data endpoint (for testing & demo)
    @app.route("/api/reset-sample-data", methods=["POST"])
    def reset_sample_data():
        try:
            # Delete only sample links and sample collections
            Link.query.filter_by(is_sample=True).delete()
            Collection.query.filter_by(is_sample=True).delete()
            db.session.commit()
            seed_sample_data()
            return jsonify({"message": "Sample data successfully restored", "success": True}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e), "success": False}), 500

    # Global error handlers
    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "Resource not found", "path": request.path}), 404

    @app.errorhandler(500)
    def handle_server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # Create tables and seed data within application context
    with app.app_context():
        db.create_all()
        try:
            seed_sample_data()
        except Exception as e:
            print(f"Seed note: {e}")

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
