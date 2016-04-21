function files() {
  server.get("/files", {}, function(err, data) {
    var list;

    if(err) {
      return console.error(data);
    }

    list = data.contents;
    list.forEach(function(file) {
      // Exclude these core files
      var download = encodeURIComponent(file);
      //console.log(list['files'][i]);
      $('#filelist tbody').append('<tr><td><a class="btn" href="/edit.html#' + file +
        '">' + file + '</td><td><a class="btn" href="/v1/download/' + download + '">Download <a href="#" class="btn" onclick="rm(&quot;' +
        file + '&quot;)">Delete</td></tr>');
    });
  });
}

checkAPIKey(function(valid) {
  if(!valid) {
    return console.error("Invalid API Key");
  }

  return files();
})

function rm(name) {
  server.delete("/files/delete", {
    file: name
  }, function(err) {
    if(err) {
      return console.error(err);
    }

    $(".alert").remove(); // Remove alert if not fully hidden
    $(".container").prepend('<div class="alert alert-info alert-dismissible" role="alert">' +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<center><strong>File ' + name + ' deleted.</strong></center>' +
      '</div>');

    console.log("Deleted!");

    $("#filelist tr").remove();
    files();
    $(".alert").fadeOut(5000, function() {});
  });
}
