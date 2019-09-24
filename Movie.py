import tmdbwrapper as tmdb
from flask.json import JSONEncoder

movie = {}

class Movie:

    @staticmethod
    def get(title):
        try:
            return movie[title]
        except KeyError:
            return None

    @classmethod
    def from_tmdb_result(constructor, result):
        # Halve the rating so it's out of 5
        rating = result["vote_average"] / 2

        return constructor(
            title=result["title"],
            summary=result["overview"],
            genres=[tmdb.get_genre_name(id) for id in result["genre_ids"]],
            poster_url=tmdb.get_poster(result),
            backdrop_url=tmdb.get_backdrop(result),
            popularity=result["popularity"],
            rating=rating,
        )

    def __init__(self, *, title, summary, **kwargs):
        # Required information
        self._title = title
        self._summary = summary

        # Optional information
        self._genres = kwargs.get("genres", [])
        self._poster_url = kwargs.get("poster_url", None)
        self._backdrop_url = kwargs.get("backdrop_url", None)
        self._popularity = kwargs.get("popularity", 0)
        self._rating = kwargs.get("rating", 0)
        movie[title] = self

    @property
    def title(self):
        return self._title

    @property
    def summary(self):
        return self._summary

    @property
    def genres(self):
        return self._genres

    @property
    def poster_url(self):
        return self._poster_url

    @property
    def backdrop_url(self):
        return self._backdrop_url

    @property
    def popularity(self):
        return self._popularity

    @property
    def rating(self):
        return self._rating

    def serialize(self):
        return {
            "title": self.title,
            "summary": self.summary,
            "genres": self.genres,
            "posterURL": self.poster_url,
            "backdropURL": self.backdrop_url,
            "popularity": self.popularity,
            "rating": self.rating,
        }
    

class MovieEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Movie):
            return obj.serialize()
        else:
            super().default(obj)
