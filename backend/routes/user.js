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


module.exports = (Router, opts) => {

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

  /**
   * PATCH /:user
   *
   * Update a user.
   */
  Router.patch("/:user/", opts.requiresAuth, async (req, res) => {
    await scrypt.params(0.1)

    const user = req.params.user;

    const updated = {
      username: req.body.username || user,
      password: req.body.password ?
        (await scrypt.kdf(req.body.password, scryptParams)).toString("base64") : undefined
    }

    const collection = await db._collection("users")
    const cursor = await db.find("users", "username", user)
  
    if (cursor.count < 1) return res.error("User not found")
  
    const userDoc = await cursor.next()

    try {
      await db.exists("users", "username", updated.username)
      await collection.update(userDoc, updated)
    } catch (e) {
      if (e.message === "EXISTS") {
        return res.error("Username already exists")
      }
      debug("update", e)
      return res.error("User update failed")
    }
    
    return res.success("USER_UPDATED")
  })

  Router.delete("/:user/", opts.requiresAuth, async (req, res) => {
    try {
      const cursor = await db.find("users", "username", req.params.user)

      if (cursor.count !== 1) return res.error("User not found")

      const user = await cursor.next()

      await db.delete(user._id)
    } catch (e) {
      debug("delete", e)
      return res.error("User deletion failed")
    }

    return res.success("USER_DELETED")
  })

  return Router;
};
