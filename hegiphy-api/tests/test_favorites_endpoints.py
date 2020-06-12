import pytest
import requests_mock
import favorites_client
import botocore


@pytest.fixture
def dynamodb_mock(monkeypatch):
    stubber = botocore.stub.Stubber(favorites_client.client)
    yield stubber
    stubber.deactivate()


@pytest.fixture()
def auth_mock(monkeypatch):
    with requests_mock.mock() as req_mock:

        def apply():
            req_mock.get(
                "https://budb-hegiphy.auth0.com/userinfo", json={"email": "foo@bar.com"}
            )

        yield apply


def test_get_favorites(handler, call_handler, auth_mock, dynamodb_mock):
    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user",
        "ExpressionAttributeValues": {":user": {"S": "foo@bar.com"}},
    }
    dynamodb_response = {
        "Items": [
            {
                "pk": {"S": "foo@bar.com"},
                "sk": {"S": "12345"},
                "tags": {"SS": ["foo", "bar"]},
            }
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    auth_mock()

    response = call_handler(
        handler, "GET", "/favorites", {"Authorization": "Bearer foo-token"}
    )
    assert response.status_code == 200
    assert response.json == [
        {"id": "12345", "user": "foo@bar.com", "tags": ["foo", "bar"]}
    ]
    assert response.headers["Content-Type"] == "application/json"

    dynamodb_mock.assert_no_pending_responses()


def test_get_favorites_by_tag(handler, call_handler, auth_mock, dynamodb_mock):
    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user",
        "ExpressionAttributeValues": {":user": {"S": "foo@bar.com"}},
    }
    dynamodb_response = {
        "Items": [
            {
                "pk": {"S": "foo@bar.com"},
                "sk": {"S": "12345"},
                "tags": {"SS": ["foo"]},
            },
            {
                "pk": {"S": "foo@bar.com"},
                "sk": {"S": "67890"},
                "tags": {"SS": ["bar"]},
            },
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    auth_mock()

    response = call_handler(
        handler, "GET", "/favorites?tag=bar", {"Authorization": "Bearer foo-token"}
    )
    assert response.status_code == 200
    assert response.json == [{"id": "67890", "user": "foo@bar.com", "tags": ["bar"]}]
    assert response.headers["Content-Type"] == "application/json"

    dynamodb_mock.assert_no_pending_responses()


def test_add_favorite_no_tags(handler, call_handler, auth_mock, dynamodb_mock):
    dynamodb_request = {
        "TableName": "hegiphy",
        "Item": {"pk": {"S": "foo@bar.com"}, "sk": {"S": "12345"}},
    }
    dynamodb_mock.add_response("put_item", {"Attributes": {}}, dynamodb_request)
    dynamodb_mock.activate()

    auth_mock()

    response = call_handler(
        handler,
        "POST",
        "/favorites",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
        {"id": "12345"},
    )
    assert response.status_code == 201
    assert response.json == {"id": "12345", "user": "foo@bar.com", "tags": []}
    assert response.headers["Content-Type"] == "application/json"

    dynamodb_mock.assert_no_pending_responses()


def test_add_favorite_with_tags(handler, call_handler, auth_mock, dynamodb_mock):
    dynamodb_request = {
        "TableName": "hegiphy",
        "Item": {
            "pk": {"S": "foo@bar.com"},
            "sk": {"S": "12345"},
            "tags": {"SS": ["foo", "bar"]},
        },
    }
    dynamodb_mock.add_response("put_item", {"Attributes": {}}, dynamodb_request)
    dynamodb_mock.activate()

    auth_mock()

    response = call_handler(
        handler,
        "POST",
        "/favorites",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
        {"id": "12345", "tags": ["foo", "bar"]},
    )
    assert response.status_code == 201
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": ["foo", "bar"],
    }
    assert response.headers["Content-Type"] == "application/json"

    dynamodb_mock.assert_no_pending_responses()


def test_invalid_add_favorite(handler, call_handler, auth_mock):
    auth_mock()

    response = call_handler(
        handler,
        "POST",
        "/favorites",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
        {"foo": "bar"},
    )

    assert response.status_code == 400


def test_get_favorite(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {
        "Items": [
            {
                "sk": {"S": "12345"},
                "pk": {"S": "foo@bar.com"},
                "tags": {"SS": ["foo", "bar"]},
            }
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "GET",
        "/favorites/12345",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": ["foo", "bar"],
    }


def test_get_favorite_not_found(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {"Items": []}
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "GET",
        "/favorites/12345",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 404
    assert response.json == {"error": "favorite with id 12345 not found"}


def test_delete_favorite(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "Key": {"pk": {"S": "foo@bar.com"}, "sk": {"S": "12345"}},
        "ReturnValues": "NONE",
    }
    dynamodb_response = {}
    dynamodb_mock.add_response("delete_item", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "DELETE",
        "/favorites/12345",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 204
    assert response.body == ""


def test_add_tag_to_favorite(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {
        "Items": [
            {
                "sk": {"S": "12345"},
                "pk": {"S": "foo@bar.com"},
                "tags": {"SS": ["foo", "bar"]},
            }
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)

    dynamodb_request = {
        "TableName": "hegiphy",
        "Key": {"pk": {"S": "foo@bar.com"}, "sk": {"S": "12345"}},
        "UpdateExpression": "SET #tags = :tags",
        "ExpressionAttributeValues": {":tags": {"SS": ["foo", "bar", "baz"]}},
        "ExpressionAttributeNames": {"#tags": "tags"},
        "ReturnValues": "ALL_NEW",
    }
    dynamodb_response = {
        "Attributes": {
            "sk": {"S": "12345"},
            "pk": {"S": "foo@bar.com"},
            "tags": {"SS": ["foo", "bar", "baz"]},
        }
    }
    dynamodb_mock.add_response("update_item", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "POST",
        "/favorites/12345/tags/baz",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": ["foo", "bar", "baz"],
    }


def test_add_existing_tag_to_favorite(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {
        "Items": [
            {
                "sk": {"S": "12345"},
                "pk": {"S": "foo@bar.com"},
                "tags": {"SS": ["foo", "bar"]},
            }
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)

    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "POST",
        "/favorites/12345/tags/bar",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": ["foo", "bar"],
    }


def test_add_existing_tag_to_missing_favorite(
    handler, call_handler, auth_mock, dynamodb_mock
):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {"Items": []}
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)

    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "POST",
        "/favorites/12345/tags/foo",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 404
    assert response.json == {"error": "favorite with id 12345 not found"}


def test_delete_tag_from_favorite(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {
        "Items": [
            {
                "sk": {"S": "12345"},
                "pk": {"S": "foo@bar.com"},
                "tags": {"SS": ["foo", "bar"]},
            }
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)

    dynamodb_request = {
        "TableName": "hegiphy",
        "Key": {"pk": {"S": "foo@bar.com"}, "sk": {"S": "12345"}},
        "UpdateExpression": "SET #tags = :tags",
        "ExpressionAttributeValues": {":tags": {"SS": ["foo"]}},
        "ExpressionAttributeNames": {"#tags": "tags"},
        "ReturnValues": "ALL_NEW",
    }
    dynamodb_response = {
        "Attributes": {
            "sk": {"S": "12345"},
            "pk": {"S": "foo@bar.com"},
            "tags": {"SS": ["foo"]},
        }
    }
    dynamodb_mock.add_response("update_item", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "DELETE",
        "/favorites/12345/tags/bar",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": ["foo"],
    }


def test_delete_missing_tag_from_favorite(
    handler, call_handler, auth_mock, dynamodb_mock
):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {
        "Items": [
            {
                "sk": {"S": "12345"},
                "pk": {"S": "foo@bar.com"},
                "tags": {"SS": ["foo", "bar"]},
            }
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "DELETE",
        "/favorites/12345/tags/baz",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": ["foo", "bar"],
    }


def test_delete_last_tag_from_favorite(handler, call_handler, auth_mock, dynamodb_mock):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {
        "Items": [
            {"sk": {"S": "12345"}, "pk": {"S": "foo@bar.com"}, "tags": {"SS": ["foo"]}}
        ]
    }
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)

    dynamodb_request = {
        "TableName": "hegiphy",
        "Key": {"pk": {"S": "foo@bar.com"}, "sk": {"S": "12345"}},
        "UpdateExpression": "REMOVE #tags",
        "ExpressionAttributeNames": {"#tags": "tags"},
        "ReturnValues": "ALL_NEW",
    }
    dynamodb_response = {
        "Attributes": {"sk": {"S": "12345"}, "pk": {"S": "foo@bar.com"}}
    }
    dynamodb_mock.add_response("update_item", dynamodb_response, dynamodb_request)
    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "DELETE",
        "/favorites/12345/tags/foo",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json == {
        "id": "12345",
        "user": "foo@bar.com",
        "tags": [],
    }


def test_delete_tag_from_missing_favorite(
    handler, call_handler, auth_mock, dynamodb_mock
):
    auth_mock()

    dynamodb_request = {
        "TableName": "hegiphy",
        "KeyConditionExpression": "pk = :user AND sk = :id",
        "ExpressionAttributeValues": {
            ":user": {"S": "foo@bar.com"},
            ":id": {"S": "12345"},
        },
    }
    dynamodb_response = {"Items": []}
    dynamodb_mock.add_response("query", dynamodb_response, dynamodb_request)

    dynamodb_mock.activate()

    response = call_handler(
        handler,
        "DELETE",
        "/favorites/12345/tags/foo",
        {"Authorization": "Bearer foo-token", "Content-Type": "application/json"},
    )

    assert response.status_code == 404
    assert response.json == {"error": "favorite with id 12345 not found"}
