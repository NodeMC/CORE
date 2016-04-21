"use strict";

const request = require("supertest"),
      expect  = require("chai").expect;

module.exports = (url, endpoint, next) => {
  request(url).get(endpoint)
  .expect("Content-Type", "application/json; charset=utf-8")
  .end((err, res) => {
    if(err) {
      return next(err);
    }

    expect(res.body.success).to.equal(false);

    return next();
  });
}
