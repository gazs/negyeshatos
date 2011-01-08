#!/usr/bin/env python
# -*- coding: utf-8 -*-
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import os


from google.appengine.ext import db

from google.appengine.ext.webapp import template
#webapp.template.register_template_library('datediff')
from datediff import date_diff

import foursquare
import oauth
import uuid
from django.utils import simplejson

#dátumok egymásból kivonására, bleh.
from datetime import datetime
import time
from rfc822 import parsedate

from titkok import oauth_key, oauth_secret

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
    #if "4sqid" in self.request.cookies:
    #venyuz = holvagytok(self.request.cookies['4sqid'])
    hamlpath = os.path.join(os.path.dirname(__file__), 'html/index.html')
    self.response.out.write(open(hamlpath).read()) #template.render(hamlpath, {'title': 'Négyeshatos', 'venyuz': venyuz}, debug=False))
    #else:
      #self.redirect('/oauth')

class AboutHandler(webapp.RequestHandler):
  def get(self):
    if "Mobile" in self.request.headers['User-Agent']:
      self.redirect('/app')
    else:
      aboutpage = os.path.join(os.path.dirname(__file__), 'html/teaser.html')
      self.response.out.write(template.render(aboutpage, {}))

class OauthProba(webapp.RequestHandler):
  def get(self):
    credentials = foursquare.OAuthCredentials(oauth_key, oauth_secret)
    fs = foursquare.Foursquare(credentials)

    oauth_token = self.request.get("oauth_token")
    if not oauth_token:
      app_token = fs.request_token()
      app_url = fs.authenticate(app_token)
      new_apptoken = AppToken(token = app_token.key, secret = app_token.secret)
      new_apptoken.put()
      self.redirect(app_url)
    else:
      app_token = AppToken.all().filter('token = ', oauth_token).get() 
      oauth_verifier = self.request.get("oauth_verifier")
      user_token = fs.access_token(oauth.OAuthToken(app_token.token, app_token.secret), oauth_verifier)
      credentials.set_access_token(user_token)
      cookie = str(uuid.uuid4())
      new_cookietoken = CookieToken(token = user_token.key, secret = user_token.secret, cookie = cookie) 
      new_cookietoken.put()
      self.response.headers.add_header('Set-Cookie', '4sqid = ' + cookie)
      # ha jól értem, dobhatjuk is ki az app_tokent. hát EZÉRT érdemes volt.
      app_token.delete()
      self.redirect('/app')

def holvagytok(cookie):
  cookietoken = CookieToken.all().filter('cookie = ', cookie).get()
  credentials = foursquare.OAuthCredentials(oauth_key, oauth_secret)
  user_token = oauth.OAuthToken(cookietoken.token, cookietoken.secret)
  credentials.set_access_token(user_token)
  fs = foursquare.Foursquare(credentials)
  fscheckins = fs.checkins()['checkins']
  venyuz = []
  for checkin in fscheckins:
    if 'venue' in checkin:
      venue = checkin['venue']
      user = checkin['user']
      # ha létezik a venyuzban a venyu, akkor csak a dátumot és az ottlevőket frissítse
      # nemszép! pfuj! fixme!
      venyunevek = [x['name'] for x in venyuz]
      checkintimetuple = date_diff(datetime.fromtimestamp(time.mktime(parsedate(checkin['created'])))).decode("utf-8")
      if venue['name'] in venyunevek:
        ezittmost = venyuz[venyunevek.index(venue['name'])]
        #logging.error(ezittmost)
        ezittmost['here'].append(user)
        if checkintimetuple > ezittmost['lastseen']:
          ezittmost['lastseen'] = checkintimetuple
      else:
      # ha még nincs, akkor adja hozzá
        if 'geolat' in venue:
          venyuz.append({
            'name': venue['name'],
            'geolat': venue['geolat'],
            'geolong': venue['geolong'],
            'lastseen': checkintimetuple,
            'here': [user]
                })
        else:
          pass
  return venyuz

class KikVagytok(webapp.RequestHandler):
  def get(self):
    ck = CookieToken.all()
    a = [x.token for x in ck]
    self.response.out.write(" ".join(a))


class VenueHandler(webapp.RequestHandler):
    def get(self):
        cookie = self.request.cookies['4sqid']
        venyuz = holvagytok(cookie)
        #dthandler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) 
        self.response.out.write(simplejson.dumps(venyuz))

def main():
    #logging.getLogger().setLevel(logging.DEBUG)
    application = webapp.WSGIApplication([('/merrevagytok?', VenueHandler),
                                          #('/kikvagytok', KikVagytok),
                                          ('/oauth', OauthProba),
                                          ('/app', MainHandler),
                                          ('/', AboutHandler)
                                         ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
