# CloudFront용 (lastnyam.shop)
resource "aws_acm_certificate" "cdn" {
  provider          = aws.us_east_1
  domain_name       = aws_route53_zone.main.name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# ALB용 (origin.lastnyam.shop) — live 스택의 Ingress가 이 ARN을 사용
resource "aws_acm_certificate" "alb" {
  domain_name       = "origin.${aws_route53_zone.main.name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in concat(
      tolist(aws_acm_certificate.cdn.domain_validation_options),
      tolist(aws_acm_certificate.alb.domain_validation_options),
    ) : dvo.domain_name => dvo
  }

  zone_id         = aws_route53_zone.main.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  records         = [each.value.resource_record_value]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "cdn" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cdn.arn
  validation_record_fqdns = [aws_route53_record.cert_validation[aws_acm_certificate.cdn.domain_name].fqdn]
}

resource "aws_acm_certificate_validation" "alb" {
  certificate_arn         = aws_acm_certificate.alb.arn
  validation_record_fqdns = [aws_route53_record.cert_validation[aws_acm_certificate.alb.domain_name].fqdn]
}
