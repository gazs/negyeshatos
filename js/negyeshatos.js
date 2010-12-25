var ll2eov = function (x,y) {
  // ez a bkv útvonaltervezőjének baltával szétszedett kódja
  // ha nem is olvashatóvá, de áttekinthetővé téve
  if (x > 18.67 && x < 19.73 && y > 47.07 && y < 47.78 &&
      !isNaN(x) && !isNaN(y)) { 
      var rad, rk, k2, exc, Lk, R, red, fk, FI, LA, f, l;
      rad = Math.PI / 180,
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
      x = Math.round(eovxC(FI, LA));
      y = Math.round(eovyC(FI, LA)); 
      return [x, y];
    }
} 

// parasztjson lol
var g_arrAddressList = [],
    g_Route = [],
    kamu = function () {
      return true;
    },
    ShowAddress,
    FillAddress,
    HereIam;
ShowAddress = FillAddress = HereIam = kamu;

// parasztcallback lol
var FillRoute = function () {
  $("#utinfo").empty();
  // Álljunk meg egy szóra, hogy mennyire undorító ez már. a 
  // fejlesztők nem hogy a JSON-ról, az object notationról se
  // hallottak, plusz az egész meg van szórva a hungarian
  // notationnek egy teljesen beteg mutációjával: arr meg str
  // oké, de ki hallott már 1.26666667 értékű integerről?
  var felszallsz = true,
      resz,
      seta,
      subs,
      utvonal,
      d;
  $("#ut").empty();
  g_Route.m_arrMains[0].m_arrSubs.reverse();
  utvonal = [];
  while (g_Route.m_arrMains[0].m_arrSubs.length > 0) {
    subs = g_Route.m_arrMains[0].m_arrSubs.pop();
    if (subs.m_arrBkvLines.length > 0) {
      //resz = $("<ul>").data('role', 'listview').data('inset', 'true');
      resz = [];
      while (subs.m_arrBkvLines.length > 0) {
        // mindahány járat ugyanonnan ugyanaddig megy, ugye?
        d = subs.m_arrBkvLines.pop();
        if (subs.m_arrBkvLines.length === 0) {
          resz.push({
              jarat_szama: d.m_strName,
              css_osztaly: d.m_strClass,
              jarat_tipusa: d.m_strVType.toLowerCase(),
              jarat_menetrend_link: d.m_strLink,
              felszallo_megallo: subs.m_strStopFrom,
              utazott_megallok: d.m_iStops,
              leszallo_megallo: subs.m_strStopTo,
              utazas_hossza: subs.m_iTravelMinutes
              });
        }
        //if (subs.m_arrBkvLines.length === 0) {
          //felszallsz = false;
        //}
      }
    } else {
      seta++;
    }
    //$("#utinfo").html(g_Route.m_iTravelMinutes + " perc menetidő")
    //$("#ut").append(resz);
    utvonal.push(resz);
  }
  //console.log(utvonal);
  $("#utvonaltervtemplate").tmpl(utvonal).appendTo("#elsolepes > div");
  //$("#ut ul").listview();
  //$.mobile.changePage("#masodiklepes");
  //$("<img>").attr("src", "http://maps.google.com/maps/api/staticmap?size=320x320&center=" + $('#uticel').data("lat") + ","+$('#uticel').data("lng")  + "&zoom=15&markers=color:blue|47.5076428,19.0881152&sensor=false").appendTo("#ut");
};

var tervezz = function (x1, y1, x2, y2) {
  // az x a 19 körüli, az y a 47 körüli érték
  var eov1 = ll2eov(x1, y1),
      eov2 = ll2eov(x2, y2);
  $.ajax({
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



var geokod = function (a, callback) {
  var koder, params;
  koder = new google.maps.Geocoder();
  params = {
    "language": "hu",
    "region": "hu",
  };
  if (a.address) {
    params.address = a.address;
    params.bounds = new google.maps.LatLngBounds(
        // ezek biza Pest határai Szergej és Larry szerint
        new google.maps.LatLng(47.3515010, 18.9251690), 
        new google.maps.LatLng(47.6133620, 19.3339160)) 
  }
  if (a.lat && a.lng) {
    var latlng = new google.maps.LatLng(a.lat, a.lng);
    params.latLng = latlng;
  }
  if (a.selector) {
  koder.geocode(params, function (result, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      callback(result[0]);
      //$(a.selector).data("lat", result[0].geometry.location.sa)
      //$(a.selector).data("lng", result[0].geometry.location.ta);
      //if (a.lat) {
        //$(a.selector).val(result[0].formatted_address);
      //}
    }
  });
  }
}

