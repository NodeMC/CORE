/**
 * /auth
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

module.exports = (Router, server) => {

  /**
   * POST /verify
   *
   * Verify if API key is valid or not.
   **/
  Router.post("/verify", (req, res) => {
    const apikey = server.config.nodemc.apikey;
    const check  = req.body.apikey || req.get("Authentication");

    if(check === apikey) {
      return res.success(true);
    }

    return res.error("invalid_authentication", {
      moreinfo: "API Key is NOT valid."
    });
  });

  return Router;
};
