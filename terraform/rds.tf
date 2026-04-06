# ─── RDS — SECURED ───────────────────────────────────────────

resource "aws_db_instance" "vulnbank" {
  identifier     = "vulnbank-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  db_name  = "vulnbank"
  username = "vulnbank_app"
  password = var.db_password  # Set via TF_VAR_db_password, never default

  # FIX: Not publicly accessible
  publicly_accessible = false
  db_subnet_group_name = aws_db_subnet_group.vulnbank.name

  # FIX: Encryption at rest
  storage_encrypted = true
  kms_key_id       = aws_kms_key.rds.arn

  # FIX: Deletion protection enabled
  deletion_protection = true

  # FIX: Backup retention
  backup_retention_period = 7

  # FIX: Multi-AZ for HA
  multi_az = true

  # FIX: Auto minor version upgrade
  auto_minor_version_upgrade = true

  # FIX: Enhanced monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # FIX: Performance insights
  performance_insights_enabled = true

  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = {
    Environment = var.environment
  }
}

resource "aws_kms_key" "rds" {
  description             = "RDS encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_db_subnet_group" "vulnbank" {
  name       = "vulnbank-db"
  subnet_ids = aws_subnet.private[*].id
}

# FIX: Restrictive security group for RDS
resource "aws_security_group" "rds" {
  name        = "vulnbank-rds"
  description = "Allow PostgreSQL from EKS nodes only"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }
}

resource "aws_iam_role" "rds_monitoring" {
  name = "vulnbank-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
  role       = aws_iam_role.rds_monitoring.name
}
