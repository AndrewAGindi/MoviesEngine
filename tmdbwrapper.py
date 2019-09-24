import tmdbsimple as tmdb

from datetime import timedelta

from dev_cache import cache

tmdb.API_KEY = "ca50b111fc473b9a039d65b585e30c79"

def get_config():
    def _get_config():
        config = tmdb.Configuration()
        response = config.info()
        return config

    return cache.get(f"tmdb-config", lambda: _get_config())

def get_genres():
    def _get_genres():
        genres = tmdb.Genres().movie_list()["genres"]

        id_name = list(map(lambda x: (x["id"], x["name"]), genres))
        name_id = list(map(lambda x: reversed(x), id_name))

        return dict(id_name + name_id)

    return cache.get("tmdb-genres", lambda: _get_genres())

def get_genre_name(id):
    return get_genres()[id]


def get_genre_id(name):
    return get_genres()[name]

#TODO: add page no.
def search(query):
    def _search(query):
        search = tmdb.Search()
        response = search.movie(query=query)
        return list(search.results)
    
    return cache.get(f"tmdb-search-{query}", lambda: _search(query), max_age=timedelta(days=3))


def get_poster(result, **kwargs):
    config = get_config()

    secure_base_url = config.images["secure_base_url"]
    size = kwargs.get("poster_size", "w154")
    file_path = result["poster_path"]

    return f"{secure_base_url}{size}{file_path}"


def get_backdrop(result, **kwargs):
    config = get_config()

    secure_base_url = config.images["secure_base_url"]
    size = kwargs.get("backdrop_size", "w780")
    file_path = result["backdrop_path"]

    return f"{secure_base_url}{size}{file_path}"
