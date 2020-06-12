locals {
  ui_s3_origin_id = "hegiphy-ui-s3"
}

###########################################################
# S3 Bucket                                               #
###########################################################

resource "aws_s3_bucket" "ui_bucket" {
  bucket = "budjb-hegiphy-ui"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

###########################################################
# SSL Certificate                                         #
###########################################################

resource "aws_acm_certificate" "hegiphy_ui" {
  domain_name               = "hegiphy.budjb.com"
  validation_method         = "DNS"
  tags = {
    Name: "HeGiphy UI"
  }
}

resource "aws_acm_certificate_validation" "hegiphy_ui" {
  certificate_arn = aws_acm_certificate.hegiphy_ui.arn
  validation_record_fqdns = [aws_route53_record.hegiphy_ui_cert_validation.fqdn]
}

###########################################################
# Cloudfront Distribution                                 #
###########################################################

resource "aws_cloudfront_distribution" "hegiphy_ui" {
  origin {
    domain_name = aws_s3_bucket.ui_bucket.website_endpoint
    origin_id   = local.ui_s3_origin_id

    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols = ["TLSv1.1", "TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["hegiphy.budjb.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.ui_s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.hegiphy_ui.arn
    ssl_support_method = "sni-only"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

###########################################################
# Route53                                                 #
###########################################################

resource "aws_route53_record" "hegiphy_ui" {
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  name    = "hegiphy.budjb.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.hegiphy_ui.domain_name
    zone_id                = aws_cloudfront_distribution.hegiphy_ui.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "hegiphy_ui_cert_validation" {
  name    = aws_acm_certificate.hegiphy_ui.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.hegiphy_ui.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  records = [aws_acm_certificate.hegiphy_ui.domain_validation_options.0.resource_record_value]
  ttl     = 60
}
