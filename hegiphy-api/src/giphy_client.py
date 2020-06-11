import requests

class GiphyClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key

    
    def get_trending(self, limit = None, rating = None):
        params = {"api_key": self.api_key}

        if limit:
            params["limit"] = limit

        if rating:
            params["rating"] = rating

        url = f"{self.base_url}/gifs/trending"

        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.text


    def get_by_ids(self, ids):
        params = {
            "api_key": self.api_key,
            "ids": ids
        }

        url = f"{self.base_url}/gifs"

        response = requests.get(url, params = params)
        response.raise_for_status()
        return response.text


    def query(self, term, offset = None, limit = None, rating = None, lang = None):
        params = {
            "api_key": self.api_key,
            "q": term
        }

        if offset:
            params["offset"] = offset

        if limit:
            params["limit"] = limit

        if rating:
            params["rating"] = rating

        if lang:
            params["lang"] = lang

        url = f"{self.base_url}/gifs/search"

        response = requests.get(url, params = params)
        response.raise_for_status()
        return response.text
