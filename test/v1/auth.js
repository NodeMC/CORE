"use strict";

const expect  = require("chai").expect,
      path    = require("path"),
      request = require("supertest");

// Test Helpers
let failsWithoutAuthentication = require("../helpers/auth.js");
let config                     = require("../helpers/config.js")();
let Server                     = require("../helpers/server.js");
let Production                 = require("../helpers/production.js");

let production = new Production();
let server     = new Server();

// Constants
const port   = config.nodemc.port;
const apikey = config.nodemc.apikey;

after(() => {
  server.stop(()=>{});
});

describe("/v1/auth", () => {
  let url = "http://127.0.0.1:"+port+"/v1/auth";

  it("server should start", (done) => {
    server.start(() => {
      return done();
    });
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
