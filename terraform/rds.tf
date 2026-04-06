# ─── RDS — DELIBERATELY MISCONFIGURED ────────────────────────

resource "aws_db_instance" "vulnbank" {
  identifier     = "vulnbank-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  db_name  = "vulnbank"
  username = "admin"
  password = var.db_password  # Uses default "admin123"

  # VULNERABILITY: Publicly accessible (CKV_AWS_17)
  publicly_accessible = true

  # VULNERABILITY: No encryption at rest (CKV_AWS_16)
  storage_encrypted = false

  # VULNERABILITY: No deletion protection (CKV_AWS_226)
  deletion_protection = false

  # VULNERABILITY: No backup retention (poor DR)
  backup_retention_period = 0

  # VULNERABILITY: No Multi-AZ (poor HA)
  multi_az = false

  # VULNERABILITY: No enhanced monitoring
  # VULNERABILITY: No performance insights

  # VULNERABILITY: Minor version auto-upgrade disabled
  auto_minor_version_upgrade = false

  skip_final_snapshot = true

  tags = {
    Environment = var.environment
  }
}
