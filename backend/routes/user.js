/**
 * /user
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const Database      = require('../../lib/db.js')

// setup db
let db              = new Database()
db.connect("users")


module.exports = (Router, server) => {

  /**
   * POST /verify
   *
   * Verify if API key is valid or not.
   **/
  Router.post("/", async (req, res) => {
    try {
      await db.exists('users', 'id', id)

      // only generate on user create step
      const rand = await require("crypto-promise").randomBytes(64);
      const key  = rand.toString("hex")

      await db.create("users", {
        id:       id,
        key:      key,
        username: username,
        password: password
      }, false)
    } catch(e) {
      if(e.message == "EXISTS") {
        return res.error("User exists")
      }

      return res.error("Authentication Failure")
    }

    return res.success("USER_CREATED")
  });

  return Router;
};
