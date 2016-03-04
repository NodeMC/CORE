/*
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
 */

// Requires
var spawn = require('child_process').spawn;
var express = require('express');
var app = require('express')();
var fs = require('fs');
var pr = require('properties-reader');
var getIP = require('external-ip')();
var path = require('path');
var getfile = require('request');
var crypto = require('crypto');
var ncp = require('ncp').ncp;
var querystring = require('querystring');
var morgan = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var serverjar = require('./nmc_modules/serverjar.js');
// ---

// Set variables for the server(s)
var current = 142;
var dir = ".";
var properties = [];
var files = "";
var usingfallback = false;
var completelog = "";
try { // If no error, server has been run before
    var serverOptions = JSON.parse(fs.readFileSync('server_files/properties.json', 'utf8'));
    var srvprp = pr('server.properties'); // Get the original properties
    var oldport = srvprp.get('server-port');

    if (serverOptions.firstrun) {
        sf_web = "server_files/web_files/setup/";
    } else {
        sf_web = "server_files/web_files/dashboard/";
    }
    //console.log(sf_web);
} catch (e) { // If there is an error, copy server files!
    console.log(e);
    var serverOptions = srvprp = null;
    console.log("Essential files not found! Please read the guide on Getting Started :)");
    console.log("Exiting...");
    process.exit(1);
}
try {
    if (serverOptions['apikey'] == "") {
        console.log("Generating new API key");
        var token = crypto.randomBytes(16).toString('hex');
        var apikey = serverOptions.apikey = token;
        var newOptions = JSON.stringify(serverOptions, null, 2);

        fs.writeFile("server_files/properties.json", newOptions, function(err) {
            if (err) {
                return console.log("Something went wrong!");
            } else {
                console.log("New API key saved");
            }
        });

    } else {
        var apikey = serverOptions['apikey'];
    }
    var name = serverOptions['name'];
    //directory = "/home/gabriel/"+name;
    //console.log(dir + " | " + directory);
    var ram = serverOptions['ram'];
    var PORT = serverOptions['port'];
    var mcport = serverOptions['minecraft_port'];
    var jardir = serverOptions['jarfile_directory'];
    var jarfile = jardir + serverOptions['jar'] + '.' + serverOptions['version'] + '.jar';
    usingfallback = false;
} catch (e) { // Fallback options
    console.log(e);
    var serverOptions = null;
    var ram = '512M';
    var PORT = 3000;
    var mcport = 25565;
    var jarfile = '';
    usingfallback = true;
}
var outsideip;
var serverSpawnProcess;
var serverStopped = false;
// ---

app.use('/', express.static(sf_web));
app.use(require('body-parser').urlencoded({
    extended: false
}));

/*
 * Access logging
 */

var logDirectory = dir + '/nmc_logs'

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false,
    date_format: "YYYY-MM-DD"
})

app.use(morgan('common', {
    skip: function(req, res) {
        return req.path == "/log" || req.path == "/serverup"
    },
    stream: accessLogStream
}));

// App functions for various things

function checkAPIKey(key) {
    if (key == apikey) {
        return true;
    } else {
        return false;
    }
}

function checkVersion() { // Check for updates
    getfile.get('https://nodemc.space/version', function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var version = body;
            if (version != current) {
                var behind = version - current;
                console.log("NodeMC is " + behind + " versions behind. Run the setup script again.")
            }
        }
    });
}

function restartserver() { // Restarting the server
    serverSpawnProcess.stdin.write('say [NodeMC] Restarting server!\n');

    serverSpawnProcess.stdin.write('stop\n');

    serverSpawnProcess.on("close", function() {
        serverStopped = true;
        setport();

        startServer();
    });
}

function setport() { // Enforcing server properties set by host
    //console.log(oldport);
    //console.log(mcport);
    try {
        // Here we set any minecraft server properties we need
        fs.readFile('server.properties', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace('server-port=' + oldport, 'server-port=' + mcport);

            fs.writeFile('server.properties', result, 'utf8', function(err) {
                if (err) return console.log(err);
            });
        });
        srvprp = pr('server.properties'); // Get the new properties
        //console.log(oldport);

        fs.readFile('eula.txt', 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace('eula=false', 'eula=true');

            fs.writeFile('eula.txt', result, 'utf8', function(err) {
                if (err) return console.log(err);
            });
        });
    } catch (e) {
        console.log(e);
    }
}

getIP(function(err, ip) { // Get external IP for server
    if (err) {
        throw err;
    }
    outsideip = ip;
});

function startServer() { // Start server process
    serverStopped = false;
    serverSpawnProcess = spawn('java', [
        '-Xmx' + ram,
        '-Xms' + ram,
        '-jar',
        jarfile,
        'nogui'
    ]);
    serverSpawnProcess.stdout.on('data', log);
    serverSpawnProcess.stderr.on('data', log);
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

app.get('/download/:file', function(request, response) {
    var options = {
        root: './',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    var file = querystring.unescape(request.params.file);
    if (!fs.lstatSync(file).isDirectory()) {
        fs.readFile("./" + file, {
            encoding: 'utf-8'
        }, function(err, data) {
            if (!err) {
                response.download(file);
            } else {
                response.send("file not found");
            }

        });
    } else {
        fs.readdir(dir + '/' + file, function(err, items) {

        });
    }
});


// First run setup POST
app.post('/fr_setup', function(request, response) {
    if (serverOptions.firstrun) {
        var details = {
            'apikey': apikey,
            'port': parseInt(request.body.nmc_port),
            'minecraft_port': parseInt(request.body.mc_port),
            'ram': parseInt(request.body.memory) + "M",
            'jarfile_directory': request.body.directory,
            'jar': request.body.flavour,
            'version': request.body.version,
            'firstrun': false
        }

        response.send(JSON.stringify({
            sucess: true
        }));
        var options = JSON.stringify(details, null, 2);
        if (details.version == "latest") {
            details.version = "1.9"; // Must keep this value manually updated /sigh
        }
        fs.existsSync(details.jarfile_directory) || fs.mkdirSync(details.jarfile_directory)

        //Download server jarfile
        serverjar.getjar(details.jar, details.version, details.jarfile_directory, function(msg) {
            if(msg == "invalid_jar"){
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
            message: 'is_not_first_run',
            moreinfo: 'The server has been run before!'
        }));
    }
});

app.get('/fr_apikey', function(request, response) {
    if (serverOptions.firstrun) {
        response.send(serverOptions.apikey);
    } else { // Very strict I know :|
        response.send("Access Denied");
    }
});

app.post('/verifykey', function(request, response) {
    var verify = request.param('apikey');
    if (checkAPIKey(verify) == true) {
        response.send('true');
    } else {
        response.send('false');
    }
});

app.post('/command', function(request, response) { // Send command to server
    if (checkAPIKey(request.param('apikey')) == true) {
        var command = request.param('Body');
        if (command == "stop") {
            serverStopped = true;
        }
        serverSpawnProcess.stdin.write(command + '\n');

        var buffer = [];
        var collector = function(data) {
            data = data.toString();
            buffer.push(data.split(']: ')[1]);
        };
        serverSpawnProcess.stdout.on('data', collector);
        setTimeout(function() {
            serverSpawnProcess.stdout.removeListener('data', collector);
            response.send(buffer.join(''));
        }, 250);
    } else {
        response.send("Invalid API key");
    }
});

app.get('/serverup', function(reqiest, response) {
    if (serverStopped == true) {
        response.send("no");
    } else {
        response.send("yes");
    }
});

app.get('/log', function(request, response) { // Get server log
    response.send(completelog);
});

app.get('/files', function(request, response) { // Get server file
    fs.readdir(dir + '/', function(err, items) {
        files = items;
        response.send(JSON.stringify({
            files
        }));
    });
});

app.post('/files', function(request, response) { // Return contents of a file
    if (checkAPIKey(request.param('apikey')) == true) {
        var file = request.body.Body;
        if (!fs.lstatSync(file).isDirectory()) {
            fs.readFile("./" + file, {
                encoding: 'utf-8'
            }, function(err, data) {
                if (!err) {
                    response.send(data);
                } else {
                    console.log(err);
                }

            });
        } else {
            fs.readdir(dir + '/' + file, function(err, items) {
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

app.post('/savefile', function(request, response) { // Save a POST'd file
    if (checkAPIKey(request.param('apikey')) == true) {
        var file = request.param('File');
        var newcontents = request.param('Contents');

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

app.get('/info', function(request, response) { // Return server info as JSON object
    properties.push(srvprp.get('motd')); // message of the day
    properties.push(srvprp.get('server-port')); // server port
    properties.push(srvprp.get('white-list')); // if whitelist is on or off
    properties.push(serverOptions['jar'] + ' ' + serverOptions['version']); // server jar version
    properties.push(outsideip); // outside ip
    properties.push(serverOptions['id']); // 
    response.send(JSON.stringify(properties));
    properties = []; // reset so we don't keep adding to it
});

app.post('/restartserver', function(request, response) { // Restart server
    if (checkAPIKey(request.param('apikey')) == true) {
        restartserver();
    } else {
        response.send("Invalid API key");
    }
});

app.post('/startserver', function(request, response) { // Start server
    if (checkAPIKey(request.param('apikey')) == true) {
        if (serverStopped == true) {
            setport();
            startServer();
        } else {}
    } else {
        response.send("Invalid API key");
    }
});

app.post('/stopserver', function(request, response) { // Stop server
    if (checkAPIKey(request.param('apikey')) == true) {
        if (serverStopped == false) {
            serverSpawnProcess.stdin.write('stop\n');
            serverStopped = true;
            response.send(serverStopped);
        } else {
            response.send(serverStopped);
        }
    } else {
        response.send("Invalid API key");
    }
});

app.delete('/deletefile', function(request, response) {
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

app.listen(PORT); // Listen on port defined in properties.json

if (serverOptions != null && !serverOptions.firstrun) {
    process.on('exit', function(code) { // When it exits kill the server process too
        serverSpawnProcess.kill();
    });
}
process.stdout.on('error', function(err) {
    if (err.code == "EPIPE") {
        process.exit(0);
    }
});