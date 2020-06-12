from app import APP
import config


APP.run(host=config.get("local_url"), port=8000, debug=True, ssl_context=("../certs/cert.pem", "../certs/key.pem"))
