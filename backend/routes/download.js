/**
 * /download
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const path        = require("path"),
      querystring = require("querystring"),
      fs          = require("fs-promise");

module.exports = (Router, server) => {
  const minecraftDir = server.config.minecraft.dir

  Router.use((req, res) => {
    res.error("disabled", {
      debuginfo: "Endpoint is INSECURE"
    })
  });

  /**
   * GET /:file
   *
   * Download a file.
   **/
  Router.get("/:file", (req, res) => {
      const item = querystring.unescape(req.params.file);

      let file = path.join(minecraftDir, item);

      // Check if it exists or is a directory.
      try {
        if(fs.lstatSync(file).isDirectory()) return res.error("not_a_file")
      } catch(e) {
        return res.error("file_not_found")
      }

      return res.sendFile(file);
  });

  return Router;
}
