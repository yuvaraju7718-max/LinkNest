import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36 LinkNestBot/1.0"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def extract_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path
        if domain.startswith("www."):
            domain = domain[4:]
        return domain.split(":")[0]
    except Exception:
        return ""

def fetch_url_metadata(url: str, timeout: int = 5) -> dict:
    """
    Safely retrieves page title and description meta tags.
    Handles timeouts, invalid schemes, and unavailable pages gracefully.
    Always returns a dictionary with extracted or sensible fallback data.
    """
    domain = extract_domain(url)
    result = {
        "title": "",
        "description": "",
        "domain": domain,
        "success": False,
        "error": None
    }

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        if response.status_code >= 400:
            result["error"] = f"HTTP {response.status_code}"
            return result

        soup = BeautifulSoup(response.text[:200000], "html.parser")  # Parse first 200KB only

        # 1. Try Title
        title = None
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
        elif soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)

        # 2. Try Description
        description = None
        og_desc = soup.find("meta", property="og:description")
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if og_desc and og_desc.get("content"):
            description = og_desc["content"].strip()
        elif meta_desc and meta_desc.get("content"):
            description = meta_desc["content"].strip()

        result["title"] = title or domain or "Saved Resource"
        result["description"] = description or ""
        result["success"] = True

    except requests.exceptions.Timeout:
        result["error"] = "Request timed out"
    except requests.exceptions.RequestException as e:
        result["error"] = str(e)
    except Exception as e:
        result["error"] = str(e)

    # Provide fallback title if none found
    if not result["title"]:
        result["title"] = domain or "Saved Resource"

    return result
