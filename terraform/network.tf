# ─── Networking — DELIBERATELY MISCONFIGURED ─────────────────

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  # VULNERABILITY: No flow logs enabled (CKV_AWS_130)

  tags = {
    Name = "vulnbank-vpc"
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  # VULNERABILITY: Auto-assign public IPs (CKV_AWS_130)
  map_public_ip_on_launch = true

  tags = {
    Name = "vulnbank-public-${count.index}"
  }
}

data "aws_availability_zones" "available" {}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

# VULNERABILITY: Overly permissive security group (CWE-284)
resource "aws_security_group" "allow_all" {
  name        = "vulnbank-allow-all"
  description = "Allow all traffic"
  vpc_id      = aws_vpc.main.id

  # VULNERABILITY: Allow all inbound (CKV_AWS_24, CKV_AWS_25)
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # VULNERABILITY: Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vulnbank-allow-all"
  }
}
