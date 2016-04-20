"use strict";

const should  = require("should"),
      assert  = require("assert"),
      spawn   = require("child_process").spawn,
      path    = require("path"),
      request = require("supertest");

let cpath = path.join(__dirname, "../../config");
let config;
try {
  config = require(path.join(cpath, "config.json"));
} catch(e) {
  // using example config, this is ok.
  config = require(path.join(cpath, "config.example.json"));
}

const port   = 3000;
const apikey = config.nodemc.apikey;

describe("/v1/server", () => {
  let url = "http://127.0.0.1:"+port+"/v1/server";

  beforeEach((done) => {
    let base   = path.join(__dirname, "../..");
    let server = path.join(base, "server.js");

    let sp = spawn("node", [server], {
      cwd: base
    });

    sp.on("error", err => {
      console.error("ERROR:", err);
    })

    sp.on("close", code => {
      console.log("server close with", code);
    });

    return done();
  });

  describe("/status", () => {
    it("should fail when not authenticated", (next) => {
      request(url).get("/status")
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        if(res.body.success) {
          let stringified = JSON.stringify(res.body, null, 1);
          return next(new Error("Expected: success: false, got: \n"+stringified));
        }

        return next();
      });
    });

    it("should return down on init", (next) => {
      request(url).get("/status")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        if(res.body.data !== "down") {
          let stringified = JSON.stringify(res.body.data, null, 1);
          return next(new Error("Expected: 'down', got: \n"+stringified));
        }

        return next();
      });
    });
  });
});
