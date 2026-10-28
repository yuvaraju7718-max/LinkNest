from flask import Blueprint, request, jsonify
from services.s3_service import generate_presigned_upload, is_s3_configured

uploads_bp = Blueprint("uploads", __name__)

@uploads_bp.route("/uploads/status", methods=["GET"])
def upload_status():
    return jsonify({
        "s3_configured": is_s3_configured()
    })

@uploads_bp.route("/uploads/presign", methods=["POST"])
def presign_upload():
    data = request.get_json() or {}
    filename = data.get("filename", "").strip()
    content_type = data.get("content_type", "").strip()

    if not filename:
        return jsonify({"error": "Filename is required"}), 400

    result = generate_presigned_upload(filename, content_type)
    if "error" in result:
        # Return 200 with error info so frontend can display friendly message without crashing
        return jsonify(result), 200

    return jsonify(result), 200
