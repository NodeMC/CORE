/**
 * (c) NodeMC
 * Standardize NodeMC API responses.
 *
 * @author NodeMC Team <https://github.com/nodemc>
 * @version 2.0
 **/

const instance = require("os").hostname();

module.exports = (req, res, next) => {
  const metadata = {
    instance: instance
  }

  /**
   * Send A API conforment response
   *
   * @param {*} data  - data to send.
   *
   * @returns {Res#Send} express res.send
   **/
  res.success = data => {
    return res.send({
      data: data,
      metadata: metadata
    });
  }

  /**
   * Send A API conforment error.
   *
   * @param {Integer} [code=501] - HTTP Error Code.
   * @param {String} message - error message
   * @param {*} data  - data to send.
   *
   * @returns {Res#Send} express res.send
   **/
  res.error = (code, message, data) => {
    if(typeof code !== "number") { // allow not using code.
      data    = message
      message = code
    }

    return res.send({
      data: data,
      metadata: metadata,
      error: {
        message: message,
        code: null
      }
    })
  }

  return next();
}
