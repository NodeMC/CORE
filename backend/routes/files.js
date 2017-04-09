/**
 * /files
 *
 * @todo Fix this broken PoS
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const authCheck = require("../../lib/auth.js")
const fs        = require("fs-promise")
const path      = require("path")

module.exports = (Router, server) => {
  Router.use((req, res) => {
    res.error("disabled", {
      debuginfo: "Endpoint is INSECURE"
    })
  });

  Router.use(authCheck(server));

  const minecraftDir = server.config.minecraft.dir

  Router.get("/", (req, res) => { // Get server file

    fs.readdir(minecraftDir, (err, items) => {
      if(err) {
        return res.error("internal", {
          debuginfo: err
        });
      }

      let files = items;
      res.success({
        contents: files
      });
    });
  });

  /**
   * POST /files (/)
   *
   * Get the contents of a file.
   **/
  Router.post("/", (req, res) => {
    let dir = server.config.minecraft.dir;
    let file = req.body.Body;

    if (!fs.lstatSync(file).isDirectory()) {
      fs.readFile("./" + file, {
        encoding: "utf8"
      }, function(err, data) {
        if(err) {
          return res.error("internal", {
            debuginfo: err
          });
        }

        return res.success(data);
      });
    } else {
      dir = path.join(dir, file);
      fs.readdir(dir, function(err, items) {
        if(err) {
          return res.error("internal", {
            debuginfo: err
          });
        }

        let files = items;
        res.success({
          isdirectory: true,
          contents: files
        })
      });
    }
  });

  /**
   * POST /save
   * @todo PUT
   *
   * Save a file.
   **/
  Router.post("/save", (req, res) => { // Save a POST"d file
    let dir  = server.config.minecraft.dir,
        file = req.param("File");

    const newcontents = req.param("Contents");

    dir = path.join(dir, file);
    fs.writeFile(dir, newcontents, function(err) {
      if (err) {
        return res.error("internal", {
          debuginfo: err
        });
      }

      return res.success();
    });
  });

  /**
   * DELETE /delete
   *
   * Delete a file.
   **/
  Router.delete("/delete", (req, res) => {
    let item = req.body.file;
    let dir  = server.config.minecraft.dir;

    let file = path.join(dir, item);
    fs.unlink(file, function(err) {
      if (err) {
        return res.error("internal", {
          debuginfo: err
        });
      }

      res.success(true);
    });
  });

  return Router;
};
