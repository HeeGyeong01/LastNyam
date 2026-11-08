terraform {
  required_version = ">= 1.10" # S3 backend use_lockfile 지원 버전

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "lastnyam-tfstate-040385117008"
    key          = "base/terraform.tfstate"
    region       = "ap-northeast-2"
    use_lockfile = true
  }
}

provider "aws" {
  region = "ap-northeast-2"

  default_tags {
    tags = {
      Project = "lastnyam"
      Stack   = "base"
    }
  }
}

resource "aws_route53_zone" "main" {
  name = "lastnyam.shop"

  # 지웠다 다시 만들면 NS가 바뀌어 가비아 설정을 다시 해야 함
  lifecycle {
    prevent_destroy = true
  }
}

output "name_servers" {
  value = aws_route53_zone.main.name_servers
}

output "zone_id" {
  value = aws_route53_zone.main.zone_id
}
