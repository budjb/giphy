from app import APP
import config


APP.run(host=config.LOCAL_URL, port=8000, debug=True)
