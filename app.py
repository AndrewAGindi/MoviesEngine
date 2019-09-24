from hoyts import HoytsProvider
from event import EventProvider
import tmdbwrapper as tmdb

hoyts = HoytsProvider()
event = EventProvider()

def no_duplicates(movies):
    def first_with_title(movies, title):
            for movie in movies:
                if movie.title == title:
                    return movie

    return [m for m in movies if m is first_with_title(movies, m.title)]

now_showing = no_duplicates(hoyts.get_now_showing() + event.get_now_showing())
coming_soon = no_duplicates(hoyts.get_coming_soon() + event.get_coming_soon())

model = {
    "now_showing": now_showing,
    "cinemas": hoyts.get_cinemas() + event.get_cinemas(),
    "coming_soon": coming_soon,
}

from flask import Flask, jsonify, request, session, flash, redirect, url_for,render_template, make_response
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
from User import User
from Movie import MovieEncoder, Movie

app = Flask(__name__)
app.json_encoder = MovieEncoder

app.secret_key = "my key"

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for("sign_in"))

@login_manager.user_loader
def load_user(username):
    return User.get(username)

User.add("admin", "admin@unsw.edu.au", "admin")

@app.route("/sign-in", methods=["GET", "POST"])
def sign_in():
    if request.method == "GET":
        return index()

    username = request.form.get("username", None)
    password = request.form.get("password", None)

    if username and password:
        user = User.get(username)
        if user and user.password == password:
            login_user(user)

            # set a cookie to indicate the user is authenticated
            response = make_response(redirect(url_for("index")))
            response.set_cookie("authenticated", value="true")
            
            return response

    return redirect(url_for("sign_in"))

@app.route("/api/sign-in/external", methods=["POST"])
def sign_in_google():
    content = request.json

    email = content["email"]
    name = content["name"]

    created = False
    user = User.get(email)
    if not user:
        print("COULD NOT FIND USER, CREATING...", user)
        created = True

        user = User.add(
            username=email,
            email=email,
            password=None,
        )

    print("USER:", user)

    login_user(user)

    # set a cookie to indicate the user is authenticated
    if created:
        response = make_response(redirect(url_for("preferences")))
    else:
        response = make_response(redirect(url_for("index")))

    response.set_cookie("authenticated", value="true")
    
    return response


@app.route("/api/watchlist")
@login_required
def watchlist():
    return jsonify(current_user.watchlist)

@app.route("/api/watchlist/<title>")
@login_required
# TODO: add persistence?
def add_movie_watchlist(title):
    movie = Movie.get(title)
    print(movie)
    if current_user.add_movie_to_watchlist(movie):
        for movie in current_user.watchlist:
            print(movie.title)
        return jsonify(movie)
    else:
        return jsonify({})

@app.route("/api/watchlist/remove/<title>")
@login_required
# TODO: add persistence?
def remove_movie_from_watchlist(title):
    title = title.replace("_", " ")
    movie = Movie.get(title)
    current_user.remove_movie_from_watchlist(movie)
    for m in current_user.watchlist:
        print(m.title)
    return jsonify(movie)

@app.route("/sign-out")
@login_required
def sign_out():
    logout_user()

    # modify authenticated cookie to indicate user is not authenticated
    response = make_response(redirect(url_for("index")))
    response.set_cookie("authenticated", value="false")

    return response

@app.route("/sign-up", methods=["GET", "POST"])
def sign_up():
    if request.method == "GET":
        return index()

    username = request.form.get("username", None)
    email = request.form.get("email", None)
    password = request.form.get("password", None)

    if username and email and password:
        user = User.add(
            username=username,
            email=email,
            password=password,
        )
        login_user(user)
        response = make_response(redirect(url_for("preferences")))
        response.set_cookie("authenticated", value="true")

        return response

    return redirect(url_for("sign_up"))

@app.route("/preferences", methods=["GET","POST"])
def preferences():
    if request.method == "GET":
        return index()

    # TODO: process the form data
    return redirect(url_for("index"))

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path=None):
    return app.send_static_file("index.html")

@app.route("/api/movies/<name>/")
def movies(name):
    # grab info back from movie name
    movie = name.replace("_", " ")
    tmdb_results = tmdb.search(movie)
    result = {}

    if len(tmdb_results) == 0:
        result = {
            "title": movie,
            "posterURL": "",
            "genres": [],
            "popularity": 0,
            "summary": "Movie is not currently available. Please try again later.",
        }
    else:
        # get top result
        info = tmdb_results[0]
        result = {
            "title": info["title"],
            "posterURL": tmdb.get_poster(info),
            "genres": [tmdb.get_genre_name(id) for id in info["genre_ids"]],
            "popularity": info["popularity"],
            "summary": info["overview"],
        }
    return jsonify(result)

@app.route("/api/cinemas/movies/<name>/<date>")
# date is in format "YYYY-MM-DD"
def cinemas_showing_movie(name, date):
    # date = None
    # if request.method == "POST":
        # date = request.form(['date'])
    event_name = name.replace("_", " ")
    hoyts_name = name.replace("_", "-")
    # remove special symbols from name
    translation_table = dict.fromkeys(map(ord, '!@#$'), None)
    hoyts_name = (hoyts_name.translate(translation_table)).lower()

    result = event.get_cinemas_showing_movie(event_name, date) + hoyts.get_cinemas_showing_movie(hoyts_name, date)

    return jsonify(result)


@app.route("/api/now-showing")
def now_showing():
    return jsonify(model["now_showing"])

@app.route("/api/cinemas")
def cinemas():
    return jsonify(model["cinemas"])

@app.route("/api/cinemas/event")
def ec():
    return jsonify(event.get_cinemas())

@app.route("/api/coming-soon")
def coming_soon():
    return jsonify(model["coming_soon"])
