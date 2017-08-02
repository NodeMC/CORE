/**
 * /auth
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const debug    = require("debug")("nodemc:auth")
const Database = require("../../lib/db.js")
const scrypt   = require("scrypt")

// setup db
let db              = new Database()
db.connect("users")

module.exports = (Router, options) => {
  const passport = options.passport;

  /**
   * GET /status
   *
   * Verify if API key is valid or not.
   **/
  Router.get("/status", passport.authenticate("api-auth", { session: false }), (req, res) => {
    return res.success()
  });

  Router.post("/token", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    try {
      const userCursor = await db.find("users", "username", username)
      const user       = await userCursor.next()

      if(!user) throw "USER_NOT_EXIST"

      const scryptPassword  = new Buffer(user.password, "base64")
      const passwordIsValid = await scrypt.verifyKdf(scryptPassword, password)

      if(!passwordIsValid) return res.error("Invalid Username/Password.")

      return res.success({
        token: user.key
      })
    } catch(e) {
      debug("token-error", e)
      if(e.message === "USER_NOT_EXIST") return res.error("User not found.")
      return res.error("Failed to Authenticate.")
    }
  })



  return Router;
};
