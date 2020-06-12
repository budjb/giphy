from app import APP
import config


APP.run(host=config.get("local_url"), port=8000, debug=True)
