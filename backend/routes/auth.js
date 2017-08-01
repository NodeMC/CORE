/**
 * /auth
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

module.exports = (Router, options) => {
  const passport = options.passport;

  /**
   * POST /verify
   *
   * Verify if API key is valid or not.
   **/
  Router.post("/verify", passport.authenticate("api-auth", { session: false }), (req, res) => {
    return res.success("Authenticated!")
  });

  return Router;
};
