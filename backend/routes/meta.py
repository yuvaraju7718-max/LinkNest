from flask import Blueprint, request, jsonify
from services.metadata_service import fetch_url_metadata

meta_bp = Blueprint("meta", __name__)

@meta_bp.route("/meta/extract", methods=["POST"])
def extract_metadata():
    data = request.get_json() or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "URL is required"}), 400

    metadata = fetch_url_metadata(url)
    return jsonify(metadata), 200
