from flask import request, g
from jose import jwt
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


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _get_token_auth_header()

        jwks = requests.get(
            f"https://{config.AUTH0_DOMAIN}/.well-known/jwks.json"
        ).json()

        unverified_header = jwt.get_unverified_header(token)

        rsa_key = None

        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }

        if not rsa_key:
            raise HttpException("Malformed authentication token", 401)

        try:
            response = requests.get(
                f"https://{config.AUTH0_DOMAIN}/userinfo",
                headers={"Authorization": f"Bearer {token}"},
            )

            response.raise_for_status()

            g.current_user = response.json()["email"]
            g.auth_token = token
        except Exception:
            raise HttpException("Unauthorized", 401)

        return f(*args, **kwargs)

    return decorated
