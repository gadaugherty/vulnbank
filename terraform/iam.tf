# ─── IAM — DELIBERATELY MISCONFIGURED ────────────────────────

# VULNERABILITY: Overly broad assume role policy
resource "aws_iam_role" "eks_cluster" {
  name = "vulnbank-eks-cluster"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        # VULNERABILITY: Wildcard principal (CWE-284)
        Service = "*"
      }
    }]
  })
}

resource "aws_iam_role" "eks_node" {
  name = "vulnbank-eks-node"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# VULNERABILITY: Admin access on node role (CWE-250)
resource "aws_iam_role_policy_attachment" "eks_node_admin" {
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
  role       = aws_iam_role.eks_node.name
}

# VULNERABILITY: Overly permissive S3 policy
resource "aws_iam_policy" "s3_access" {
  name = "vulnbank-s3-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "s3:*"
      Resource = "*"
    }]
  })
}
