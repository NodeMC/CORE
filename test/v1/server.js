"use strict";

const expect  = require("chai").expect,
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

// Constants
const port   = config.nodemc.port;
const apikey = config.nodemc.apikey;

describe("/v1/server", () => {
  let url = "http://127.0.0.1:"+port+"/v1/server";
  let server     = new Server();

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

    it("production on", (next) => {
      production.on((success) => {
        if(!success) {
          return next(new Error("Failed to switch to production"));
        }

        console.log("SERVER: Restart")
        server.restart(() => {
          return next();
        });
      });
    });

    it("should return up on init", (next) => {
      request(url).get("/status")
      .set("Authentication", apikey)
      .expect("Content-Type", "application/json; charset=utf-8")
      .end((err, res) => {
        if(err) {
          return next(err);
        }

        expect(res.body.data).to.deep.equal("up");

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
