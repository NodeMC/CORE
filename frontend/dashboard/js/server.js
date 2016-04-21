/**
 * Library to interact with NodeMC.
 *
 * @author NodeMC Team <https://github.com/NodeMC>
 * @license GPL3
 **/

"use strict";

/**
 * Server class
 *
 * @param {String} url     - "host" to use.
 * @param {String} version - API version to use.
 * @constructor
 **/
var Server = function(url, version) {
  this.url = url;
  this.ver = version;

  this.apikey = '';
  this.base = url+"/"+version;

  console.log("constructed Server class.")
  console.log("using host:", this.url, "with API Version", this.ver);
  console.log("base route:", this.base);
}

/**
 * Send a Request to the Server.
 *
 * @param {String} method   - HTTP Method.
 * @param {String} endpoint - endpoint i.e /v1/whatever
 * @param {Variable} data   - data/params to send.
 * @param {Function} next   - callback.
 *
 * @returns {undefined} use callback
 **/
Server.prototype.request = function(method, endpoint, data, next) {

  // Strip start / end slashes.
  endpoint = endpoint.replace(/^\//g, "");
  endpoint = endpoint.replace(/\/$/g, "");

  $.ajax({
    method: method,
    url: this.base + "/" + endpoint,
    data: data,
    headers: {
      Authentication: this.apikey
    }
  })
  .fail(function(err) {
    return next(err);
  })
  .done(function(data) {
    if(data.success !== true) {
      return next({
        message: data.message,
        debuginfo: data.data.debuginfo,
        moreinfo: data.data.moreinfo
      });
    }

    return next(false, data.data);
  });
}

Server.prototype.get     = function(endpoint, params, next) {
  this.request("GET", endpoint, params, next);
}

Server.prototype.post    = function(endpoint, data, next) {
  this.request("POST", endpoint, data, next);
}

Server.prototype.delete  = function(endpoint, data, next) {
  this.request("DELETE", endpoint, data, next);
}

/**
 * Set the API Key to use for authenticated requests.
 *
 * @param {String} key - api key to use.
 *
 * @returns {undefined} If this fails, well... world is fucked.
 **/
Server.prototype.setApiKey = function(key) {
  this.apikey = key;
}

/**
 * Verify the Key we're registered to use.
 *
 * @param {Function} next - callback
 *
 * @returns {undefined} use callback.
 **/
Server.prototype.verifyKey = function(next) {
  this.post("/auth/verify", {}, function(err, data) {
    if(data === true) {
      return next(true);
    }

    // Fail by default.
    return next(false);
  });
}

var server = new Server("http://127.0.0.1:3000", "v1");
