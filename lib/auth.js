/**
 * Authentication Middleware.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

let isValid = (config, auth) => {
  let apikey = config.nodemc.apikey;

  if(auth === apikey) {
    return true;
  }

  return false;
};

module.exports = (config) => {
  if(config.config) config = config.config; // for routers

  return (req, res, next) => {
    let capikey = req.params.apikey || req.body.apikey || req.get("Authentication");

    if(isValid(config, capikey)) {
      return next();
    }

    return res.error("invalid_authentication", {
      moreinfo: "API Key was invalid or not supplied correctly"
    });
  }
}
