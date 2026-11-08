# 새 버킷은 퍼블릭 차단·SSE-S3 암호화·ACL 비활성화가 기본값이라 별도 설정 없음

# 앱 업로드용 (메뉴 이미지, QR 코드 등)
resource "aws_s3_bucket" "app" {
  bucket = "lastnyam-app-${data.aws_caller_identity.current.account_id}"
}

# owner-web이 presigned URL로 브라우저에서 직접 PUT 업로드
resource "aws_s3_bucket_cors_configuration" "app" {
  bucket = aws_s3_bucket.app.id

  cors_rule {
    allowed_methods = ["PUT", "GET"]
    allowed_origins = ["https://${aws_route53_zone.main.name}", "http://localhost:5173"]
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }
}

# FE 정적 파일: customer-web은 루트, owner-web은 owner/ 아래
resource "aws_s3_bucket" "fe" {
  bucket = "lastnyam-fe-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_policy" "fe" {
  bucket = aws_s3_bucket.fe.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.fe.arn}/*"
      Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.main.arn } }
    }]
  })
}
