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
var zeroify = function(s) {
  if (String(s).length == 1) {
    return "0" + s;
  } else {
    return s; 
  }
};
var bkv_request = function() {
  var a = new Date();
  var r = Math.round(new Date().getTime() * Math.random());

  var opt_mode = "speed"; // speed, walk, transfer
  var fromX = $(":input[name=from-x]").val();
  var fromY = $(":input[name=from-y]").val();
  var toX = $(":input[name=to-x]").val();
  var toY = $(":input[name=to-y]").val();
  fromEov = ll2eov(fromX, fromY);
  toEov = ll2eov(toX, toY);
  postdata = {
    "xml": $("<dummy>").append(
        $("<request>").attr("trans_id", r).append($("<start_time>").text("cstart"))
      .append($("<time_means>").text("start"))
      .append($("<walk_speed>").text("1.11111"))
      .append($("<support_disabled>").text("0"))
      .append($("<edge_type_enabled>")
        .append($("<edge_type>").attr("name", "A").text("1"))
        .append($("<edge_type>").attr("name", "V").text("1"))
        .append($("<edge_type>").attr("name", "M").text("1"))
        .append($("<edge_type>").attr("name", "T").text("1"))
        .append($("<edge_type>").attr("name", "H").text("1"))
        .append($("<edge_type>").attr("name", "MF").text("1"))
        .append($("<edge_type>").attr("name", "VF").text("1"))
       )
      .append($("<optimize>").text(opt_mode))
      .append($("<from>")
          .append($("<eovx>").text(fromEov[0]))
          .append($("<eovy>").text(fromEov[1]))
          )
      .append($("<to>")
          .append($("<eovx>").text(toEov[0]))
          .append($("<eovy>").text(toEov[1]))
          )).html(),
    "tdate": [a.getFullYear(), 
              zeroify(a.getMonth()+1), 
              zeroify(a.getDate()), 
              zeroify(a.getHours()), 
              zeroify(a.getMinutes())].join("-"),
    "id": r,
    "gmt": a.getTimezoneOffset()/60,
    "a": "radio_toggle_from_c->Szélesség: " + fromX + "\302\260Hosszúság: " + fromY,
    "b": "radio_toggle_to_c->Szélesség: " + toX + "\302\260Hosszúság: " + toY
  };
  return postdata;
};
$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(function(g) {
      console.log(g);
      });
    });
