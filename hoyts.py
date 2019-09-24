from lxml import etree
import tmdbwrapper as tmdb
import functools
from operator import itemgetter

from dev_cache import cache

from CinemaProvider import CinemaProvider
from Movie import Movie
from datetime import datetime


class HoytsProvider(CinemaProvider):

    @property
    def brand(self):
        return "HOYTS"

    def get_now_showing(self):
        # get all movies now showing
        r = cache.get_url("https://www.hoyts.com.au/api/movie/all?retrieveAll=true")
        json = r.json()

        # extract the list of movies from the json response
        movies_raw = json["viewModel"][1]["contentTabs"]["tabs"][0]["contents"][0]["movieGrid"]["tiles"]

        # normalize the movie results and remove the entries that are ads
        movies = filter(lambda x: "ad" not in x, movies_raw)
        movies = map(lambda x: self.normalize_movie(x), movies)
        movies = filter(lambda x: x is not None, movies)
        movies = list(movies)

        #return [self.normalize_movie(movie) for movie in movies_raw if not "ad" in movie]
        return movies

    def get_coming_soon(self):
        # get all movies coming soon
        r = cache.get_url("https://www.hoyts.com.au/api/movie/all?retrieveAll=true")
        json = r.json()

        # extract the months from the json response
        _, *months = json["viewModel"][1]["contentTabs"]["tabs"][1]["contents"]

        # map each month into its list of movies then reduce to flatten
        movies_raw = functools.reduce(list.__add__, map(lambda x: x["movieGrid"]["tiles"], months))

        # normalize the movie results
        movies = map(lambda x: self.normalize_movie(x), movies_raw)
        movies = filter(lambda x: x is not None, movies)
        movies = list(movies)

        #return [self.normalize_movie(movie) for movie in movies_raw]
        return movies

    def get_cinemas(self):
        json = self.get_cinemas_raw_data()
        # normalize the results
        return [self.normalize_cinema(cinema) for cinema in json]

    def normalize_movie(self, movie):
        tmdb_results = tmdb.search(movie["name"])

        if len(tmdb_results) == 0:
            # TODO: use hoyts' data if tmdb fails
            return None

        # if this proves inaccurate, then later compare the result["release_date"] to movie["releaseDate"]
        #r = sorted(tmdb_results, key=itemgetter("release_date"), reverse=True)[0]
        r = tmdb_results[0]

        return Movie.from_tmdb_result(r)

    def normalize_cinema(self, cinema):
        cinema_name = cinema["cinemaName"]
        url_name = cinema["urlName"]

        return {
            "name": cinema["cinemaName"],
            "cinemaId": cinema["vistaId"],
            "lat": float(cinema["latitude"]),
            "lng": float(cinema["longitude"]),
            "address": cinema["streetAddress"],
            "suburb": cinema["suburb"],
            "postCode": cinema["postCode"],
            "state": cinema["state"],
            "brand": "{self.brand}",
            "longName": f"{self.brand} {cinema_name}",
            "logo": "/static/img/logo-hoyts.png",
            "url": f"https://www.hoyts.com.au/cinemas/{url_name}",
            "sessions": []
        }

    def get_cinemas_raw_data(self):
        # get all cinemas
        r = cache.get_url("https://www.hoyts.com.au/api/cinema")
        json = r.json()
        return json

    # sample session api for hoyts
    # https://www.hoyts.com.au/api/movie/shazam/details?cinemaIds=BANKTN&cinemaIds=EGDENS&numDays=0&retrieveAll=true&startTime=20-Apr-2019
    def get_cinemas_showing_movie(self, movie_name, date):
        cinemas = self.get_cinemas()
        # get date back to intended format 
        
        date_cpy = datetime.strptime(date, '%Y-%m-%d')
        date_cpy = date_cpy.strftime("%d-%b-%Y")
        url = f"https://www.hoyts.com.au/api/movie/{movie_name}/details?"
        for cinema in cinemas:
            url += "cinemaIds=" + cinema["cinemaId"] + "&"
        url += f"retrieveAll=true&startTime={date_cpy}"
        r = cache.get_url(url)
        json_dict = r.json()
        
        for cinema in json_dict["viewModel"]:
            # deal with the movie info
            if "movieSession" not in cinema:
                continue
            else:
                # FIXME: O(n^2)!!!!! super slow
                for session in cinema["movieSession"]["sessions"]:
                    if session["startTime"][0:10] == date:
                        for c in cinemas:
                            if c["cinemaId"] == session["cinemaId"]:
                                # url for buying ticket
                                # https://www.hoyts.com.au/movies/purchase?cinemaId=BANKTN&sessionId=202849&refreshed=1
                                # f string doesn't work with dict???
                                ticket_url = "https://www.hoyts.com.au/movies/purchase?cinemaId=" + c["cinemaId"] + "&sessionId=" + session.get("sessionId") +"&refreshed=1"
                                s = {"time": session["startTime"], "url": ticket_url}
                                c["sessions"].append(s)
                                break
        cinemas[:] = [c for c in cinemas if c.get("sessions") != []]
        return cinemas


                        
                    

