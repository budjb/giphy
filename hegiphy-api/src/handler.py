from app import APP
import awsgi


def handler(event, context):
    return awsgi.response(APP, event, context)
