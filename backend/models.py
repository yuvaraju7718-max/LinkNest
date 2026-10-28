from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from urllib.parse import urlparse

db = SQLAlchemy()

def normalize_url(url: str) -> str:
    """
    Carefully normalizes a URL by trimming whitespace, lowercasing scheme and domain,
    removing trailing slash, and stripping standard tracking query params (utm_*, ref, etc.)
    without altering essential query parameters.
    """
    if not url:
        return ""
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]
    
    # Strip tracking params from query string if present
    query_parts = []
    if parsed.query:
        for param in parsed.query.split("&"):
            if param:
                key = param.split("=")[0].lower()
                if key not in {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid"}:
                    query_parts.append(param)
    
    clean_query = "&".join(query_parts)
    path = parsed.path.rstrip("/")
    if not path and not clean_query:
        normalized = f"{scheme}://{netloc}"
    elif clean_query:
        normalized = f"{scheme}://{netloc}{path}?{clean_query}"
    else:
        normalized = f"{scheme}://{netloc}{path}"

    return normalized

class Collection(db.Model):
    __tablename__ = "collections"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(30), default="#6366f1")
    icon = db.Column(db.String(50), default="Folder")
    is_sample = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    links = db.relationship("Link", backref="collection", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_count=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description or "",
            "color": self.color or "#6366f1",
            "icon": self.icon or "Folder",
            "is_sample": self.is_sample,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_count:
            data["links_count"] = len(self.links) if self.links else 0
        return data


class Link(db.Model):
    __tablename__ = "links"

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, nullable=False)
    normalized_url = db.Column(db.String(500), index=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    domain = db.Column(db.String(120), nullable=True)
    description = db.Column(db.Text, nullable=True)
    personal_notes = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(60), default="General", nullable=False)
    collection_id = db.Column(db.Integer, db.ForeignKey("collections.id", ondelete="SET NULL"), nullable=True)
    tags = db.Column(db.String(255), nullable=True)  # Comma-separated tags
    reading_status = db.Column(db.String(30), default="unread", nullable=False)  # unread, reading, completed
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    
    # S3 file attachment metadata
    attachment_key = db.Column(db.String(255), nullable=True)
    attachment_name = db.Column(db.String(255), nullable=True)
    attachment_size = db.Column(db.Integer, nullable=True)
    attachment_type = db.Column(db.String(100), nullable=True)

    is_sample = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def get_tags_list(self):
        if not self.tags:
            return []
        return [t.strip() for t in self.tags.split(",") if t.strip()]

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "normalized_url": self.normalized_url,
            "title": self.title,
            "domain": self.domain or "",
            "description": self.description or "",
            "personal_notes": self.personal_notes or "",
            "category": self.category,
            "collection_id": self.collection_id,
            "collection_name": self.collection.name if self.collection else None,
            "tags": self.get_tags_list(),
            "reading_status": self.reading_status,
            "is_favorite": self.is_favorite,
            "attachment": {
                "key": self.attachment_key,
                "name": self.attachment_name,
                "size": self.attachment_size,
                "type": self.attachment_type,
            } if self.attachment_key else None,
            "is_sample": self.is_sample,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
