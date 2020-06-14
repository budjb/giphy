import boto3
import os

_STATIC_CONFIG = {
    "auth0_domain": os.environ.get("AUTH0_DOMAIN", "budb-hegiphy.auth0.com"),
    "dynamodb_table": os.environ.get("DYNAMODB_TABLE", "hegiphy"),
    "giphy_base_url": os.environ.get("GIPHY_BASE_URL", "https://api.giphy.com/v1"),
}

_SSM_CONFIG = None
_COMPILED_CONFIG = None


def _get_ssm_client():
    return boto3.client("ssm")


def _get_base_path():
    return os.path.join(os.environ.get("SSM_PARAMS_PATH", "/hegiphy"), "")


def _load_ssm_secrets():
    global _SSM_CONFIG

    secrets = {}
    path = _get_base_path()

    if not path:
        _SSM_CONFIG = {}
        return

    ssm_client = _get_ssm_client()
    params = ssm_client.get_parameters_by_path(
        Path=path, Recursive=True, WithDecryption=True
    )["Parameters"]

    for param in params:
        name = param["Name"].replace(path, "")
        secrets[name] = param["Value"]

    _SSM_CONFIG = secrets


def _init():
    global _STATIC_CONFIG, _SSM_CONFIG, _COMPILED_CONFIG

    _load_ssm_secrets()
    _COMPILED_CONFIG = {**_STATIC_CONFIG, **_SSM_CONFIG}


def get(name, default=None):
    if not _COMPILED_CONFIG:
        _init()
    return _COMPILED_CONFIG.get(name, default)
