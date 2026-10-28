import unittest
import json
from flask import Flask
from models import db, Link, Collection
from routes.links import links_bp
from routes.collections import collections_bp
from routes.meta import meta_bp
from routes.uploads import uploads_bp

class LinkNestApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        db.init_app(self.app)
        self.app.register_blueprint(links_bp, url_prefix="/api")
        self.app.register_blueprint(collections_bp, url_prefix="/api")
        self.app.register_blueprint(meta_bp, url_prefix="/api")
        self.app.register_blueprint(uploads_bp, url_prefix="/api")

        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_01_create_and_get_link(self):
        payload = {
            "url": "https://fastapi.tiangolo.com/tutorial/",
            "title": "FastAPI Tutorial Documentation",
            "description": "Interactive API framework documentation.",
            "personal_notes": "Great modern Python backend comparison to Flask.",
            "category": "Documentation",
            "tags": ["python", "api", "async"],
            "reading_status": "unread",
            "is_favorite": True
        }
        res = self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        link_id = data["link"]["id"]

        # Fetch created link
        get_res = self.client.get(f"/api/links/{link_id}")
        self.assertEqual(get_res.status_code, 200)
        link_data = get_res.get_json()["link"]
        self.assertEqual(link_data["title"], "FastAPI Tutorial Documentation")
        self.assertTrue(link_data["is_favorite"])
        self.assertEqual(link_data["reading_status"], "unread")

    def test_02_duplicate_detection(self):
        url = "https://fastapi.tiangolo.com/tutorial/"
        # First save
        payload = {"url": url, "title": "FastAPI Docs"}
        res1 = self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res1.status_code, 201)

        # Attempt duplicate without force
        res2 = self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res2.status_code, 409)
        self.assertEqual(res2.get_json()["error"], "DUPLICATE_URL")

        # Test duplicate check endpoint
        chk_res = self.client.get(f"/api/links/check-duplicate?url={url}")
        self.assertEqual(chk_res.status_code, 200)
        self.assertTrue(chk_res.get_json()["is_duplicate"])

    def test_03_force_duplicate(self):
        url = "https://example.com/unique-guide"
        payload = {"url": url, "title": "Example Guide"}
        res1 = self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res1.status_code, 201)

        # Force save duplicate
        payload["force_duplicate"] = True
        res2 = self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res2.status_code, 201)

    def test_04_toggle_favorite_and_status(self):
        payload = {
            "url": "https://react.dev/learn",
            "title": "React Learn Docs",
            "is_favorite": False,
            "reading_status": "unread"
        }
        res = self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        link_id = res.get_json()["link"]["id"]

        # Toggle favorite
        fav_res = self.client.patch(f"/api/links/{link_id}/favorite")
        self.assertEqual(fav_res.status_code, 200)
        self.assertTrue(fav_res.get_json()["is_favorite"])

        # Change status to completed
        st_res = self.client.patch(
            f"/api/links/{link_id}/status",
            data=json.dumps({"reading_status": "completed"}),
            content_type="application/json"
        )
        self.assertEqual(st_res.status_code, 200)
        self.assertEqual(st_res.get_json()["reading_status"], "completed")

    def test_05_search_links(self):
        payload = {
            "url": "https://kubernetes.io/docs/",
            "title": "Kubernetes Container Orchestration",
            "personal_notes": "Essential cloud architecture pattern",
            "tags": ["k8s", "devops"]
        }
        self.client.post("/api/links", data=json.dumps(payload), content_type="application/json")

        res = self.client.get("/api/search?q=Kubernetes")
        self.assertEqual(res.status_code, 200)
        links = res.get_json()["links"]
        self.assertEqual(len(links), 1)
        self.assertEqual(links[0]["title"], "Kubernetes Container Orchestration")

    def test_06_collection_crud(self):
        # Create collection
        col_res = self.client.post(
            "/api/collections",
            data=json.dumps({"name": "DevOps & Docker", "description": "Containerization guides", "color": "#06b6d4"}),
            content_type="application/json"
        )
        self.assertEqual(col_res.status_code, 201)
        col_id = col_res.get_json()["collection"]["id"]

        # Get list
        list_res = self.client.get("/api/collections")
        self.assertEqual(list_res.status_code, 200)
        self.assertEqual(list_res.get_json()["count"], 1)

        # Update
        up_res = self.client.put(
            f"/api/collections/{col_id}",
            data=json.dumps({"description": "Updated containerization guides"}),
            content_type="application/json"
        )
        self.assertEqual(up_res.status_code, 200)
        self.assertEqual(up_res.get_json()["collection"]["description"], "Updated containerization guides")

        # Delete
        del_res = self.client.delete(f"/api/collections/{col_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_07_invalid_url_rejected(self):
        res = self.client.post(
            "/api/links",
            data=json.dumps({"url": "invalid-not-a-url", "title": "Test"}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("Invalid URL format", res.get_json()["error"])

    def test_08_stats_endpoint(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total_links", data)
        self.assertIn("favorites_count", data)
        self.assertIn("unread_count", data)

if __name__ == "__main__":
    unittest.main()
