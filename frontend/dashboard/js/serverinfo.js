var prop;
var whitelist;

console.log("GET Server Info")

checkAPIKey(function(status) {
  console.log("API Key:", status);

  server.get("/server/info", {}, function(err, data) {
    if(err) {
      return console.error(err);
    }

    // really getting lazy at this point.
    prop = data;
    $("#version").text("Version: " + prop[3]);
    $("#ip").text("IP: " + prop[4]);
    $("#motd").text("Message of the day: " + prop[0]);
    $("#port").text("Port: " + prop[1]);
    if(prop[2]==true){ whitelist = "On" ;}
    else{ whitelist = "Off" ;}
    $("#whitelist").text("Whitelist: " + whitelist);
  })

});
