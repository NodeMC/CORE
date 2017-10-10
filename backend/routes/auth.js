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
const random   = require("crypto-promise").randomBytes

// setup db
let db              = new Database()
db.connect("users")

module.exports = (Router, opts) => {
  /**
   * GET /status
   *
   * Verify if API key is valid or not.
   **/
  Router.get("/status", opts.requiresAuth, (req, res) => {
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

  /**
   * GET /bewit
   *
   * Return a ONE TIME USE (TIME LIMITED) token.
   */
  Router.get("/bewit", opts.requiresAuth, async (req, res) => {
    const randomBytes = await random(32)

    const bewit       = randomBytes.toString("base64")
    const created_at  = Date.now()
    const valid       = 300000      // VALID ONLY FOR 5 MINUTES.

    const bewitObject = {
      bewit,
      created_at,
      valid
    }

    try {
      await db.create("bewit", bewitObject, false)
    } catch(e) {
      debug("bewit:save:error", e)
      return res.error("Failed to create token.")
    }

    return res.success(bewitObject)
  })

  return Router;
};
