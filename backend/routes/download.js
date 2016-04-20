/**
 * /download
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const path        = require("path"),
      querystring = require("querystring"),
      fs          = require("fs");

module.exports = (Router, server) => {

  /**
   * GET /:file
   *
   * Download a file.
   **/
  Router.get("/:file", (req, res) => {
      let item = querystring.unescape(req.params.file),
          dir  = server.config.minecraft.dir;

      let file = path.join(dir, item);

      if (!fs.lstatSync(file).isDirectory()) {
        return res.sendFile(file);
      }

      return res.error("file_not_found");
  });

  return Router;
}
