# -*- coding: utf-8 -*-
import datetime
from google.appengine.ext import webapp

register = webapp.template.create_template_register()
def ungettext(singular, plural, number):
  return singular if number == 1 else plural

def date_diff(d):

    now = datetime.datetime.now()
    today = datetime.datetime(now.year, now.month, now.day)
    delta = now - d
    delta_midnight = today - d
    days = delta.days
    hours = round(delta.seconds / 3600., 0)
    minutes = round(delta.seconds / 60., 0)
    chunks = (
        (365.0, lambda n: ungettext('éve', 'éve', n)),
        (30.0, lambda n: ungettext('hónapja', 'hónapja', n)),
        (7.0, lambda n : ungettext('hete', 'hete', n)),
        (1.0, lambda n : ungettext('napja', 'napja', n)),
    )
    
    if days == 0:
        if hours == 0:
            if minutes > 0:
                return ungettext('egy perce', \
                    '%(minutes)d perce', minutes) % \
                    {'minutes': minutes}
            else:
                return _("Pont most")
        else:
            return ungettext('egy órája', '%(hours)d órája', hours) \
            % {'hours':hours}

    if delta_midnight.days == 0:
        return _("tegnap  %s-kor") % d.strftime("%H:%M")

    count = 0
    for i, (chunk, name) in enumerate(chunks):
        if days >= chunk:
            count = round((delta_midnight.days + 1)/chunk, 0)
            break

    return _('%(number)d %(type)s') % \
        {'number': count, 'type': name(count)}

register.filter(date_diff)
