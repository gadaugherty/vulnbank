terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # FIX: Remote state with encryption
  backend "s3" {
    bucket         = "vulnbank-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "vulnbank-terraform-locks"
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "environment" {
  default = "production"
}

# FIX: No default password — must be provided via TF_VAR_db_password
variable "db_password" {
  type      = string
  sensitive = true
}
