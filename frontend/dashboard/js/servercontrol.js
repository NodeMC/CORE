var key = getApiKey();

$("#restart").click(function() {
  server.post("/server/restart", {}, function(err) {
    if(err) {
      return console.error(err);
    }
  });
});

$("#stop").click(function() {
  server.post("/server/stop", {}, function(err) {
    if(err) {
      return console.error(err);
    }
  });

  $("#start").show();
  $("#stop").hide();
});

$("#start").click(function() {
  server.post("/server/start", {}, function(err) {
    if(err) {
      return console.error(err);
    }
  });

  $("#stop").show();
  $("#start").hide();
});

// Hide start on page load
$(document).ready(function() {
  $("#start").hide();
})
