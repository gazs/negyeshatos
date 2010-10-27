

var ll2eov = function (x, y) {
  // ez a bkv útvonaltervezőjének baltával szétszedett kódja
  // ha nem is olvashatóvá, de áttekinthetővé téve
  var rad = Math.PI / 180,
      rk1 = 1.0031100083,
      k2 = 1.0007197049,
      exc = 0.0818205679,
      Lk = 19.0485718 * rad,
      R = 6379743,
      red = 0.99993,
      fk = 47.1 * rad,
      FI = y * rad,
      LA = x * rad,
      f = (Math.atan(rk1 * Math.pow(Math.tan(Math.PI / 4 + FI / 2), k2) *
                 Math.pow((1 - exc * Math.sin(FI)) / (1 + exc * Math.sin(FI)), 
                 k2 * exc / 2)) - Math.PI / 4) * 2,
      l = (LA - Lk) * k2,
      eovxC = function () {
        return (R * red * Math.atan(Math.sin(l) / (Math.tan(f) * Math.sin(fk) + 
                Math.cos(l) * Math.cos(fk))) + 650000);
      },
      eovyC = function () {
        return (R / 2 * red * Math.log((1 + Math.cos(fk) * Math.sin(f) - 
                Math.sin(fk) * Math.cos(f) * Math.cos(l)) / (1 - Math.cos(fk) * 
                Math.sin(f) + Math.sin(fk) * Math.cos(f) * Math.cos(l))) + 
                200000);
      };

  if (x > 18.67 && x < 19.73 && y > 47.07 && y < 47.78 &&
      !isNaN(x) && !isNaN(y)) { 
    x = Math.round(eovxC(FI, LA));
    y = Math.round(eovyC(FI, LA)); 
    return [x, y];
  } 
};

var utvonalszakasz = function (fel_v_at, jarmu, jarmufajta, menetrendlink, 
    felszallsz, megallo, leszallsz, menetido) {
  // REWRITE ME !!!!

  //var link = jQuery("<a>").text(jarmu)
  //.addClass(jarmufajta)
  //.attr("href", menetrendlink),
  var utvonal = jQuery("<div>").addClass("utvonal")
    .html([
    (fel_v_at ? "Felszállsz" : "Átszállsz"),
    felszallsz,
    " megállónál egy",
    jarmu,
    "-ös",
    jarmufajta,
    "-ra, majd",
    megallo,
    "megállót mész",
    leszallsz,
    "-ig (",
    parseInt(menetido, 10),
    "p)"
  ].join(" "));
  return utvonal; 
};


var tervezz = function (x1, y1, x2, y2) {
  // az x a 19 körüli, az y a 47 körüli érték
  var eov1 = ll2eov(x1, y1),
      eov2 = ll2eov(x2, y2);
  jQuery.ajax({
    type: "GET",
    url: "http://bkv.utvonalterv.hu/NoTile.ashx?",
    dataType: "script",
    data: {
      "Command": "Traffic",
      "sessionID": "1449_2119731_5134837", // le fog ez valaha járni?
      "iCommandID": 1640,
      "appID": "bkv",
      "lang": "hu",
      "arrIDs": "0|1",
      "arrX": [eov1[0], eov2[0]].join("|"), 
      "arrY": [eov1[1], eov2[1]].join("|"), 
      "arrParsed": "undefined|undefined",
      "strTrafficType": "bkv",
      "iCarOptim": 0,
      "iBkvOptim": 0,
      "strTime": "2010/10/24/19:23",
      "iMaxWalkDist": 500
    },
    success: function (j) {
              return true;
            },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
              alert("nem megy a bkv útvonaltervező, szólj g-nek!");
            }
  });
};

var reverz = function (lat, lng) {
  var geocoder = new google.maps.Geocoder(),
      bla = new google.maps.LatLng(lat, lng);
  geocoder.geocode({"latLng": bla}, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      jQuery("#from").html(results[0].formatted_address)
                     .data("lat", lat)
                     .data("lon", lng);
    }
  });
};

var geokod = function (text, obj) {
  console.log(text,obj);
  var koder = new google.maps.Geocoder(),
      params = {
  //crockford barátom, miért ide akarod ezt indentálni?
  //legyen igazad meg minden, de azért örülnék ha megmagyaráznád.
    "address": text,
    "language": "hu",
    "region": "hu",
    "bounds": new google.maps.LatLngBounds(
        // ezek biza pest határai Szergej és Larry szerint
        new google.maps.LatLng(47.3515010, 18.9251690), 
        new google.maps.LatLng(47.6133620, 19.3339160)) 
  };
  koder.geocode(params, function (c) {
        jQuery(obj).data("lat", c[0].geometry.location.b)
                   .data("lon", c[0].geometry.location.c);
      });
};


// parasztjson lol
var g_arrAddressList = [],
    kamu = function () {
      return true;
    },
    ShowAddress,
    FillAddress,
    HereIam;

ShowAddress = FillAddress = HereIam = kamu;

var FillRoute = function () {
  // Álljunk meg egy szóra, hogy mennyire undorító ez már. a 
  // fejlesztők nem hogy a JSON-ról, az object notationról se
  // hallottak, plusz az egész meg van szórva a hungarian
  // notationnek egy teljesen beteg mutációjával: arr meg str
  // oké, de ki hallott már 1.26666667 értékű integerről?
  jQuery("#bkv").html("");
  var felszallsz = true,
      seta,
      subs,
      d;
  while (g_Route.m_arrMains[0].m_arrSubs.length > 0) {
   // var bkv = g_Route.m_arrMains[0];
   // with (g_Route.m_arrMains[0]) { 
   // crockford lesújtó pillantást vet rám.
   // de nem akarom milliószor végigírni azt a 
   // rengeteg cuccot. hogy csináljam szépen?
    subs = g_Route.m_arrMains[0].m_arrSubs.pop();
    if (subs.m_arrBkvLines.length > 0) {
      while (subs.m_arrBkvLines.length > 0) {
        // mindahány járat ugyanonnan ugyanaddig megy, ugye?
        d = subs.m_arrBkvLines.pop();
        if (seta > 100) {
          jQuery("#bkv").append("<div>Elsétálsz " + seta + 
              " métert</div>");
          seta = 0;
        }
        jQuery("#bkv").append(utvonalszakasz(felszallsz, d.m_strName, 
              d.m_strVType, d.m_strLink, subs.m_strStopFrom, d.m_iStops, 
              subs.m_strStopTo, subs.m_iTravelMinutes));
        if (subs.m_arrBkvLines.length === 0) {
          felszallsz = false;
        }
      }
    } else {
      seta += subs.m_iLength;
    }
  }
};



jQuery(document).ready(function () {
    var locations = [
      {coords:
        {latitude: 47.4943190,
         longitude: 19.0599840}
      }
    ];
    // geo_position_js_simulator.init(locations);
    

    if (geo_position_js.init()) {
      geo_position_js.getCurrentPosition(
        function (position) {
          reverz(position.coords.latitude, position.coords.longitude);
        },
        function (error) {
          jQuery("#from").html("?");
        });
    }
    else {
      jQuery("#from").html("?");
    }

    jQuery("#from").click(function () {
      var editbox = jQuery("<input>").addClass("inplacecuccos")
      .val(jQuery(this).html())
      .width(jQuery(this).width());
      jQuery(this).after(editbox).hide();  
      jQuery('input').focus()
                .blur(function () {
                  geokod(jQuery(this).val(), $("#from"));
                  var text = jQuery(this)[0].value;
                  if (text !== "") {
                    jQuery(this).remove(); 
                    jQuery("#from").html(text).show();
                  }
                });
    });

    jQuery.getJSON("/merrevagytok?", function (json) {
      jQuery.each(json, function (i, e) {
        var venue = jQuery("<div>").addClass("fsvenue"),
            friendshere = jQuery("<div>").addClass("fsfriendshere"),
            venuename = jQuery("<div>").addClass("fsvenuename");
        venue.html(jQuery("<img>").attr("src", e.icon));
        venue.data("lat", e.geolat)
             .data("lon", e.geolong);
        venuename.html(e.name);
        jQuery.each(e.here, function (j, f) {
          jQuery("<img>").attr("src", f.photo)
                    .attr("title", f.lastname + " " + f.firstname)
                    .appendTo(jQuery(friendshere));
        });
        jQuery(friendshere).appendTo(venuename);
        venuename.appendTo(venue);
        venue.click(function () {
          if (jQuery(".fsvenue:visible").length === 1) {
            jQuery("#bkv").html("");
            jQuery(this).toggleClass("selected");
            jQuery(".fsvenue").fadeIn();
          } else {
            jQuery(".fsvenue").fadeOut();
            jQuery(this).toggleClass("selected").fadeIn();
            jQuery("#bkv").html("spinner!");
            // a shit ami happenel, maga a varázslat,
            // ladies and germs, the moment we've all
            // been waiting for, i give you...
            var koordinatak = [];
            koordinatak.push(jQuery("#from").data("lon"));
            koordinatak.push(jQuery("#from").data("lat"));
            koordinatak.push(jQuery(this).data("lon"));
            koordinatak.push(jQuery(this).data("lat")); 
            tervezz.apply(this, koordinatak);
          }
        });
        venue.append("<div style='clear:both'>")
             .appendTo(jQuery("#foursquare"));
      });
    });

    jQuery("form").submit(function () {
      var koordinatak = [];
      jQuery("input").each(function (i, r) {
        koordinatak.push(jQuery(this).data("lon"));
        koordinatak.push(jQuery(this).data("lat")); 
      });
      tervezz.apply(this, koordinatak);
      return false;
    });
  });
