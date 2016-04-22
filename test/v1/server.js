"use strict";

const expect  = require("chai").expect,
      path    = require("path"),
      async   = require("async"),
      request = require("supertest");


const spawn = require("child_process").spawn;

// Test Helpers
let failsWithoutAuthentication = require("../helpers/auth.js");
let config                     = require("../helpers/config.js")();

let srv;

// Constants
const port   = config.nodemc.port;
const apikey = config.nodemc.apikey;

describe("/v1/server", () => {
  let url = "http://127.0.0.1:"+port+"/v1/server";

  beforeEach((next) => {
    let deffer = (cb) => {
      srv     = null;
      srv     = spawn("node", ["server.js"], {
        cwd: path.join(__dirname, "../..")
      });

      // srv.stderr.pipe(process.stderr);
      setTimeout(() => {
        return cb();
      }, 500)
    }

    if(srv) {
      srv.on("exit", () => {
        srv.removeAllListeners("exit");
        return deffer(next);
      });

      return srv.kill();
    }

    return deffer(next);
  });

  after((next) => {
    if(srv) {
      srv.on("exit", () => {
        srv.removeAllListeners("exit");
        return next();
      });

      return srv.kill();
    }

  });

  describe("/status", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/status", next);
    });

    it("should return down on init", (next) => {
      request(url).get("/status")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        expect(res.body.data).to.deep.equal("down");

        return next();
      });
    });

    it("should return up when the server is running", (done) => {
      async.waterfall([
        (next) => {
          request(url).post("/start")
          .set("Authentication", apikey)
          .expect("Content-Type", "application/json; charset=utf-8")
          .end((err, res) => {
            if(err) {
              return next(err);
            }

            expect(res.body.success).to.equal(true)

            return next();
          });
        },

        (next) => {
          request(url).get("/status")
          .set("Authentication", apikey)
          .expect("Content-Type", "application/json; charset=utf-8")
          .end((e, r) => {
            if(e) {
              return next(e);
            }

            expect(r.body.data).to.deep.equal("up");

            return next();
          });
        }
      ], err => {
        return done(err);
      });
    });
  });

  describe("/start", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/start", next);
    });

    it("should start", (done) => {
      request(url).post("/start")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        expect(res.body.success).to.equal(true)

        return done();
      });
    })

    it("should fail when already running", (done) => {
      async.waterfall([
        (next) => {
          request(url).post("/start")
          .set("Authentication", apikey)
          .expect("Content-Type", "application/json; charset=utf-8")
          .end((err, res) => {
            if(err) {
              return next(err);
            }

            expect(res.body.success).to.equal(true)

            return next();
          });
        },

        (next) => {
          request(url).post("/start")
          .set("Authentication", apikey)
          .expect("Content-Type", "application/json; charset=utf-8")
          .end((err, res) => {
            if(err) {
              return next(err);
            }

            expect(res.body.success).to.equal(false)

            return next();
          });
        }
      ], err => {
        return done(err);
      })
    });
  });

  describe("/stop", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/stop", next);
    });
  });

  describe("/restart", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/restart", next);
    });
  });

  describe("/execute", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/execute", next);
    });
  });

  describe("/log", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/log", next);
    });
  });
});
