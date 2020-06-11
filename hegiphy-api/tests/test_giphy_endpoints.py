import requests_mock
import config
import json


def test_query_defaults(handler, call_handler):
    mock_json = json.dumps({"foo": "bar"})

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/search?api_key=mock_giphy_api_key&q=foo",
            text=mock_json,
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/query?q=foo")
        assert response.status_code == 200
        assert response.body == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_query_options(handler, call_handler):
    mock_json = json.dumps({"foo": "bar"})

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/search?api_key=mock_giphy_api_key&q=foo&offset=5&limit=2&rating=PG&lang=jp",
            text=mock_json,
            status_code=200,
        )

        response = call_handler(
            handler, "GET", "/giphy/query?q=foo&offset=5&limit=2&rating=PG&lang=jp"
        )
        assert response.status_code == 200
        assert response.body == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_get_trending_defaults(handler, call_handler):
    mock_json = json.dumps({"foo": "bar"})

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/trending?api_key=mock_giphy_api_key&rating=G",
            text=mock_json,
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/trending")
        assert response.status_code == 200
        assert response.body == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_get_trending_options(handler, call_handler):
    mock_json = json.dumps({"foo": "bar"})

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/trending?api_key=mock_giphy_api_key&limit=5&rating=PG",
            text=mock_json,
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/trending?limit=5&rating=PG")
        assert response.status_code == 200
        assert response.body == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_get_by_ids(handler, call_handler):
    mock_json = json.dumps({"foo": "bar"})

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs?api_key=mock_giphy_api_key&ids=foo,bar,baz",
            text=mock_json,
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/gifs?ids=foo,bar,baz")
        assert response.status_code == 200
        assert response.body == mock_json
        assert response.headers["Content-Type"] == "application/json"
