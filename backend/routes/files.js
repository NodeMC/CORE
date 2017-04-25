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
const nodePath  = require("path")
const mkdirp    = require("mkdirp")
const rm        = require("fs-extra").remove

let minecraftDir;

/**
 * Serialize a path.
 * @param  {String} string String to serialize.
 * @return {String}        Safe string.
 */
const serializePath = string => {
  return string.replace(/[^\w]\.{2,}(?!\w)/g, "")
}

/**
 * Wrapper around Express.
 * @param  {String} url  URL, plus Path to extract.
 * @return {String}      Safe, Standarized Path.
 */
const standardizePath = url => {
  const path = getPath(url);
  return nodePath.join(minecraftDir, serializePath(path));
}

/**
 * Parse a URL to get everything but, i.e /v1/files
 * @param  {String} url URL to parse.
 * @return {String}     Parsed String.
 */
const getPath = url => {
  return url.replace(/^\/[^\/]+\/[^\/]+\//g, "")
}

const getFileStat = async path => {
  let stat;

  try {
    stat = await fs.stat(path)
  } catch(e) {
    return false;
  }

  return stat;
}

module.exports = (R, server) => {
  // R.use(authCheck(server));
  minecraftDir = server.config.minecraft.dir


  /**
   * GET /:path
   *
   * Get the contents of a file, or list a directories
   *  contents.
   **/
  R.get("/*", async (req, res) => {
    const path = standardizePath(req.path)

    debug("get", path);

    let fileStat = await getFileStat(path);
    if(!fileStat) {
      return res.error(404, "File not found.")
    }

    // Handle files
    if(!fileStat.isDirectory()) {
      debug("path", "is a file")
      return res.sendFile(path);
    }

    const files = [];

    let contents = await fs.readdir(path);
    contents.forEach(file => {
      const filePath = nodePath.join(path, file)
      const fileStat = fs.statSync(filePath)

      debug("stat", filePath);

      // Check if it's a directory
      if(fileStat.isDirectory()) {
        return files.push({
          type: "directory",
          name: file,
          size: 0,
          created: fileStat.birthtime
        })
      }

      // regular file
      return files.push({
        type: "file",
        name: file,
        size: fileStat.size,
        created: fileStat.birthtime
      })
    })
    debug("files", files);

    return res.success(files)
  })

  /**
   * PUT /:path
   *
   * Update the contents of a file.
   **/
  R.put("/*", async (req, res) => {
    const path = standardizePath(req.path)

    let fileStat = await getFileStat(path);
    if(!fileStat) {
      debug("put", "file not found, creating")
      mkdirp.sync(nodePath.dirname(path))
    } else { // exists already.
      // Check if it's a directory
      if(fileStat.isDirectory()) {
        return res.error("Not a file.")
      }
    }

    // TODO upload code...

    return res.sendFile(path)
  })

  R.delete("/*", async (req, res) => {
    const path = standardizePath(req.path);

    let fileStat = await getFileStat(path);
    if(!fileStat) {
      return res.error(404, "File not found.")
    }

    // Remove the files.
    rm(path, err => {
      if(err) return res.error(501, "Failed to remove")

      return res.success("")
    })
  })


  return R;
};
