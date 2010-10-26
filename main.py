#!/usr/bin/env python
# -*- coding: utf-8 -*-
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template

import foursquare

#dátumok egymásból kivonására, bleh.
import time
from rfc822 import parsedate

class MainHandler(webapp.RequestHandler):
  def get(self):
    self.response.out.write(template.render(os.path.join(os.path.dirname(__file__), 'html/index.html'), {}))

class VenueHandler(webapp.RequestHandler):
    def get(self):
        from django.utils import simplejson
        import foursquare
        fs = foursquare.Foursquare(foursquare.BasicCredentials('gazs@bergengocia.net', 'asdfasdf'))
        venyuz = []
        for checkin in fs.checkins()['checkins']:
          if 'venue' in checkin:
            venue = checkin['venue']
            user = checkin['user']
            # ha létezik a venyuzban a venyu, akkor csak a dátumot és az ottlevőket frissítse
            # nemszép! pfuj! fixme!
            venyunevek = [x['name'] for x in venyuz]
            if venue['name'] in venyunevek:
              ezittmost = venyuz[venyunevek.index(venue['name'])]
              ezittmost.append(user)
              if time.mktime(parsedate(ezittmost['lastseen'])) - time.mktime(parsedate(checkin['created'])) < 0:
                ezittmost['lastseen'] = checkin['created'] # új frissebb (nagyobb a timestamp) mint régi
                # ... ugye?
            else:
            # ha még nincs, akkor adja hozzá
              venyuz.append({
                'name': venue['name'],
                'geolat': venue['geolat'],
                'geolong': venue['geolong'],
                'lastseen': checkin['created'],
                'here': [user]
                })
        self.response.out.write(simplejson.dumps(venyuz))

def main():
    application = webapp.WSGIApplication([('/merrevagytok?', VenueHandler),
                                          ('/', MainHandler)
                                         ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
