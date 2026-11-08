# GitHub Actions(3단계)와 live 스택(6단계)에서 사용

output "ecr_repository_urls" {
  value = { for k, r in aws_ecr_repository.app : k => r.repository_url }
}

output "app_bucket" {
  value = aws_s3_bucket.app.bucket
}

output "fe_bucket" {
  value = aws_s3_bucket.fe.bucket
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.main.id
}

output "ci_role_arn" {
  value = aws_iam_role.ci.arn
}

output "alb_certificate_arn" {
  value = aws_acm_certificate_validation.alb.certificate_arn
}
