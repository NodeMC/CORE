/*
 * Functions to get, set, and manipulte cookie
 * containing API key for requests.
 */
function checkAPIKey(next) {
  var apikey = getCookie("apikey");

  if(!apikey) {
    apikey = prompt("Please enter your API key:", "");  
  }

  if(apikey) {
    server.setApiKey(apikey);
    server.verifyKey(function(valid) {
      setCookie("apikey", apikey, 365);

      return next(valid);
    })
  }
}

/**
 * Get Cookie
 *
 * @param {String} cname - cookie name
 *
 * @returns {boolean/variable} false on success, value on success
 **/
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }

  return false;
}

/**
 * Set the value of a cookie.
 *
 * @param {String} cname - cookie name
 * @param {Variable} cvalue - cookie value
 * @param {int} exdays - number of days until it expires.
 *
 * @returns {undefined} most likely went well.
 **/
function setCookie(cname, cvalue, exdays) {
  var expires,
      d = new Date();

  var expire = exdays * 24 * 60 * 60 * 1000;

  d.setTime(d.getTime() + expire);
  expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

checkAPIKey(function() {
  // API Key is OK.
});
