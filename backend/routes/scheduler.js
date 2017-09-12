/**
 * /scheduler
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const debug    = require("debug")("nodemc:scheduler")
const Database = require("../../lib/db.js")
const scrypt   = require("scrypt")

// setup db
let db              = new Database()
db.connect("users")

module.exports = (Router, opts) => {

  /**
   * PUT / - register a scheduler
   */
  Router.put("/", (req, res) => {

  })

  return Router
};
