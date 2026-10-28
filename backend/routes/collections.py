from flask import Blueprint, request, jsonify
from models import db, Collection, Link
from services.s3_service import generate_presigned_download

collections_bp = Blueprint("collections", __name__)

@collections_bp.route("/collections", methods=["GET"])
def get_collections():
    collections = Collection.query.order_by(Collection.name.asc()).all()
    return jsonify({
        "count": len(collections),
        "collections": [c.to_dict(include_count=True) for c in collections]
    })

@collections_bp.route("/collections", methods=["POST"])
def create_collection():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Collection name is required"}), 400

    existing = Collection.query.filter(db.func.lower(Collection.name) == name.lower()).first()
    if existing:
        return jsonify({"error": f"A collection named '{name}' already exists."}), 409

    new_collection = Collection(
        name=name,
        description=data.get("description", "").strip(),
        color=data.get("color", "#6366f1"),
        icon=data.get("icon", "Folder"),
        is_sample=False
    )

    db.session.add(new_collection)
    db.session.commit()

    return jsonify({
        "message": "Collection created successfully",
        "collection": new_collection.to_dict()
    }), 201

@collections_bp.route("/collections/<int:collection_id>", methods=["GET"])
def get_collection(collection_id):
    collection = db.session.get(Collection, collection_id)
    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    links = Link.query.filter_by(collection_id=collection.id).order_by(Link.created_at.desc()).all()
    links_data = []
    for l in links:
        d = l.to_dict()
        if l.attachment_key:
            d["attachment"]["download_url"] = generate_presigned_download(l.attachment_key)
        links_data.append(d)

    return jsonify({
        "collection": collection.to_dict(include_count=True),
        "links": links_data
    })

@collections_bp.route("/collections/<int:collection_id>", methods=["PUT"])
def update_collection(collection_id):
    collection = db.session.get(Collection, collection_id)
    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    data = request.get_json() or {}
    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "Collection name cannot be empty"}), 400
        # Check uniqueness with other collections
        existing = Collection.query.filter(
            db.func.lower(Collection.name) == name.lower(),
            Collection.id != collection_id
        ).first()
        if existing:
            return jsonify({"error": f"A collection named '{name}' already exists."}), 409
        collection.name = name

    if "description" in data:
        collection.description = data["description"].strip()

    if "color" in data:
        collection.color = data["color"].strip()

    if "icon" in data:
        collection.icon = data["icon"].strip()

    db.session.commit()
    return jsonify({
        "message": "Collection updated successfully",
        "collection": collection.to_dict()
    })

@collections_bp.route("/collections/<int:collection_id>", methods=["DELETE"])
def delete_collection(collection_id):
    collection = db.session.get(Collection, collection_id)
    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    # Any links in this collection will have their collection_id set to NULL due to SET NULL foreign key
    db.session.delete(collection)
    db.session.commit()
    return jsonify({"message": "Collection deleted successfully", "id": collection_id}), 200
