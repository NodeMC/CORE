/**
 * Authentication Middleware.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

module.exports = (config) => {
  let apikey = config.nodemc.apikey;

  return (req, res, next) => {
    let capikey = req.param("apikey") || req.body.apikey;

    if(capikey === apikey) {
      return next();
    }

    return res.error("invalid_authentication", {
      moreinfo: "API Key was invalid or not supplied correctly"
    });
  }
}
