var reverz = function (lat, lng) {
  var geocoder = new google.maps.Geocoder(),
      bla = new google.maps.LatLng(lat, lng);
  geocoder.geocode({"latLng": bla}, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      jQuery("#from").val(results[0].formatted_address)
                     .data("lat", lat)
                     .data("lon", lng);
    }
  });
};

var geokod = function (text, obj) {
  var koder = new google.maps.Geocoder(),
      params = {
  //crockford barátom, miért ide akarod ezt indentálni?
  //legyen igazad meg minden, de azért örülnék ha megmagyaráznád.
    "address": text,
    "language": "hu",
    "region": "hu",
    "bounds": new google.maps.LatLngBounds(
        // ezek biza Pest határai Szergej és Larry szerint
        new google.maps.LatLng(47.3515010, 18.9251690), 
        new google.maps.LatLng(47.6133620, 19.3339160)) 
  };
  koder.geocode(params, function (c) {
        jQuery(obj).data("lat", c[0].geometry.location.b)
                   .data("lon", c[0].geometry.location.c);
      });
};
jQuery(document).ready(function(){
    jQuery("#to a").click(function(){
      jQuery("#masodiklepes #uticel").html($(this).html());
    })
    if (geo_position_js.init()) {
      geo_position_js.getCurrentPosition(
        function (position) {
          reverz(position.coords.latitude, position.coords.longitude);
        },
        function (error) {
          jQuery("#from").val("?");
        });
    }
    else {
      jQuery("#from").val("?");
    }
})
