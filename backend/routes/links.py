from flask import Blueprint, request, jsonify
from urllib.parse import urlparse
from models import db, Link, Collection, normalize_url
from services.metadata_service import extract_domain
from services.s3_service import generate_presigned_download

links_bp = Blueprint("links", __name__)

def is_valid_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    try:
        full_url = url if "://" in url else "https://" + url
        parsed = urlparse(full_url)
        if parsed.scheme not in ("http", "https"):
            return False
        netloc = parsed.netloc.split(":")[0]
        if not netloc:
            return False
        if netloc in ("localhost", "127.0.0.1"):
            return True
        return "." in netloc and len(netloc.split(".")[-1]) >= 2
    except Exception:
        return False

@links_bp.route("/links", methods=["GET"])
def get_links():
    query = Link.query

    # Category filter
    category = request.args.get("category")
    if category and category.lower() != "all":
        query = query.filter(Link.category == category)

    # Collection filter
    collection_id = request.args.get("collection_id")
    if collection_id and collection_id.isdigit():
        query = query.filter(Link.collection_id == int(collection_id))

    # Favorite filter
    favorite = request.args.get("favorite")
    if favorite is not None:
        if favorite.lower() in ("true", "1"):
            query = query.filter(Link.is_favorite.is_(True))
        elif favorite.lower() in ("false", "0"):
            query = query.filter(Link.is_favorite.is_(False))

    # Reading status filter
    reading_status = request.args.get("status")
    if reading_status and reading_status.lower() != "all":
        query = query.filter(Link.reading_status == reading_status.lower())

    # Sorting
    sort_by = request.args.get("sort_by", "newest")
    if sort_by == "oldest":
        query = query.order_by(Link.created_at.asc())
    elif sort_by == "title_asc":
        query = query.order_by(Link.title.asc())
    elif sort_by == "title_desc":
        query = query.order_by(Link.title.desc())
    else:  # newest default
        query = query.order_by(Link.created_at.desc())

    links = query.all()
    results = []
    for link in links:
        data = link.to_dict()
        if link.attachment_key:
            data["attachment"]["download_url"] = generate_presigned_download(link.attachment_key)
        results.append(data)

    return jsonify({"count": len(results), "links": results})

@links_bp.route("/links/check-duplicate", methods=["GET"])
def check_duplicate():
    raw_url = request.args.get("url", "").strip()
    if not raw_url:
        return jsonify({"is_duplicate": False, "message": "No URL provided"}), 200

    norm_url = normalize_url(raw_url)
    existing = Link.query.filter_by(normalized_url=norm_url).first()
    if existing:
        return jsonify({
            "is_duplicate": True,
            "existing_link": existing.to_dict(),
            "message": f"This URL is already saved as '{existing.title}'"
        }), 200

    return jsonify({"is_duplicate": False}), 200

@links_bp.route("/links", methods=["POST"])
def create_link():
    data = request.get_json() or {}

    raw_url = data.get("url", "").strip()
    if not raw_url:
        return jsonify({"error": "URL is required"}), 400

    if not is_valid_url(raw_url):
        return jsonify({"error": "Invalid URL format. Please provide a valid HTTP/HTTPS URL."}), 400

    norm_url = normalize_url(raw_url)

    # Duplicate check unless explicitly forced
    force = data.get("force_duplicate", False)
    if not force:
        existing = Link.query.filter_by(normalized_url=norm_url).first()
        if existing:
            return jsonify({
                "error": "DUPLICATE_URL",
                "message": f"This link is already in your library as '{existing.title}'.",
                "existing_id": existing.id,
                "existing_title": existing.title
            }), 409

    title = data.get("title", "").strip()
    domain = extract_domain(raw_url)
    if not title:
        title = domain or "Untitled Resource"

    # Category validation
    valid_categories = {
        "YouTube", "Articles", "GitHub", "Documentation", 
        "Tools", "Online Courses", "General"
    }
    category = data.get("category", "General")
    if category not in valid_categories:
        category = "General"

    # Reading status validation
    reading_status = data.get("reading_status", "unread").lower()
    if reading_status not in ("unread", "reading", "completed"):
        reading_status = "unread"

    # Collection validation
    collection_id = data.get("collection_id")
    if collection_id is not None:
        if str(collection_id).isdigit():
            collection_id = int(collection_id)
            if not db.session.get(Collection, collection_id):
                collection_id = None
        else:
            collection_id = None

    # Tags formatting
    raw_tags = data.get("tags", "")
    if isinstance(raw_tags, list):
        tags_str = ", ".join([str(t).strip() for t in raw_tags if str(t).strip()])
    else:
        tags_str = str(raw_tags).strip()

    attachment = data.get("attachment") or {}

    new_link = Link(
        url=raw_url,
        normalized_url=norm_url,
        title=title,
        domain=domain,
        description=data.get("description", "").strip(),
        personal_notes=data.get("personal_notes", "").strip(),
        category=category,
        collection_id=collection_id,
        tags=tags_str,
        reading_status=reading_status,
        is_favorite=bool(data.get("is_favorite", False)),
        attachment_key=attachment.get("key"),
        attachment_name=attachment.get("name"),
        attachment_size=attachment.get("size"),
        attachment_type=attachment.get("type"),
        is_sample=False
    )

    db.session.add(new_link)
    db.session.commit()

    return jsonify({
        "message": "Link successfully created",
        "link": new_link.to_dict()
    }), 201

@links_bp.route("/links/<int:link_id>", methods=["GET"])
def get_link(link_id):
    link = db.session.get(Link, link_id)
    if not link:
        return jsonify({"error": "Link not found"}), 404

    data = link.to_dict()
    if link.attachment_key:
        data["attachment"]["download_url"] = generate_presigned_download(link.attachment_key)

    return jsonify({"link": data})

@links_bp.route("/links/<int:link_id>", methods=["PUT"])
def update_link(link_id):
    link = db.session.get(Link, link_id)
    if not link:
        return jsonify({"error": "Link not found"}), 404

    data = request.get_json() or {}

    if "url" in data:
        raw_url = data["url"].strip()
        if not is_valid_url(raw_url):
            return jsonify({"error": "Invalid URL format"}), 400
        link.url = raw_url
        link.normalized_url = normalize_url(raw_url)
        link.domain = extract_domain(raw_url)

    if "title" in data and data["title"].strip():
        link.title = data["title"].strip()

    if "description" in data:
        link.description = data["description"].strip()

    if "personal_notes" in data:
        link.personal_notes = data["personal_notes"].strip()

    if "category" in data:
        link.category = data["category"]

    if "collection_id" in data:
        cid = data["collection_id"]
        if cid and str(cid).isdigit():
            link.collection_id = int(cid) if db.session.get(Collection, int(cid)) else None
        else:
            link.collection_id = None

    if "tags" in data:
        raw_tags = data["tags"]
        if isinstance(raw_tags, list):
            link.tags = ", ".join([str(t).strip() for t in raw_tags if str(t).strip()])
        else:
            link.tags = str(raw_tags).strip()

    if "reading_status" in data:
        status = data["reading_status"].lower()
        if status in ("unread", "reading", "completed"):
            link.reading_status = status

    if "is_favorite" in data:
        link.is_favorite = bool(data["is_favorite"])

    if "attachment" in data:
        att = data["attachment"]
        if att is None:
            link.attachment_key = None
            link.attachment_name = None
            link.attachment_size = None
            link.attachment_type = None
        elif isinstance(att, dict):
            link.attachment_key = att.get("key")
            link.attachment_name = att.get("name")
            link.attachment_size = att.get("size")
            link.attachment_type = att.get("type")

    db.session.commit()
    return jsonify({"message": "Link updated successfully", "link": link.to_dict()})

@links_bp.route("/links/<int:link_id>", methods=["DELETE"])
def delete_link(link_id):
    link = db.session.get(Link, link_id)
    if not link:
        return jsonify({"error": "Link not found"}), 404

    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": "Link deleted successfully", "id": link_id}), 200

@links_bp.route("/links/<int:link_id>/favorite", methods=["PATCH"])
def toggle_favorite(link_id):
    link = db.session.get(Link, link_id)
    if not link:
        return jsonify({"error": "Link not found"}), 404

    link.is_favorite = not link.is_favorite
    db.session.commit()
    return jsonify({"id": link.id, "is_favorite": link.is_favorite})

@links_bp.route("/links/<int:link_id>/status", methods=["PATCH"])
def update_status(link_id):
    link = db.session.get(Link, link_id)
    if not link:
        return jsonify({"error": "Link not found"}), 404

    data = request.get_json() or {}
    new_status = data.get("reading_status", "").lower()
    if new_status not in ("unread", "reading", "completed"):
        return jsonify({"error": "Invalid status. Allowed: unread, reading, completed"}), 400

    link.reading_status = new_status
    db.session.commit()
    return jsonify({"id": link.id, "reading_status": link.reading_status})

@links_bp.route("/search", methods=["GET"])
def search_links():
    term = request.args.get("q", "").strip()
    if not term:
        return jsonify({"count": 0, "links": []})

    like_term = f"%{term}%"
    results = Link.query.filter(
        db.or_(
            Link.title.ilike(like_term),
            Link.url.ilike(like_term),
            Link.description.ilike(like_term),
            Link.personal_notes.ilike(like_term),
            Link.tags.ilike(like_term),
            Link.category.ilike(like_term),
        )
    ).order_by(Link.created_at.desc()).all()

    return jsonify({
        "query": term,
        "count": len(results),
        "links": [link.to_dict() for link in results]
    })

@links_bp.route("/stats", methods=["GET"])
def get_stats():
    total_links = Link.query.count()
    total_collections = Collection.query.count()
    favorites_count = Link.query.filter_by(is_favorite=True).count()
    unread_count = Link.query.filter_by(reading_status="unread").count()
    reading_count = Link.query.filter_by(reading_status="reading").count()
    completed_count = Link.query.filter_by(reading_status="completed").count()

    # Category counts
    categories = ["YouTube", "Articles", "GitHub", "Documentation", "Tools", "Online Courses", "General"]
    cat_counts = {}
    for cat in categories:
        cnt = Link.query.filter_by(category=cat).count()
        if cnt > 0:
            cat_counts[cat] = cnt

    return jsonify({
        "total_links": total_links,
        "total_collections": total_collections,
        "favorites_count": favorites_count,
        "unread_count": unread_count,
        "reading_count": reading_count,
        "completed_count": completed_count,
        "categories": cat_counts
    })
