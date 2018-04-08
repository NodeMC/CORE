/**
 * /scheduler
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const Database = require("../../lib/db.js")

// setup db
let db              = new Database()
db.connect("users")

module.exports = (Router) => {

  /**
   * PUT / - register a scheduler
   */
  Router.put("/", (req, res) => {
    return res.send()
  })

  /**
   * DELETE / - formally delete a scheduler instance.
   */
  Router.delete("/", (req, res) => {
    return res.send()
  })

  // TODO map out the actual design for schedulers.
  // Maybe use some sort of job queue? Kue (redis)?

  return Router
};
