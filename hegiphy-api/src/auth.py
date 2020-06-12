from flask import request, g
from functools import wraps
from error import HttpException
import config
import requests


def _get_token_auth_header():
    auth = request.headers.get("Authorization")

    if not auth:
        raise HttpException("Unauthorized", 401)

    parts = auth.split()

    if parts[0].lower() != "bearer" or len(parts) != 2:
        raise HttpException("Authorization header is malformed", 400)
    elif len(parts) == 1:
        raise HttpException("Authorization header is malformed", 400)

    return parts[1]


def auth():
    token = _get_token_auth_header()
    base_url = config.get("auth0_domain")

    try:
        response = requests.get(
            f"https://{base_url}/userinfo",
            headers={"Authorization": f"Bearer {token}"},
        )

        response.raise_for_status()

        g.current_user = response.json()["email"]
        g.auth_token = token
    except Exception:
        raise HttpException("Unauthorized", 401)


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth()
        return f(*args, **kwargs)

    return decorated
