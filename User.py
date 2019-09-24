from flask_login import UserMixin
from dev_cache import cache

users = {}


class User(UserMixin):

    @staticmethod
    def get(username):
        print(users, username)
        try:
            return users[username]
        except KeyError:
            return None

    @staticmethod
    def add(username, email, password):
        obj = User(username, email, password)
        users[username] = obj

        return obj

    def __init__(self, username, email, password, watchlist=[]):
        self.username = username
        self.email = email
        self.password = password
        self._watchlist = []

    def get_id(user):
        return user.username

    def add_movie_to_watchlist(self, movie):
        # implement as dict to increase speed?
        if movie not in self.watchlist:
            self.watchlist.append(movie)
            return True
        return False
    
    def remove_movie_from_watchlist(self, movie):
        self.watchlist.remove(movie)
    
    @property
    def watchlist(self):
        return self._watchlist
    
    @watchlist.setter
    def watchlist(self, value):
        self.watchlist = value
