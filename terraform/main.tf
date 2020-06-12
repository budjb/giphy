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
