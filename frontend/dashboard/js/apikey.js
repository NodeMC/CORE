/*
 * Functions to get, set, and manipulte cookie
 * containing API key for requests.
 */
function checkAPIKey() {
    var username = getCookie("apikey");
    if (username != "") {
        return apikey = username;
    } else {
        username = prompt("Please enter your API key:", "");
        if (username != "" && username != null) {
            $.post("/verifykey", {
                apikey: username
            }, function(data) {
                if (data == true) {
                    setCookie("apikey", username, 365);
                }
                else{}
            }, "json");
        }
    }
}

function getApiKey(){
    return getCookie("apikey");
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

checkAPIKey();