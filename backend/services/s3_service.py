import os
import uuid
import boto3
from botocore.exceptions import BotoCoreError, ClientError

ALLOWED_EXTENSIONS = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "txt": "text/plain",
    "md": "text/markdown",
    "zip": "application/zip",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def is_s3_configured() -> bool:
    bucket = os.getenv("S3_BUCKET_NAME", "").strip()
    return bool(bucket)

def get_s3_client():
    region = os.getenv("AWS_REGION", "us-east-1")
    # If explicit credentials are provided, use them; otherwise boto3 automatically
    # falls back to EC2 instance metadata IAM role or ~/.aws credentials
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    if access_key and secret_key:
        return boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key
        )
    return boto3.client("s3", region_name=region)

def generate_presigned_upload(filename: str, content_type: str) -> dict:
    """
    Generates a secure presigned URL for the frontend to upload a file directly to S3.
    Enforces extension validation and generates a unique object key.
    """
    if not is_s3_configured():
        return {
            "error": "AWS S3 is not configured on this server. Core link-saving is functional without S3.",
            "configured": False
        }

    bucket = os.getenv("S3_BUCKET_NAME").strip()
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        return {
            "error": f"File type '{ext}' is not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS.keys())}",
            "configured": True
        }

    unique_key = f"attachments/{uuid.uuid4().hex}_{filename}"

    try:
        s3 = get_s3_client()
        presigned_url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": bucket,
                "Key": unique_key,
                "ContentType": content_type or ALLOWED_EXTENSIONS[ext],
            },
            ExpiresIn=300  # 5 minutes
        )
        return {
            "upload_url": presigned_url,
            "key": unique_key,
            "filename": filename,
            "configured": True
        }
    except (BotoCoreError, ClientError) as e:
        return {
            "error": f"Failed to generate upload URL: {str(e)}",
            "configured": True
        }

def generate_presigned_download(key: str, expires_in: int = 3600) -> str:
    """
    Generates a short-lived presigned GET URL to securely view/download a private S3 object.
    """
    if not is_s3_configured() or not key:
        return None
    bucket = os.getenv("S3_BUCKET_NAME").strip()
    try:
        s3 = get_s3_client()
        return s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires_in
        )
    except Exception:
        return None
