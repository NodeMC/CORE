var filename = window.location.hash.substr(1);
var key = getApiKey();
var editor;

function file() {
    $(function() {
        $.post(
            "/files", {
                'Body': filename,
                'apikey': key
            },
            function(result) {
                try {
                    var fc = JSON.parse(result);
                    if (fc['isdirectory']) {
                        var list = fc;
                        $('#fc').hide();
                        $('.btn').hide();
                        var html = '<table class="table filelist" id="filelist"><tbody>';
                        for (var i = 0; i < list['files'].length; i++) {
                            // Exclude these core files
                            if (list['files'][i] == "server_files") {} else {
                                var download = encodeURIComponent(filename + "/" + list['files'][i]);
                                //console.log(list['files'][i]);
                                html = html + '<tr><td><a class="btn" href="/edit.html#' + filename + "/" + list['files'][i] +
                                    '">' + list['files'][i] + '</td><td><a class="btn" href="/download/' + download + '">Download <a href="#" class="btn" onclick="rm(&quot;' +
                                    list['files'][i] + '&quot;)">Delete</td></tr>'
                            }
                        }
                        html = html + "</tbody></table>";
                        document.getElementById("content").innerHTML = html;
                    } else {
                        var fc = result;
                        $('#fc').val(fc);
                        var myTextArea = document.getElementById('fc');
                        var myCodeMirror = CodeMirror(function(elt) {
                            myTextArea.parentNode.replaceChild(elt, myTextArea);
                        }, {
                            value: fc,
                            lineNumbers: true,
                            autofocus: true
                        });
                    }
                } catch (e) {
                    var fc = result;
                    $('#fc').val(fc);
                    var myTextArea = document.getElementById('fc');
                    editor = CodeMirror(function(elt) {
                        myTextArea.parentNode.replaceChild(elt, myTextArea);
                    }, {
                        value: fc,
                        lineNumbers: true,
                        autofocus: true
                    });
                }
            });
    });
}


$(function() {
    $("#savebtn").click(function() {
        $.post(
            "/savefile", {
                'File': filename,
                apikey: key,
                'Contents': editor.getValue()
            },
            function(result) {

            }
        )
    });
});
window.onhashchange = function() {
    window.location.reload();
}
file();

function rm(name) { // Function for deleting files
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