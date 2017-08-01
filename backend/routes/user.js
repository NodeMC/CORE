/**
 * /user
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const Database      = require("../../lib/db.js")
const debug         = require("debug")("nodemc:users")
const scrypt        = require("scrypt")

const scryptParams  = {N: 16, r: 16, p: 1}

// setup db
let db              = new Database()
db.connect("users")


module.exports = (Router, options) => {

  /**
   * POST /
   *
   * Create a user.
   **/
  Router.post("/", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    await scrypt.params(0.1)

    try {
      await db.exists("users", "username", username)

      // only generate on user create step
      const rand = await require("crypto-promise").randomBytes(256);
      const key  = rand.toString("hex")

      const hashedPasswordObj = await scrypt.kdf(password, scryptParams)
      const hashedPassword    = hashedPasswordObj.toString("base64")

      await db.create("users", {
        key:      key,
        username: username,
        password: hashedPassword
      }, false)
    } catch(e) {
      if(e.message == "EXISTS") {
        return res.error("User exists")
      }

      debug("create", e)

      return res.error("Failed to create user")
    }

    return res.success("USER_CREATED")
  });

  return Router;
};
