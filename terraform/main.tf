terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ─── Variables ───────────────────────────────────────────────
variable "environment" {
  default = "production"
}

variable "db_password" {
  # VULNERABILITY: Default password in variable (CWE-798)
  default = "admin123"
}
