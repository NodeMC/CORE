"use strict";

const request = require("supertest");

module.exports = (url, endpoint, next) => {
  request(url).get(endpoint)
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
}
