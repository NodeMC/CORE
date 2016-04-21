function getlogs() {
  $(function() {
    server.get("/server/log", {}, function(err, res) {
      if(err) {
        return console.error(err);
      }

      var textarea = document.getElementById('log');

      $("#log").val(res.split("\n").slice(-500).join("\n"));
      textarea.scrollTop = textarea.scrollHeight;
    });

    server.get("/server/status", {}, function(err, res) {
      if(err) {
        return console.error(err);
      }

      if (res == "down") {
        $("#stop").hide();
        $("#start").show();
      }
    });
  });
}
setInterval(getlogs, 500);

$(document).ready(function() {
  var $form = $("form");
  $form.submit(function() {
    var celm = $("#command");
    var command = celm.val();
    console.log("execute on server:", command);

    celm.disable();

    server.post("/server/execute", {
      command: command
    }, function(err) {
      if(err) {
        return console.error(err);
      }

      $("#command").val("");
    })

    return false;
  });
});
