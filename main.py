#!/usr/bin/env python
# -*- coding: utf-8 -*-
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os
from google.appengine.ext.webapp import template
from google.appengine.ext import db

import foursquare
import oauth
import uuid

#dátumok egymásból kivonására, bleh.
import time
from rfc822 import parsedate

class AppToken(db.Model):
    token = db.StringProperty(required=True)
    secret = db.StringProperty(required=True)
    created = db.DateTimeProperty(auto_now_add=True)

class CookieToken(db.Model):
  cookie = db.StringProperty(required=True)
  token = db.StringProperty(required=True)
  secret = db.StringProperty(required=True)

class MainHandler(webapp.RequestHandler):
  def get(self):
    self.response.out.write(template.render(os.path.join(os.path.dirname(__file__), 'html/index.html'), {}))

class OauthProba(webapp.RequestHandler):
  def get(self):
    oauth_key = "5D10T01NV0LF3X54FS2AW5IVN0CE5UOGE2QF0VLHQZ3T4ORA"
    oauth_secret = "WQSGWIWEBAUFDIYNCQISW2JX04PUGER4RTFIDW1YNINZ0PBO"
    credentials = foursquare.OAuthCredentials(oauth_key, oauth_secret)
    fs = foursquare.Foursquare(credentials)

    oauth_token = self.request.get("oauth_token")
    if not oauth_token:
      app_token = fs.request_token()#oauth_callback='http://localhost:8080/oauthproba')
      app_url = fs.authorize(app_token)
      new_apptoken = AppToken(token = app_token.key, secret = app_token.secret)
      new_apptoken.put()
      self.redirect(app_url)
    else:
      app_token = AppToken.all().filter('token = ', oauth_token).get() 
      oauth_verifier = self.request.get("oauth_verifier")
      user_token = fs.access_token(oauth.OAuthToken(app_token.token, app_token.secret), oauth_verifier)
      credentials.set_access_token(user_token)
      permatoken = credentials.get_access_token()
      cookie = str(uuid.uuid4())
      new_cookietoken = CookieToken(token = permatoken.key, secret = permatoken.secret, cookie = cookie) 
      new_cookietoken.put()
      self.response.headers.add_header('Set-Cookie', '4sqid = ' + cookie)
      # ha jól értem, dobhatjuk is ki az app_tokent
      app_token.delete()
      self.redirect('/')


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
                                          ('/oauthproba', OauthProba),
                                          ('/', MainHandler)
                                         ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
