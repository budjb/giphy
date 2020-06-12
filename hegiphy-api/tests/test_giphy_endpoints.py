import requests_mock
import config
import json


def test_query_defaults(handler, call_handler):
    mock_json = {"foo": "bar"}

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/search?api_key=mock_giphy_api_key&q=foo",
            text=json.dumps(mock_json),
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/query?q=foo")
        assert response.status_code == 200
        assert response.json == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_query_options(handler, call_handler):
    mock_json = {"foo": "bar"}

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/search?api_key=mock_giphy_api_key&q=foo&offset=5&limit=2&rating=PG&lang=jp",
            text=json.dumps(mock_json),
            status_code=200,
        )

        response = call_handler(
            handler, "GET", "/giphy/query?q=foo&offset=5&limit=2&rating=PG&lang=jp"
        )
        assert response.status_code == 200
        assert response.json == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_missing_query(handler, call_handler):
    response = call_handler(handler, "GET", "/giphy/query")
    assert response.status_code == 400
    assert response.json == {"error": 'the "q" parameter is required'}
    assert response.headers["Content-Type"] == "application/json"


def test_get_trending_defaults(handler, call_handler):
    mock_json = {"foo": "bar"}

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/trending?api_key=mock_giphy_api_key&rating=G",
            text=json.dumps(mock_json),
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/trending")
        assert response.status_code == 200
        assert response.json == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_get_trending_options(handler, call_handler):
    mock_json = {"foo": "bar"}

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs/trending?api_key=mock_giphy_api_key&limit=5&rating=PG",
            text=json.dumps(mock_json),
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/trending?limit=5&rating=PG")
        assert response.status_code == 200
        assert response.json == mock_json
        assert response.headers["Content-Type"] == "application/json"


def test_get_by_ids(handler, call_handler):
    mock_json = {"foo": "bar"}

    with requests_mock.mock() as req_mock:
        base_url = config.get("giphy_base_url")

        req_mock.get(
            f"{base_url}/gifs?api_key=mock_giphy_api_key&ids=foo,bar,baz",
            text=json.dumps(mock_json),
            status_code=200,
        )

        response = call_handler(handler, "GET", "/giphy/gifs?ids=foo,bar,baz")
        assert response.status_code == 200
        assert response.json == mock_json
        assert response.headers["Content-Type"] == "application/json"
