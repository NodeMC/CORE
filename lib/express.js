/**
 * Load and Mount Express Routes.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 **/

"use strict";

const express = require("express"),
      semver  = require("semver"),
      async   = require("async"),
      path    = require("path"),
      fs      = require("fs");

const passport = require("passport")
const Hawk     = require("passport-hawk")
const cors     = require("cors")

const Database         = require("./db.js")

// setup db
let db              = new Database()
db.connect("users")

module.exports = class Express {

  /**
   * Express Dynamic Router.
   *
   * @param {Object} app    - express app
   * @param {Object} server - server system
   * @param {Object} ver    - API version
   * @param {Object} log    - our logger object
   *
   * @returns {Object} new class
   **/
  constructor(app, server, ver, log) {
    this.log   = log;
    this.app   = app;

    app.use(passport.initialize())
    app.use(cors())

    // Inner API Authentication Method
    passport.use("api-auth", new Hawk(async (id, done) => {
      console.log(id)
      try {
        const user_cursor = await db.find("users", "id", id)
        const user = await user_cursor.next()

        if(!user) return done("USER_NOT_EXIST")

        // might be bad scope.
        done(null, {
          key: 		 user.key,
          algorithm: "sha256",
          user:		 user
        });
      } catch(err) {
        return done(err)
      }
    }));

    this.mountRoutes(app, path.join(__dirname, "../backend/routes/"), "v" + semver.major(ver), {
      server: server,
      passport: passport
    });
  }

  /**
   * Mount Routes on Express APP.
   *
   * @param {Object} app    - express app.
   * @param {String} dir    - directory to scan for routes.
   * @param {String} ver    - version to mount on.
   * @param {Object} opts   - Object to pass to constructors.
   *
   * @returns {undefined} async
   **/
  mountRoutes(app, dir, ver, opts) {
    let log   = this.log;

    async.waterfall([
      /**
       * Load Express Routes
       **/
      function(next) {
        let ROUTES = dir;

        fs.readdir(ROUTES, (err, list) => {
          if(err) {
            return next(err);
          }

          async.each(list, function(route, next) {
            let routes = ROUTES;
            if(!path.isAbsolute(ROUTES)) {
              routes = path.join("..", ROUTES);
            }

            let Path  = path.join(routes, route);
            let name  = path.parse(route).name;
            let mount = path.join("/", ver, "/", name).replace(/\\/g, "/");

            log("mount route", name, "on", mount);

            let eroute;
            try {
              eroute = require(Path);
            } catch(e) {
              return next(e);
            }

            // execute eroute "constructor"
            let router = eroute(new express.Router(), opts);

            // Hook in the newly created route.
            app.use(mount, router);

            return next();
          }, err => {
            if(err) {
              return next(err);
            }

            return next();
          });
        })
      }
    ], err => {
      if(err) {
        throw err;
      }
    });
  }

  /**
   * Start Express.
   *
   * @param {Int} port - port to run on.
   *
   * @returns {boolean} Success.
   **/
  start(port) {
    let log   = this.log,
        app   = this.app;

    app.listen(port, (err) => {
      if(err) return log("Failed to Start Express.");
    })
  }
}
