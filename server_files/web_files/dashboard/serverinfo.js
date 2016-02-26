var prop;
var whitelist;

$.get("/info", function(data){
  prop = JSON.parse(data);
  $("#version").text("Version: " + prop[3]);
  $("#ip").text("IP: " + prop[4]);
  $("#motd").text("Message of the day: " + prop[0]);
  $("#port").text("Port: " + prop[1]);
  if(prop[2]==true){ whitelist = "On" ;}
  else{ whitelist = "Off" ;}
  $("#whitelist").text("Whitelist: " + whitelist);

});
