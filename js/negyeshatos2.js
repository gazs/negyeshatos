jQuery(document).ready(function(){
    locations = [
    {coords:{latitude:47.4943190, longitude:19.0599840}}
    ]
    geo_position_js_simulator.init(locations);

    if(geo_position_js.init()){
      geo_position_js.getCurrentPosition(
        function(position) {
          reverz(position.coords.latitude, position.coords.longitude);
        },
        function(error) {
          console.log(error);
        });
    }
    else{
     jQuery("#from").html("?");
    }

      $("#from").click(function(){
        var editbox = $("<input>").addClass("inplacecuccos")
        .val($(this).html())
        .width($(this).width());
        $(this).after(editbox).hide();  
        $('input').focus()
                  .blur(function() {
                    geokod($(this).val(), this);
                    var text = $(this)[0].value;
                    if (text != "") {
                      $(this).remove(); 
                      $("#from").html(text).show();
                    }
        })
      })


   $("form").submit(function(){
     var koordinatak = [];
     $("input").each(function(i,r) {
       koordinatak.push($(this).data("lon"));
       koordinatak.push($(this).data("lat")); 
     })
     tervezz.apply(this, koordinatak);
     return false
   })
})

// parasztjson lol
var g_arrAddressList = [],
    kamu = function() { return true };

ShowAddress = FillAddress = HereIam = kamu;

var FillRoute = function() {
  // Álljunk meg egy szóra, hogy mennyire undorító ez már. a 
  // fejlesztők nem hogy a JSON-ról, az object notatinról se
  // hallottak, plusz az egész meg van szórva a hungarian
  // notationnek egy teljesen beteg mutációjával: arr meg str
  // oké, de ki hallott már 1.26666667 értékű integerről?

  jQuery.each(g_Route.m_arrMains[0].m_arrSubs, function(a,b) {
        if (b.m_arrBkvLines.length > 0) {
          //..azaz nem sétálunk
          $("<div>").text(b.m_strStopFrom).appendTo($("body"));
          jQuery.each(b.m_arrBkvLines, function(c,d) {
              $("<a>").text(d.m_strName)
                      .addClass(d.m_strClass)
                      .attr("href", d.m_strLink)
                      .appendTo($("body"));
          });
        } 
      });


}

var reverz = function(lat,lng) {
  var geocoder = new google.maps.Geocoder();
  var bla = new google.maps.LatLng(lat,lng);
  geocoder.geocode({"latLng": bla}, function(results, status) {
    if (status = google.maps.GeocoderStatus.OK) {
        jQuery("#from").html(results[0].formatted_address)
                       .data("lat", lat)
                       .data("lon", lng);
    }
  })
}

var geokod = function(text, obj) {
  var koder = new google.maps.Geocoder(),
      params = {
        "address": text,
        "language": "hu",
        "region": "hu",
        "bounds": new google.maps.LatLngBounds(
            new google.maps.LatLng(47.3515010,18.9251690), 
            new google.maps.LatLng(47.6133620,19.3339160)) // ezek biza pest határai Szergej és Larry szerint
      }
  koder.geocode(params, function(c) {
        jQuery(obj).data("lat", c[0].geometry.location.b).data("lon", c[0].geometry.location.c)
  });
};

var tervezz = function(x1, y1, x2, y2) {
  // az x a 19 körüli, az y a 47 körüli érték
  var eov1 = ll2eov(x1, y1);
  var eov2 = ll2eov(x2, y2);
  jQuery.ajax({
        type: "GET",
        url: "http://bkv.utvonalterv.hu/NoTile.ashx?",
        dataType: "script",
        data: {
          "Command": "Traffic",
          "sessionID":"1449_2119731_5134837", // le fog ez valaha járni?
          "iCommandID": 1640,
          "appID": "bkv",
          "lang": "hu",
          "arrIDs": "0|1",
          "arrX": [eov1[0],eov2[0]].join("|"),//"650933.859855954|656853.36900102",
          "arrY": [eov1[1],eov2[1]].join("|"),//"238927.903992541|239946.882208016",
          "arrParsed": "undefined|undefined",
          "strTrafficType": "bkv",
          "iCarOptim": 0,
          "iBkvOptim": 0,
          "strTime": "2010/10/24/19:23",
          "iMaxWalkDist": 500
        },
        success: function(j) { return true },
        error: function(XMLHttpRequest, textStatus, errorThrown) { console.log(XMLHttpRequest.responseText) }
      })
}

var ll2eov = function(x,y) {
  // ez a bkv útvonaltervezőjének baltával szétszedett kódja
  var rad = Math.PI/180;
  var rk1=1.0031100083;
  var k2=1.0007197049;
  var exc=0.0818205679;
  var Lk=19.0485718*rad;
  var R=6379743;
  var red=0.99993;
  var fk=47.1*rad;
  eovxC = function(FI,L) {
    f=(Math.atan(rk1*Math.pow(Math.tan(Math.PI/4+FI/2),k2)*Math.pow((1-exc*Math.sin(FI))/(1+exc*Math.sin(FI)),k2*exc/2))-Math.PI/4)*2;
    l=(L-Lk)*k2;
    return (R*red*Math.atan(Math.sin(l)/(Math.tan(f)*Math.sin(fk)+Math.cos(l)*Math.cos(fk)))+650000);
  };

  eovyC = function(FI,L) {
    f=(Math.atan(rk1*Math.pow(Math.tan(Math.PI/4+FI/2),k2)*Math.pow((1-exc*Math.sin(FI))/(1+exc*Math.sin(FI)),k2*exc/2))-Math.PI/4)*2;
    l=(L-Lk)*k2;
    return (R/2*red*Math.log((1+Math.cos(fk)*Math.sin(f)-Math.sin(fk)*Math.cos(f)*Math.cos(l))/(1-Math.cos(fk)*Math.sin(f)+Math.sin(fk)*Math.cos(f)*Math.cos(l)))+200000);
  };

  if ( x > 18.67 && x < 19.73 && y > 47.07 && y < 47.78 && !isNaN(x) && !isNaN(y) ) { 
    FI=y*rad; LA=x*rad; x=Math.round(eovxC(FI,LA));
    y=Math.round(eovyC(FI,LA)); 
    return [x, y];
  } 
};

