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

describe("/v2/servers/server", () => {
  let url = "http://127.0.0.1:"+port+"/v2/servers/0";

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

    it("should fail when not running", (done) => {
      request(url).post("/stop")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        expect(res.body.success).to.equal(false)

        return done();
      });
    });

    it("should succedd when running", (done) => {
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
          request(url).post("/stop")
          .set("Authentication", apikey)
          .expect("Content-Type", "application/json; charset=utf-8")
          .end((err, res) => {
            if(err) {
              return next(err);
            }

            expect(res.body.success).to.equal(true)

            return next();
          });
        }
      ], err => {
        return done(err);
      })
    });
  });

  describe("/restart", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/restart", next);
    });

    it("should never fail when authenticated", (done) => {
      request(url).post("/restart")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        expect(res.body.success).to.equal(true);

        return done();
      });
    });
  });

  describe("/execute", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/execute", next);
    });

    it("should not fail when sent a command", (done) => {
      request(url).post("/restart")
      .set("Authentication", apikey)
      .send({
        "comamnd": "say Test!"
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        expect(res.body.success).to.equal(true);

        return done();
      });
    });
  });

  describe("/log", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/log", next);
    });

    it("should return a file", (done) => {
      request(url).get("/log")
      .set("Authentication", apikey)
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        return done();
      })
    })
  });

  describe("/info", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/info", next);
    });

    it("should return an object of data", (done) => {
      request(url).get("/info")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        expect(res.body.data).to.have.all.keys(
          "whiteList",
          "serverPort",
          "flavour",
          "motd",
          "flavor",
          "version"
        );

        return done();
      });
    });
  });
});
