# ─── S3 Bucket — DELIBERATELY MISCONFIGURED ─────────────────

# VULNERABILITY: No encryption (CKV_AWS_19)
# VULNERABILITY: No versioning (CKV_AWS_21)
# VULNERABILITY: No public access block (CKV_AWS_53, CKV_AWS_54, CKV_AWS_55, CKV_AWS_56)
# VULNERABILITY: No access logging (CKV_AWS_18)
resource "aws_s3_bucket" "user_data" {
  bucket = "vulnbank-user-data"

  tags = {
    Name        = "vulnbank-user-data"
    Environment = var.environment
  }
}

# VULNERABILITY: Public read ACL (CWE-732)
resource "aws_s3_bucket_acl" "user_data" {
  bucket = aws_s3_bucket.user_data.id
  acl    = "public-read"
}
