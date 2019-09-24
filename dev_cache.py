import pickle
from datetime import datetime, timezone, timedelta
import dateutil.parser
import requests
import time


class Cache:

    def __init__(self):
        try:
            with open("dev_cache.p", "rb") as cache:
                self.pairs = pickle.load(cache)
        except FileNotFoundError as e:
            self.pairs = {}

    def get_url(self, url, **kwargs):
        if self._is_fresh(url):
            return self.pairs[url]["val"]

        print(f"FETCHING {url}")

        # FIXME: temporary to avoid over-fetching
        time.sleep(1)

        r = requests.get(url)
        t = dateutil.parser.parse(r.headers["Date"])

        if r.status_code != 200:
            raise Exception(f"Failure status code {r.status_code}")

        self.pairs[url] = {
            "timestamp": t,
            "val": r,
        }

        self._persist()

        return r

    def get(self, key, fn, **kwargs):
        if self._is_fresh(key, **kwargs):
            return self.pairs[key]["val"]

        print(f"'{key}' was not fresh")

        # FIXME: temporary to avoid over-fetching
        time.sleep(0.5)

        val = fn()
        t = datetime.now(timezone.utc)

        self.pairs[key] = {
            "timestamp": t,
            "val": val,
        }

        self._persist()

        return val

    def _is_fresh(self, key, **kwargs):
        if key not in self.pairs:
            return False

        entry = self.pairs[key]

        last_update = entry["timestamp"]
        max_age = kwargs.get("max_age", timedelta(days=1))
        now = datetime.now(timezone.utc)
        is_fresh = (now < last_update + max_age)

        return is_fresh

    def _persist(self):
        with open("dev_cache.p", "wb+") as cache:
            pickle.dump(self.pairs, cache)


cache = Cache()
