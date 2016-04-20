## Changes in jaredallard/NodeMC-CORE fork.

This is a loosely written changelog of changes.

### ES6

Using ES6 Classes and variable definitions (let/const), nothing that requires
babel is being considered.

```js
// Variables
//before
var variable = val;

// after
let variable = value;
const constant = val;

// Functions
// before
function(value) {

}

// after
(value) => {

}

// Classes
// before
var class = function() {
  // constructor
}

class.prototype.methodName = function () {

};

// after
class class {
  constructor() {

  }

  methodName() {

  }
}
```

### Routes

Moved routes into /backend/routes/:version/:base/:methods


#### Instancing a Route

As each route is now in it's own file, it has a unique way of being instanced.

```js
'use strict';

module.exports = (Router, log) => {

  return Router;
}

```

`Router` - the `express#Router` object.

`server` - server object

`log`    - a `NodeMC#Log` object


#### Route Versioning

Introduced in this fork is route versioning, this isolates versions of the *API*.

i.e `/v1/:class/:method` will exist even when `/v2/` is deployed.

This enables seamless deprecation of old endpoints, and the ability to develop without
breaking applications that haven't been updated yet.

#### Standard Error/success response.

Along with the versioning all responses will contain a standard response, with a
few extra fields in certain conditions

```js
{
  "success": false, // true when an error has not occurred.
  "message": "not_first_run", // sent with success: false
  "deprecated": true, // ONLY included when the route/version has been deprecated.
  "data": "" // data sent by endpoint
}
```

Exceptions: responses that return files, check response codes for that.

### Route Mappings

#### /v1/firstrun

`/fr_setup`      -> `/v1/firstrun/setup`

`/fr_apikey`     -> `/v1/firstrun/apikey`


#### /v1/server

_Authenticated_: yes

`/startserver`   -> `/v1/server/start`

`/stopserver`    -> `/v1/server/stop`

`/restartserver` -> `/v1/server/restart`

`/log`           -> `/v1/server/log`

`/serverup`      -> `/v1/server/status`

`/command`       -> `/v1/server/execute`


#### /v1/files

_Authenticated_: yes

`/files`         -> `/v1/files`

`/deletefile`    -> `/v1/files/delete`


#### /v1/auth

_Authenticated_: yes

`/verifykey`     -> `/v1/auth/verify`


#### /v1/plugin

_Authenticated_: variable

`/plugin/:ref/:route` -> `/v1/plugin/:ref/:route`

#### /v1/download

_Authenticated_: yes

**TODO**: This should be merged with `/v1/files`

`/download/:file` -> `/v1/download/:file`

### Plugins

The plugin system has been removed as the same functionability is provided via the
dynamic router. However, it has not been extended to scan a directory for new routes
yet.


### New Libraries

*Important*

`nmc_modules` -> `lib`


#### lib/server.js

This library provides access and controls the minecraft server in a OOP fashion.
This allows isolation of the server to a single class, and makes setting up new
ones at the same time much easier.

#### lib/stage.js

A very hacky-*ish* stage system to control stages metadata. In the future it will
block code until each stage either via ES6 or simple callbacks with async.

#### lib/express.js

The dynamic loading of routes for express, also controls starting express.

#### lib/serverjar.js

This library has been modified to be much more safe in handling files, now waits
until the fd has been closed, and removes a lot of code repetetion.

It also should allow installing forge servers in the future.

#### lib/auth.js

This library is a simple express middleware to grab the apikey from either a
JSON body:

```json
{
  "apikey": "myapikeyhere"
}
```

OR from a query param:

```js
?apikey=myapikey
```

It returns a res#error response when invalid or not supplied.

Instance it like so:

```js
let auth   = require("./lib/auth.js"); // make sure to get relative paths right
let server = myserverconfigobjecthere; // supplied in routers anyways
Router.use(auth(server));

// OR

Router.post("/secrets", auth(server), (req, res) => {
  // We're authenticated if we get this far!
  res.send({
    secret: "The NSA is watching you! :O"
  });
}
```

### Global Changes

*Important* / *Breaking*

A lot of the code was previously written using global procedural code, here's a few
of their changes.

`restartserver()` -> **lib/server.js** `server.restartServer()`

`setport()`       -> **lib/server.js** `server.setport()`

`startServer()`   -> **lib/server.js** `server.startServer()`

`serverStopped`   -> **lib/server.js** `server.running`

`serverRunning`   -> **lib/server.js** `server.running`

`getip()`         -> **REMOVED**

`ram/PORT/etc`    -> `server.config[nodemc/minecraft]` (config object)


### Configuration

*Important* / *Breaking*

Configuration has been changed, and will have a utility to convert old configs to
the new format.

```js
{
  "minecraft": {
    "name": null,
    "ram": "512M",
    "port": 25565,
    "dir": "./minecraft",
    "jar": "",
    "version": ""
  },
  "nodemc": {
    "apikey": "3808e65d80bbe3fe373485c30f5dd830",
    "version": "150",
    "port": 3000,
    "logDirectory": "./nmc_logs"
  },
  "dashboard": {
    "setup": "./frontend/setup",
    "dashboard": "./frontend/dashboard"
  },
  "firstrun": true
}
```
