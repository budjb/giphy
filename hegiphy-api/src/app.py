from flask import Flask, jsonify, g, request, Response
from flask_cors import CORS
from auth import requires_auth
from error import HttpException
from giphy_client import GiphyClient
from favorites_client import FavoritesClient, FavoriteNotFoundException
from marshmallow import Schema, fields, validate, ValidationError
import config

GIPHY_CLIENT = GiphyClient(config.get("giphy_base_url"), config.get("giphy_api_key"))
FAVORITES_CLIENT = FavoritesClient()

APP = Flask(__name__)
CORS(APP)

MAX_TAG_LENGTH = 140


class FavoriteSchema(Schema):
    id = fields.String(required=True, validates=validate.Length(max=1024))
    tags = fields.List(fields.String(validates=validate.Length(max=MAX_TAG_LENGTH)))


@APP.errorhandler(HttpException)
def handler_unauthenticated(e):
    response = jsonify({"error": e.error})
    response.status_code = e.status_code
    return response


@APP.route("/favorites", methods=["GET"])
@requires_auth
def list_favorites():
    tag = request.args.get("tag")
    user = g.get("current_user")

    if tag:
        return jsonify(FAVORITES_CLIENT.find_by_user_and_tag(user, tag))

    return jsonify(FAVORITES_CLIENT.find_by_user(user))


@APP.route("/favorites", methods=["POST"])
@requires_auth
def create_favorite():
    data = request.json
    user = g.get("current_user")

    try:
        data = FavoriteSchema().load(data)
    except ValidationError as err:
        raise HttpException(err.messages, 400)

    return FAVORITES_CLIENT.create_favorite(user, data)


@APP.route("/favorites/<id>", methods=["GET"])
@requires_auth
def get_favorite(id):
    user = g.get("current_user")

    result = FAVORITES_CLIENT.find_by_id_and_user(id, user)

    if not result:
        raise HttpException(f"favorite with id {id} not found", 404)

    return jsonify(result)


@APP.route("/favorites/<id>", methods=["DELETE"])
@requires_auth
def delete_favorite(id):
    user = g.get("current_user")
    FAVORITES_CLIENT.delete_favorite(user, id)
    return "", 204


@APP.route("/favorites/<id>/tags/<tag>", methods=["POST"])
@requires_auth
def add_tag(id, tag):
    user = g.get("current_user")

    if len(tag) > MAX_TAG_LENGTH:
        raise HttpException(f"maximum tag length is {MAX_TAG_LENGTH}", 400)

    try:
        return jsonify(FAVORITES_CLIENT.add_tag_to_favorite(id, user, tag))
    except FavoriteNotFoundException:
        raise HttpException(f"favorite with id {id} not found", 404)


@APP.route("/favorites/<id>/tags/<tag>", methods=["DELETE"])
@requires_auth
def delete_tag(id, tag):
    user = g.get("current_user")

    if len(tag) > MAX_TAG_LENGTH:
        raise HttpException(f"maximum tag length is {MAX_TAG_LENGTH}", 400)

    try:
        return jsonify(FAVORITES_CLIENT.remove_tag_from_favorite(id, user, tag))
    except FavoriteNotFoundException:
        raise HttpException(f"favorite with id {id} not found", 404)


@APP.route("/giphy/query", methods=["GET"])
def query_giphy():
    term = request.args.get("q")

    if not term:
        raise HttpException('the "q" parameter is required', 400)

    offset = request.args.get("offset", 0)
    limit = request.args.get("limit", 25)
    rating = request.args.get("rating", "G")
    lang = request.args.get("lang", "en")

    return Response(
        GIPHY_CLIENT.query(term, offset, limit, rating, lang),
        mimetype="application/json",
    )


@APP.route("/giphy/trending", methods=["GET"])
def get_trending_giphy():
    limit = request.args.get("limit")
    rating = request.args.get("rating", "G")

    return Response(
        GIPHY_CLIENT.get_trending(limit=limit, rating=rating),
        mimetype="application/json",
    )


@APP.route("/giphy/gifs", methods=["GET"])
def get_images_by_ids():
    ids = request.args.get("ids")

    if not ids:
        raise HttpException('the "ids" query parameter is required', 400)

    return Response(GIPHY_CLIENT.get_by_ids(ids), mimetype="application/json")
