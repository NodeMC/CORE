"use strict";

const expect  = require("chai").expect,
      path    = require("path"),
      request = require("supertest"),
      spawn   = require("child_process").spawn;

// Test Helpers
let config                     = require("../helpers/config.js")();
let srv;

// Constants
const port   = config.nodemc.port;
const apikey = config.nodemc.apikey;

describe("/v2/auth", () => {
  let url = "http://127.0.0.1:"+port+"/v2/auth";

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

  describe("/verify", () => {
    it("should return true with valid key", (next) => {
      request(url).post("/verify")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        expect(res.body.data).to.equal(true);

        return next();
      });
    });

    it("should throw api error with invalid key", (next) => {
      request(url).post("/verify")
      .set("Authentication", "sss")
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        expect(res.body.success).to.equal(false);
        expect(res.body.message).to.equal("invalid_authentication")

        return next();
      });
    });
  });
});
