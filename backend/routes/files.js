/**
 * /files
 *
 * @todo IMPLEMENT v2 API
 * @author Jared Allard <jaredallard@outlook.com>
 * @license GPL3
 **/

"use strict";

const authCheck = require("../../lib/auth.js")
const fs        = require("fs-promise")
const debug     = require("debug")("nodemc:routes:files")
const nodePath  = require("path");

const serializePath = string => {
  return string.replace(/[^\w]\.{2,}(?!\w)/g, "")
}

/**
 * R = Router.
 **/
module.exports = (R, server) => {
  // R.use(authCheck(server));

  const minecraftDir = server.config.minecraft.dir


  R.get("/*", async (req, res) => {
    const unsafePath = req.path.split("/")[1]
    const safePath   = serializePath(unsafePath);
    const path = nodePath.join(minecraftDir, safePath);

    debug("serializePath", unsafePath, "->", safePath)
    debug("get", path);

    let fileStat;
    try {
      fileStat = await fs.stat(path)
    } catch(e) {
      return res.error(404, "File not found.")
    }

    // Handle directories.
    if(fileStat.isDirectory()) {
      debug("path", "is directory")
      return res.success(await fs.readdir(path))
    }

    return res.sendFile(path);
  })


  return R;
};
