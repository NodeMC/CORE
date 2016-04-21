"use strict";

const should  = require("should"),
      assert  = require("assert"),
      spawn   = require("child_process").spawn,
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

describe("/v1/auth", () => {
  let url = "http://127.0.0.1:"+port+"/v1/auth";

  server.start(() => {});

  describe("/verify", () => {
    it("should return true with valid key", (next) => {
      request(url).post("/verify")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        if(res.body.data !== true) {
          let stringified = JSON.stringify(res.body.data, null, 1);
          return next(new Error("Expected: true, got: \n"+stringified));
        }

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

        if(res.body.message === "internal_authentication" && res.body.success === false) {
          let stringified = JSON.stringify(res.body.data, null, 1);
          return next(new Error("Expected: message: internal_authentication, got: \n"+stringified));
        }

        return next();
      });
    });
  });
});
