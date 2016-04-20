/**
 * This is the sourcecode for the NodeMC control
 * panel software - it is a web server that runs on a specific
 * port.
 *
 * If you have any questions feel free to ask either on Github or
 * email: gabriel@nodemc.space!
 *
 * (c) Gabriel Simmer 2016
 *
 * Todo:
 * md5sum check for jarfiles
 * File uploading from HTML5 dashboard
 * Self-updater (possible?)
 * Support for other flavours of Minecraft server
 * General dashboard overhaul for sleeker appearence
 *     - Server stats
 *     - Other info on index.html
 *
 * @author Gabriel Simmer <gabreil@nodemc.space>
 * @version 1.0.0
 * @license GPL3
 **/

"use strict";

// Requires
const spawn             = require("child_process").spawn;
const async             = require("async");
const express           = require("express");
const fs                = require("node-fs");
const pr                = require("properties-reader");
const getIP             = require("external-ip")();
const getfile           = require("request");
const crypto            = require("crypto");
const querystring       = require("querystring");
const morgan            = require("morgan");
const cors              = require("cors");
const FileStreamRotator = require("file-stream-rotator");

// Internal Modules.
const stage   = require("./lib/stage.js");
const Server    = require("./lib/server.js");
const Routes    = require("./lib/express.js");

//const serverjar = require("./lib/serverjar.js");

// instance the server
let app = new express();

// Build the Express Routes.
// to do: make this dynamic with stage loader.
let routes    = new Routes(stage, app, Server, function() {
      let args = Array.prototype.slice.call(arguments, 0);
      args[0]  = "main: "+stage.Sub+ " stage "+ stage.Stage + ": " + args[0];
      console.log.apply(console, args);
});

// Set variables for the server(s)
let current = 150,
    dir = ".",
    files = "",
    usingfallback = true,
    completelog = "",
    srvprp,
    restartPending = false;

// Server Variables.
let serverOptions,
    sf_web,
    outsideip,
    serverSpawnProcess,
    serverStopped = false;

// Server Configuration Variables / Defaults.
let name,
    ram     = "512M",
    PORT    = 3000,
    mcport  = 25565,
    jarfile = "",
    jardir,
    apikey,
    token,
    newOptions;

/*
 * Access logging
 */

var logDirectory = dir + "/nmc_logs"

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
let accessLogStream = FileStreamRotator.getStream({
    filename: logDirectory + "/access-%DATE%.log",
    frequency: "daily",
    verbose: false,
    date_format: "YYYY-MM-DD"
});

try { // If no error, server has been run before
  serverOptions = require("./frontend/properties.json");
} catch (e) { // If there is an error, copy server files!
    console.error(e);
    console.log("Essential files not found! Please read the guide on Getting Started :)");
    console.log("Exiting...");
    process.exit(1);
}

if (serverOptions.firstrun) {
  console.log("Navigate to http://localhost:" + serverOptions.port + " to set up NodeMC.");
  sf_web = "frontend/web_files/setup/";
} else {
  sf_web = "frontend/web_files/dashboard/";
}

try {
    if (serverOptions.apikey == "") {
      token = crypto.randomBytes(16).toString("hex");
      apikey = serverOptions.apikey = token;
      newOptions = JSON.stringify(serverOptions, null, 2);

      console.log("Generating new API key");

      fs.writeFile("server_files/properties.json", newOptions, function(err) {
        if (err) {
          return console.error("Something went wrong!");
        }
      });
    } else {
      apikey = serverOptions.apikey;
    }
    name = serverOptions.name;
    ram = serverOptions.ram;
    PORT = serverOptions.port;
    mcport = serverOptions.minecraft_port;
    jardir = serverOptions.jarfile_directory
    jarfile = jardir + serverOptions.jar + "." + serverOptions.version + ".jar";
    usingfallback = false;
} catch (e) { // Fallback options
    console.log(e);
}
// ---

// Express options
app.use(cors());

app.use("/", express.static(sf_web));
app.use(require("body-parser").urlencoded({
    extended: false
}));

// ---

app.use(morgan("common", {
    skip: function(req, res) {
        return req.path == "/log" || req.path == "/serverup"
    },
    stream: accessLogStream
}));

// App functions for various things

// Debugging only
// console.log(plugins.pluginList()); // List plugins
// ---

function getServerProps(force) {
    if (!force || (typeof srvprp !== "undefined" && srvprp !== null)) {
        return srvprp;
    } else {
        try {
            srvprp = pr("server.properties");
        } catch (e) {
            console.log(e);
            srvprp = null;
        }
        return srvprp;
    }
}

function checkAPIKey(key) {
    if (key == apikey) {
        return true;
    } else {
        return false;
    }
}

function log(data) { // Log (dump) server output to variable
    //  Technically uneeded, useful for debugging
    //process.stdout.write(data.toString());
    completelog = completelog + data.toString();
}
// ---

if (serverOptions != null && !serverOptions.firstrun) {
    // Start then restart server for things to take effect
    //checkVersion();
    console.log("Starting server...");
    startServer();
    setport();
    restartserver();
    console.log("Server running at localhost:" + PORT);
    console.log("API Key: " + apikey);
    if (usingfallback == true) {
        console.log("Using fallback options! Check your properties.json.")
    }
    // ---
} else {}

// App post/get request handlers (API)
//------------------------------------

app.get("/plugin/:ref/:route", function(request, response) {
    var ref = request.params.ref;
    var route = request.params.route;
    try {
        var pluginResponse = plugins.handleRoute(ref, route, undefined, "get");
        if (pluginResponse !== null) {
            response.send(pluginResponse);
        } else {
            response.send("Unknown route.");
        }
    } catch (e) {
        console.log(e);
        response.send("Unknown route.");
    }
});

app.post("/plugin/:ref/:route", function(request, response) {
    var ref = request.params.ref;
    var route = request.params.route;
    var args = request.body.args;
    // console.log(request.body.args);
    try {
        var pluginResponse = plugins.handleRoute(ref, route, args, "post");
        if (pluginResponse !== null) {
            response.send(pluginResponse);
        } else {
            response.send("Unknown route.");
        }
    } catch (e) {
        console.log(e);
        response.send("Unknown route.");
    }
});

app.get("/download/:file", function(request, response) {
    var options = {
        root: "./",
        dotfiles: "deny",
        headers: {
            "x-timestamp": Date.now(),
            "x-sent": true
        }
    };
    var file = querystring.unescape(request.params.file);
    if (!fs.lstatSync(file).isDirectory()) {
        fs.readFile("./" + file, {
            encoding: "utf-8"
        }, function(err, data) {
            if (!err) {
                response.download(file);
            } else {
                response.send("file not found");
            }

        });
    } else {
        fs.readdir(dir + "/" + file, function(err, items) {

        });
    }
});


// First run setup POST
app.post("/fr_setup", function(request, response) {
    if (serverOptions.firstrun) {
        var details = {
            "apikey": apikey,
            "port": parseInt(request.body.nmc_port),
            "minecraft_port": parseInt(request.body.mc_port),
            "ram": parseInt(request.body.memory) + "M",
            "jarfile_directory": request.body.directory + "/", // Does not seem to matter if there is an extra "/"
            "jar": request.body.flavour,
            "version": request.body.version,
            "firstrun": false
        }

        response.send(JSON.stringify({
            sucess: true
        }));
        var options = JSON.stringify(details, null, 2);
        if (details.version == "latest") {
            details.version = "1.9"; // Must keep this value manually updated /sigh
        }
        fs.existsSync(details.jarfile_directory) || fs.mkdirSync(details.jarfile_directory, 777, true)

        //Download server jarfile
        serverjar.getjar(details.jar, details.version, details.jarfile_directory, function(msg) {
            if (msg == "invalid_jar") {
                console.log("Unknown jarfile, manually install!");
            }
        });

        fs.writeFile("./server_files/properties.json", options, function(err) {
            if (err) {
                return console.log("Something went wrong!");
            } else {
                console.log("New admin settings saved.");
                console.log("You can use CTRL+C to stop the server.");
            }
        });
    } else {
        response.send(JSON.stringify({
            success: false,
            message: "is_not_first_run",
            moreinfo: "The server has been run before!"
        }));
    }
});

app.get("/fr_apikey", function(request, response) {
    if (serverOptions.firstrun) {
        response.send(serverOptions.apikey);
    } else { // Very strict I know :|
        response.send("Access Denied");
    }
});

app.post("/verifykey", function(request, response) {
    var verify = request.param("apikey");
    if (checkAPIKey(verify) == true) {
        response.send("true");
    } else {
        response.send("false");
    }
});

app.post("/command", function(request, response) { // Send command to server
    if (checkAPIKey(request.param("apikey")) == true) {
        var command = request.param("Body");
        if (command == "stop") {
            serverStopped = true;
        } else if (command == "restart") {
            serverStopped = true;
            restartPending = true;
        }
        serverSpawnProcess.stdin.write(command + "\n");

        var buffer = [];
        var collector = function(data) {
            data = data.toString();
            buffer.push(data.split("]: ")[1]);
        };
        serverSpawnProcess.stdout.on("data", collector);
        setTimeout(function() {
            serverSpawnProcess.stdout.removeListener("data", collector);
            response.send(buffer.join(""));
        }, 250);
    } else {
        response.send("Invalid API key");
    }
});

app.get("/log", function(request, response) { // Get server log
    response.send(completelog);
});

app.get("/files", function(request, response) { // Get server file
    fs.readdir(dir + "/", function(err, items) {
        files = items;
        response.send(JSON.stringify({
            files
        }));
    });
});

app.post("/files", function(request, response) { // Return contents of a file
    if (checkAPIKey(request.param("apikey")) == true) {
        var file = request.body.Body;
        if (!fs.lstatSync(file).isDirectory()) {
            fs.readFile("./" + file, {
                encoding: "utf8"
            }, function(err, data) {
                if (!err) {
                    response.send(data);
                } else {
                    console.log(err);
                }

            });
        } else {
            fs.readdir(dir + "/" + file, function(err, items) {
                files = items;
                response.send(JSON.stringify({
                    "isdirectory": "true",
                    files
                }));
            });
        }
    } else {
        response.send("Invalid API key");
    }
});

app.post("/savefile", function(request, response) { // Save a POST"d file
    if (checkAPIKey(request.param("apikey")) == true) {
        var file = request.param("File");
        var newcontents = request.param("Contents");

        fs.writeFile(dir + "/" + file, newcontents, function(err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("File " + file + " saved");
            }

        });
    } else {
        response.send("Invalid API key");
    }
});

app.get("/info", function(request, response) { // Return server info as JSON object
    var props = getServerProps();
    var serverInfo = [];
    if (props !== null) {
        serverInfo.push(props.get("motd")); // message of the day
        serverInfo.push(props.get("server-port")); // server port
        serverInfo.push(props.get("white-list")); // if whitelist is on or off
    } else {
        serverInfo.push("Failed to get MOTD.");
        serverInfo.push("Failed to get port.");
        serverInfo.push(false);
    }
    serverInfo.push(serverOptions.jar + " " + serverOptions.version); // server jar version
    serverInfo.push(outsideip); // outside ip
    serverInfo.push(serverOptions.id); //
    response.send(JSON.stringify(serverInfo));
});

app.delete("/deletefile", function(request, response) {
    if (checkAPIKey(request.body.apikey) == true) {
        var item = request.body.file;
        console.log(item);
        fs.unlink(item, function(err) {
            if (err) throw err;
            console.log(item + " deleted");
            response.send("true");
        });
    } else {
        response.send("false");
    }
});

routes.start(PORT);

process.on("exit", function(code) { // When it exits kill the server process too
    serverSpawnProcess.kill(2);
});
if (typeof serverSpawnProcess != "undefined") {
    serverSpawnProcess.on("exit", function(code) {
        serverStopped == true; // Server process has crashed or stopped
        if (restartPending) {
            startServer();
        }
    });
}
process.stdout.on("error", function(err) {
    if (err.code == "EPIPE") {
        process.exit(0);
    }
});
