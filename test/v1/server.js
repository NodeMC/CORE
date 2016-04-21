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

describe("/v1/server", () => {
  let url = "http://127.0.0.1:"+port+"/v1/server";

  it("server should start", (done) => {
    server.start(() => {
      return done();
    });
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
