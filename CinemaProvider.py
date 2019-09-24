from abc import ABC, abstractmethod


class CinemaProvider(ABC):

    @abstractmethod
    def get_now_showing(self):
        pass

    @abstractmethod
    def get_coming_soon(self):
        pass

    @abstractmethod
    def get_cinemas(self):
        pass

    @abstractmethod
    def get_cinemas_showing_movie(self, movie):
        pass
