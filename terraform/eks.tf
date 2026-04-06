# ─── EKS Cluster — DELIBERATELY MISCONFIGURED ───────────────

resource "aws_eks_cluster" "vulnbank" {
  name     = "vulnbank-cluster"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = aws_subnet.public[*].id

    # VULNERABILITY: Public API endpoint (CKV_AWS_38)
    endpoint_public_access  = true
    endpoint_private_access = false

    # VULNERABILITY: No security group restrictions
    # VULNERABILITY: Public subnets for control plane
  }

  # VULNERABILITY: No encryption for secrets at rest (CKV_AWS_58)
  # encryption_config block is missing

  # VULNERABILITY: No logging enabled (CKV_AWS_37)
  # enabled_cluster_log_types is missing

  tags = {
    Environment = var.environment
  }
}

resource "aws_eks_node_group" "vulnbank" {
  cluster_name    = aws_eks_cluster.vulnbank.name
  node_group_name = "vulnbank-nodes"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.public[*].id

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  # VULNERABILITY: Using default AMI without hardening
  # VULNERABILITY: No launch template with security config

  tags = {
    Environment = var.environment
  }
}
