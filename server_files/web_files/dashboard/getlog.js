var key = getApiKey();

function getlogs() {
    $(function() {
        $.get(
            "/log",
            function(log) {
                $("#log").val(log);
                var textarea = document.getElementById('log');
                textarea.scrollTop = textarea.scrollHeight;
            });
        $.get(
            "/serverup",
            function(bol) {
                if (bol == "no") {
                    $('#stop').hide();
                    $('#start').show();
                }
            });
    });
}
setInterval(getlogs, 500);

$(document).ready(function() {
    var $form = $('form');
    $form.submit(function() {
        var command = $("#command").val();
        console.log(command);
        $.post($(this).attr('action'), {
            Body: command,
            apikey: key
        }, function(response) {}, 'json');
        $('#command').val('');
        return false;
    });
});