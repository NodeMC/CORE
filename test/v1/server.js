"use strict";

const should  = require("should"),
      assert  = require("assert"),
      spawn   = require("child_process").spawn,
      path    = require("path"),
      request = require("supertest");

// Test Helpers
let failsWithoutAuthentication = require("../helpers/auth.js");
let restartServer              = require("../helpers/server.js");
let config                     = require("../helpers/config.js")();

// Constants
const port   = config.nodemc.port;
const apikey = config.nodemc.apikey;

describe("/v1/server", () => {
  let url = "http://127.0.0.1:"+port+"/v1/server";

  beforeEach(restartServer);

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

        if(res.body.data !== "down") {
          let stringified = JSON.stringify(res.body.data, null, 1);
          return next(new Error("Expected: 'down', got: \n"+stringified));
        }

        return next();
      });
    });
  });

  describe("/start", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/status", next);
    });
  });

  describe("/stop", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/status", next);
    });
  });

  describe("/restart", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/status", next);
    });
  });

  describe("/execute", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/status", next);
    });
  });

  describe("/log", () => {
    it("should fail when not authenticated", (next) => {
      failsWithoutAuthentication(url, "/status", next);
    });
  });
});
