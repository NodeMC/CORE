var key = getApiKey();

function files() {
    $(function() {
        $.get(
            "/files",
            function(result) {
                list = JSON.parse(result);
                console.log(list);
                for (var i = 0; i < list['files'].length; i++) {
                    // Exclude these core files
                    if (list['files'][i] == "Main.js" || list['files'][i] == "dashboard" || list['files'][i] == "node_modules" ||
                        list['files'][i] == ".git" || list['files'][i] == "server_files" || list['files'][i] == "README.md" ||
                        list['files'][i] == "package.json") {} else {
                        var download = encodeURIComponent(list['files'][i]);
                        //console.log(list['files'][i]);
                        $('#filelist tbody').append('<tr><td><a class="btn" href="/edit.html#' + list['files'][i] +
                            '">' + list['files'][i] + '</td><td><a class="btn" href="/download/' + download + '">Download <a href="#" class="btn" onclick="rm(&quot;' +
                            list['files'][i] + '&quot;)">Delete</td></tr>');
                    }
                }
            });
    });
}
files();

function rm(name) {
    $.ajax({
        type: "DELETE",
        url: "/deletefile",
        data: {
            file: name,
            apikey: key
        },
        success: function(res) {
            console.log(res)
            if (res == "true") {
                $(".alert").remove(); // Remove alert if not fully hidden
                $(".container").prepend('<div class="alert alert-info alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<center><strong>File ' + name + ' deleted.</strong></center>' +
                    '</div>');
                console.log("Deleted!");
                $("#filelist tr").remove();
                files();
                $(".alert").fadeOut(5000, function() {});
            } else {
                console.log("Error");
            }
        }
    });
}