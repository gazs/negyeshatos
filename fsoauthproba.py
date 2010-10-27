import foursquare

oauth_key = "5D10T01NV0LF3X54FS2AW5IVN0CE5UOGE2QF0VLHQZ3T4ORA"
oauth_secret = "WQSGWIWEBAUFDIYNCQISW2JX04PUGER4RTFIDW1YNINZ0PBO"

credentials = foursquare.OAuthCredentials(oauth_key, oauth_secret)
fs = foursquare.Foursquare(credentials)
app_token = fs.request_token(oauth_callback='bla')
app_url = fs.authorize(app_token)


print app_url
# goto app_url!
# sima redirekt?

user_token = fs.access_token(app_token)
credentials.set_access_token(user_token)
fs.user()
