# LinkNest REST API Documentation

The LinkNest backend is a Python Flask REST API connected to SQLite via SQLAlchemy. It includes complete endpoints for resource management, collection curation, URL normalization and duplicate detection, auto-extraction of webpage metadata, and optional Amazon S3 presigned attachments.

Base URL (Local): `http://localhost:5000/api`

---

## 1. System & Health

### `GET /health`
Returns the status of the API, database connectivity, and optional Amazon S3 configuration.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0",
  "service": "LinkNest API",
  "s3_configured": false,
  "environment": "development",
  "timestamp": "2026-10-28T18:00:00.000000+00:00"
}
```

### `GET /stats`
Returns aggregated library statistics for the dashboard.

**Response `200 OK`**:
```json
{
  "total_links": 6,
  "total_collections": 4,
  "favorites_count": 4,
  "unread_count": 2,
  "reading_count": 2,
  "completed_count": 2,
  "categories": {
    "Documentation": 2,
    "YouTube": 1,
    "GitHub": 1,
    "Tools": 1,
    "Articles": 1
  }
}
```

### `POST /reset-sample-data`
Restores demonstration sample data (`is_sample=true`) without altering user-created links.

---

## 2. Links Management

### `GET /links`
Retrieves saved links with optional query filtering and sorting.

**Query Parameters**:
- `category` (string, optional): Filter by category (e.g. `YouTube`, `GitHub`, `Articles`).
- `collection_id` (integer, optional): Filter by collection ID.
- `favorite` (boolean string `true`/`false`, optional): Filter starred favorites.
- `status` (string, optional): Filter by reading status (`unread`, `reading`, `completed`).
- `sort_by` (string, optional): `newest` (default), `oldest`, `title_asc`, `title_desc`.

**Response `200 OK`**:
```json
{
  "count": 1,
  "links": [
    {
      "id": 1,
      "url": "https://flask.palletsprojects.com/en/stable/",
      "normalized_url": "https://flask.palletsprojects.com/en/stable",
      "title": "Flask Documentation",
      "domain": "flask.palletsprojects.com",
      "description": "Official documentation for Flask web framework.",
      "personal_notes": "Great guide for Blueprint and factory patterns.",
      "category": "Documentation",
      "collection_id": 1,
      "collection_name": "Python & Flask",
      "tags": ["flask", "python", "rest-api"],
      "reading_status": "completed",
      "is_favorite": true,
      "attachment": null,
      "is_sample": true,
      "created_at": "2026-10-28T18:00:00+00:00",
      "updated_at": "2026-10-28T18:00:00+00:00"
    }
  ]
}
```

### `GET /links/check-duplicate?url=<encoded_url>`
Checks whether a given URL has already been saved.

**Response `200 OK` (Duplicate Found)**:
```json
{
  "is_duplicate": true,
  "message": "This URL is already saved as 'Flask Documentation'",
  "existing_link": { "id": 1, "title": "Flask Documentation" }
}
```

### `POST /links`
Saves a new link into the database. Automatically normalizes the URL and guards against duplicate entries unless `force_duplicate` is `true`.

**Request Body**:
```json
{
  "url": "https://lucide.dev/icons/",
  "title": "Lucide Icons Directory",
  "description": "Consistent icon library for modern React web projects.",
  "personal_notes": "Used across all LinkNest navigational elements.",
  "category": "Tools",
  "collection_id": 3,
  "tags": ["icons", "react", "ui"],
  "reading_status": "unread",
  "is_favorite": false,
  "force_duplicate": false
}
```

**Response `201 Created`**:
```json
{
  "message": "Link successfully created",
  "link": { "id": 7, "title": "Lucide Icons Directory", ... }
}
```

**Response `409 Conflict` (Duplicate URL)**:
```json
{
  "error": "DUPLICATE_URL",
  "message": "This link is already in your library as 'Lucide Icons Directory'.",
  "existing_id": 5,
  "existing_title": "Lucide Icons Directory & Search"
}
```

### `GET /links/<id>`
Retrieves a single link by ID. If an S3 attachment key is attached, includes a temporary presigned download URL.

### `PUT /links/<id>`
Updates an existing link's attributes (title, notes, tags, category, reading status, attachment).

### `DELETE /links/<id>`
Deletes a link permanently.

### `PATCH /links/<id>/favorite`
Toggles the `is_favorite` flag.

### `PATCH /links/<id>/status`
Updates reading status to `unread`, `reading`, or `completed`.

---

## 3. Search

### `GET /search?q=<query_term>`
Full-text search across titles, URLs, descriptions, personal notes, categories, and tags.

---

## 4. Collections Management

### `GET /collections`
Lists all collections with link count.

### `POST /collections`
Creates a new collection.
```json
{
  "name": "Cloud Architecture",
  "description": "AWS EC2, S3, and Amplify walkthroughs",
  "color": "#8b5cf6",
  "icon": "Cloud"
}
```

### `PUT /collections/<id>`
Updates collection name, description, color, or icon.

### `DELETE /collections/<id>`
Deletes collection. Linked resources are not deleted; their `collection_id` is safely set to `NULL`.

---

## 5. Webpage Metadata & S3 Attachments

### `POST /meta/extract`
Fetches page title and meta description for a given URL.
```json
{
  "url": "https://aws.amazon.com/ec2/"
}
```

### `GET /uploads/status`
Returns whether Amazon S3 configuration is active on the server.

### `POST /uploads/presign`
Generates a 5-minute pre-signed S3 `PUT` upload URL and object key for direct client-to-S3 file uploads.
