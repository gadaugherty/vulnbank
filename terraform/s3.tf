# ─── S3 Bucket — SECURED ─────────────────────────────────────

resource "aws_s3_bucket" "user_data" {
  bucket = "vulnbank-user-data"

  tags = {
    Name        = "vulnbank-user-data"
    Environment = var.environment
  }
}

# FIX: Block all public access
resource "aws_s3_bucket_public_access_block" "user_data" {
  bucket = aws_s3_bucket.user_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# FIX: Enable KMS encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "user_data" {
  bucket = aws_s3_bucket.user_data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# FIX: Enable versioning (protects against accidental deletion)
resource "aws_s3_bucket_versioning" "user_data" {
  bucket = aws_s3_bucket.user_data.id
  versioning_configuration {
    status = "Enabled"
  }
}

# FIX: Enable access logging
resource "aws_s3_bucket_logging" "user_data" {
  bucket        = aws_s3_bucket.user_data.id
  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}

resource "aws_s3_bucket" "logs" {
  bucket = "vulnbank-access-logs"
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
