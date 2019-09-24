from event import EventProvider
event = EventProvider()
import json
f = open("test.json", "w")
f.write(json.dumps(event.get_cinemas_showing_movie("Hellboy", "2019-04-16")))
f.close()