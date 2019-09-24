import lxml.html as html
import cssselect as css
import tmdbwrapper as tmdb

from dev_cache import cache

from CinemaProvider import CinemaProvider
from Movie import Movie

class EventProvider(CinemaProvider):

    @property
    def brand(self):
        return "EVENT"

    def get_now_showing(self):
        # get all movies now showing
        r = cache.get_url("https://www.eventcinemas.com.au/Movies/GetNowShowing")
        json = r.json()

        # extract the list of movies from the json response
        movies_raw = json["Data"]["Movies"]

        # normalize the movie results
        movies = map(lambda x: self.normalize_movie(x), movies_raw)
        movies = filter(lambda x: x is not None, movies)
        movies = list(movies)

        #return [self.normalize_movie(movie) for movie in movies_raw]
        return movies

    def get_coming_soon(self):
        # get all movies coming soon
        r = cache.get_url("https://www.eventcinemas.com.au/Movies/GetComingSoon")
        json = r.json()

        # extract the list of movies from the json response
        movies_raw = json["Data"]["Movies"]

        # normalize the movie results
        movies = map(lambda x: self.normalize_movie(x), movies_raw)
        movies = filter(lambda x: x is not None, movies)
        movies = list(movies)

        #return [self.normalize_movie(movie) for movie in movies_raw]
        return movies

    def get_cinemas_raw_data(self):
        # get all cinemas
        r = cache.get_url("https://www.eventcinemas.com.au/")
        doc = html.fromstring(r.content)

        selector = css.GenericTranslator().css_to_xpath("[data-lat]")

        cinemasRaw = doc.xpath(selector)
        return cinemasRaw

    def get_cinemas(self):
        cinemas_raw = self.get_cinemas_raw_data()
        # normalize the results
        return [self.normalize_cinema(cinema) for cinema in cinemas_raw]

    def get_cinemas_showing_movie(self, movie_name, date):
        r = cache.get_url("https://www.eventcinemas.com.au/Movies/GetNowShowing")
        json = r.json()

        matched_cinemas_ids = []
        # extract the movie matching the intended name
        # TODO: error handling
        for movie in json["Data"]["Movies"]:
            print(movie["Name"])
            if movie["Name"] == movie_name:
                matched_cinemas_ids = movie["CinemaIds"]
                break
        # get all cinemas raw data
        cinemas_raw = self.get_cinemas_raw_data()
        cinemas_showing_movie = []
        cinemas_showing_movie_id = []
        for cinema in cinemas_raw:
            if int(cinema.get("data-id")) in matched_cinemas_ids:
                cinemas_showing_movie.append(cinema)
                cinemas_showing_movie_id.append(int(cinema.get("data-id")))

        result = [self.normalize_cinema(c) for c in cinemas_showing_movie]
        sessions = self.get_sessions(movie_name, date, cinemas_showing_movie_id)
        # TODO: optimise by creating seen list...
        # TODO: map booking url with time
        for res in result:
            for key, session in sessions.items():
                if res["name"] ==  key:
                    res["sessions"] = session
        # filter results without sessions
        result[:] = [c for c in result if c.get("sessions") != []]
        return result

    # helper function: get session time
    # https://www.eventcinemas.com.au/Cinemas/GetSessions?cinemaIds=90&cinemaIds=91&cinemaIds=92&cinemaIds=93&date=2019-04-12
    def get_sessions(self, movie_name, date, cinemas_ids):
        url = "https://www.eventcinemas.com.au/Cinemas/GetSessions?"
        for num in cinemas_ids:
            url += f"cinemaIds={num}&"
        url += f"date={date}"
        r = cache.get_url(url)
        json_dict = r.json()
        sessions = {}
        for movie in json_dict["Data"]["Movies"]:
            if movie == []:
                break
            if movie["Name"] == movie_name:
                for cinema in movie["CinemaModels"]:
                    for session in cinema["Sessions"]:
                        # add as dict of session time and url
                        s = {"time": session["StartTime"], "url": session["BookingUrl"]}
                        sessions.setdefault(cinema["Name"], []).append(s)
                break
        return sessions

    def normalize_movie(self, movie):
        tmdb_results = tmdb.search(movie["Name"])

        if len(tmdb_results) == 0:
            return None

        r = tmdb_results[0]

        return Movie.from_tmdb_result(r)

    def normalize_cinema(self, c):
        #shortname = c.get("data-shortname")
        #name = shortname if len(shortname) > 0 else c.get("data-name")
        name = c.get("data-name")
        url = c.get("data-url")

        return {
            "name": name,
            "lat": float(c.get("data-lat")),
            "lng": float(c.get("data-long")),
            "state": c.get("data-state"),
            "brand": "EVENT",
            "longName": f"EVENT {name}",
            "logo": "/static/img/logo-event.png",
            "url": f"https://www.eventcinemas.com.au{url}",
            "sessions": [],
        }
