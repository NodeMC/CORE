/**
 * /auth
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const authCheck = require("../../lib/auth.js");

module.exports = (Router, server) => {
  Router.post("/verify", (req, res) => {
    let apikey = server.config.nodemc.apikey;
    let check  = req.body.apikey || req.get("Authentication");

    if(check === apikey) {
      return res.success(true);
    }

    return res.error("invalid_authentication", {
      moreinfo: "API Key is NOT valid."
    });
  });

  return Router;
};
