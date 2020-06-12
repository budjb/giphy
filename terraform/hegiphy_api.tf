locals {
  lambda_dist_path = "${path.module}/../hegiphy-api/dist/lambda.zip"
}

###########################################################
# SSL Certificate                                         #
###########################################################

resource "aws_acm_certificate" "hegiphy_api" {
  domain_name               = "api.hegiphy.budjb.com"
  validation_method         = "DNS"
  tags = {
    Name: "HeGiphy API"
  }
}

resource "aws_acm_certificate_validation" "hegiphy_api" {
  certificate_arn = aws_acm_certificate.hegiphy_api.arn
  validation_record_fqdns = [aws_route53_record.hegiphy_api_cert_validation.fqdn]
}

###########################################################
# Route53                                                 #
###########################################################

resource "aws_route53_record" "hegiphy_api_cert_validation" {
  name    = aws_acm_certificate.hegiphy_api.domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.hegiphy_api.domain_validation_options.0.resource_record_type
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  records = [aws_acm_certificate.hegiphy_api.domain_validation_options.0.resource_record_value]
  ttl     = 60
}

resource "aws_route53_record" "api_domain_record" {
  zone_id = data.aws_route53_zone.budjb_com_zone.zone_id
  name    = "api.hegiphy.budjb.com"
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api_gateway_custom_domain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api_gateway_custom_domain.cloudfront_zone_id
    evaluate_target_health = false
  }
}

###########################################################
# DynamoDB                                                #
###########################################################

resource "aws_dynamodb_table" "hegiphy_table" {
  name         = "hegiphy"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  global_secondary_index {
    name            = "hegiphy_id"
    hash_key        = "sk"
    projection_type = "ALL"
  }
}

###########################################################
# API Gateway                                             #
###########################################################

data "aws_iam_policy_document" "api_gateway_assumption_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "hegiphy_api_invoke_lambda" {
  statement {
    actions = [
      "logs:*",
      "lambda:InvokeFunction",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "api_gateway_role" {
  name               = "hegiphy_api_gateway"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assumption_policy.json
}

resource "aws_iam_role_policy" "api_gateway_lambda_policy" {
  name   = "hegiphy_lambda_policy"
  role   = aws_iam_role.api_gateway_role.id
  policy = data.aws_iam_policy_document.hegiphy_api_invoke_lambda.json
}

data "template_file" "api_gateway_spec" {
  template = file("${path.module}/openapi.yml")

  vars = {
    lambda_arn = aws_lambda_function.hegiphy_api.invoke_arn
    lambda_role   = aws_iam_role.api_gateway_role.arn
  }
}

resource "aws_api_gateway_rest_api" "api_gateway" {
  name = "HeGiphy API"
  body = data.template_file.api_gateway_spec.rendered
}

resource "aws_api_gateway_deployment" "api_gateway_deployment" {
  rest_api_id = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = "release"

  variables = {
    "version" = md5(data.template_file.api_gateway_spec.rendered)
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_domain_name" "api_gateway_custom_domain" {
  domain_name     = "api.hegiphy.budjb.com"
  certificate_arn = aws_acm_certificate.hegiphy_api.arn
  tags = {
    Name: "HeGiphy API"
  }

  depends_on = [
    aws_acm_certificate_validation.hegiphy_api
  ]
}

resource "aws_api_gateway_base_path_mapping" "basepath" {
  api_id      = aws_api_gateway_rest_api.api_gateway.id
  stage_name  = aws_api_gateway_deployment.api_gateway_deployment.stage_name
  domain_name = aws_api_gateway_domain_name.api_gateway_custom_domain.domain_name
}

###########################################################
# Lambda                                                  #
###########################################################

data "aws_iam_policy_document" "lambda_assumption_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com",
        "apigateway.amazonaws.com",
      ]
    }
  }
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    actions = [
      "logs:*",
      "lambda:InvokeFunction",
      "xray:PutTraceSegments",
      "xray:PutTelemetryRecords",
    ]

    resources = ["*"]
  }

  statement {
    actions = [
      "dynamodb:BatchGet*",
      "dynamodb:BatchWrite*",
      "dynamodb:DeleteItem",
      "dynamodb:DescribeLimits",
      "dynamodb:DescribeReservedCapacity*",
      "dynamodb:DescribeStream",
      "dynamodb:DescribeTable",
      "dynamodb:DescribeTimeToLive",
      "dynamodb:Get*",
      "dynamodb:List*",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
      "dynamodb:PutItem",
    ]

    resources = [
      aws_dynamodb_table.hegiphy_table.arn,
      "${aws_dynamodb_table.hegiphy_table.arn}/*",
    ]
  }
}

resource "aws_iam_role" "hegiphy_api_role" {
  name               = "hegiphy-api-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assumption_policy.json
}

resource "aws_iam_role_policy" "lambda_policy" {
  name   = "lambda-policy"
  role   = aws_iam_role.hegiphy_api_role.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}

resource "aws_lambda_function" "hegiphy_api" {
  function_name                  = "hegiphy-api"
  filename                       = local.lambda_dist_path
  source_code_hash               = filebase64sha256(local.lambda_dist_path)
  role                           = aws_iam_role.hegiphy_api_role.arn
  handler                        = "lambda_handler.handler"
  timeout                        = 28
  publish                        = true
  runtime                        = "python3.6"
  description                    = "HeGiphy API"

  tracing_config {
    mode = "PassThrough"
  }
}

resource "aws_lambda_alias" "lambda_alias" {
  name             = "hegiphy-api"
  function_name    = aws_lambda_function.hegiphy_api.arn
  function_version = aws_lambda_function.hegiphy_api.version
}
