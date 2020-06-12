terraform {
  backend "s3" {
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_route53_zone" "budjb_com_zone" {
  name = "budjb.com"
}

data "aws_kms_key" "hegiphy" {
  key_id = "arn:aws:kms:us-east-1:211643380035:key/32f6098f-5157-4625-ba23-75fe0117d986"
}

variable "giphy_api_key" {
  type = string
}

resource "aws_ssm_parameter" "giphy_api_key" {
  name      = "/hegiphy/giphy_api_key"
  type      = "SecureString"
  value     = var.giphy_api_key
  key_id    = data.aws_kms_key.hegiphy.key_id
  overwrite = true
}
