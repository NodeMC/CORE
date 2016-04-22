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
    $("#version").text("Version: " + prop.version);
    $("#ip").text("IP: not implemented");
    $("#motd").text("Message of the day: " + prop.motd);
    $("#port").text("Port: " + prop.serverPort);
    if(prop.whiteList == true) {
      whitelist = "On";
    } else {
      whitelist = "Off";
    }
    $("#whitelist").text("Whitelist: " + whitelist);
  })

});
