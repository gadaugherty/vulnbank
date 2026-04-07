# ─── EKS Cluster — SECURED ───────────────────────────────────

resource "aws_eks_cluster" "vulnbank" {
  name     = "vulnbank-cluster"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = aws_subnet.private[*].id  # FIX: Private subnets

    # FIX: Private API endpoint only
    endpoint_public_access  = false
    endpoint_private_access = true

    security_group_ids = [aws_security_group.eks_cluster.id]
  }

  # FIX: Enable secrets encryption at rest
  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  # FIX: Enable all cluster logging
  enabled_cluster_log_types = [
    "api", "audit", "authenticator", "controllerManager", "scheduler"
  ]

  tags = {
    Environment = var.environment
  }
}

# FIX: KMS key for EKS secrets encryption
resource "aws_kms_key" "eks" {
  description             = "EKS cluster secrets encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_eks_node_group" "vulnbank" {
  cluster_name    = aws_eks_cluster.vulnbank.name
  node_group_name = "vulnbank-nodes"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.private[*].id  # FIX: Private subnets

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  # FIX: Use launch template with hardened AMI config
  launch_template {
    id      = aws_launch_template.eks_nodes.id
    version = aws_launch_template.eks_nodes.latest_version
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_launch_template" "eks_nodes" {
  name_prefix = "vulnbank-eks-"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # FIX: Require IMDSv2
    http_put_response_hop_limit = 1
  }

  monitoring {
    enabled = true
  }
}

# FIX: Dedicated security group for EKS cluster
resource "aws_security_group" "eks_cluster" {
  name        = "vulnbank-eks-cluster"
  description = "EKS cluster security group"
  vpc_id      = aws_vpc.main.id

  # Only allow node group to communicate with control plane
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }
}

resource "aws_security_group" "eks_nodes" {
  name        = "vulnbank-eks-nodes"
  description = "EKS node group security group"
  vpc_id      = aws_vpc.main.id

  # Nodes communicate with each other
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  # Nodes communicate with control plane
  egress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }
}
