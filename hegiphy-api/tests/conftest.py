from urllib.parse import parse_qsl, urlsplit
from botocore.stub import Stubber
import pytest
import json
import mock
import boto3


class MockResponse:
    def __init__(self, status_code=None, body=None, headers=None):
        self.status_code = status_code
        self.body = body
        self.headers = headers


@pytest.fixture(autouse=True)
def mock_ssm_config(monkeypatch):
    ssm_response = {
        "Parameters": [
            {"Name": "/hegiphy/giphy_api_key", "Value": "mock_giphy_api_key"}
        ]
    }

    expected_params = {
        "WithDecryption": True,
        "Recursive": True,
        "Path": "/hegiphy/",
    }

    client = boto3.client("ssm")

    def get_fake_ssm_client():
        return client

    monkeypatch.setattr("config._get_ssm_client", get_fake_ssm_client)
    stubber = Stubber(client)
    stubber.add_response(
        "get_parameters_by_path", ssm_response, expected_params=expected_params
    )
    stubber.activate()


@pytest.fixture
def call_handler():
    def _call_handler(handler, method, url, headers=None, data=None, authorizer=None):
        parsed_url = urlsplit(url)
        event = {
            "httpMethod": method.upper(),
            "path": parsed_url.path,
            "queryStringParameters": dict(parse_qsl(parsed_url.query)),
            "headers": headers or {"Content-Type": "application/json"},
            "body": json.dumps(data) if data else None,
            "requestContext": {"authorizer": authorizer},
        }

        r = handler(event, mock.MagicMock())

        return MockResponse(
            status_code=int(r["statusCode"]), body=r["body"], headers=r["headers"]
        )

    return _call_handler


@pytest.fixture
def handler():
    from handler import handler

    return handler
