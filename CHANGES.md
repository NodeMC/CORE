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

`log`    - a `NodeMC#Log` object


#### Route Versioning

Introduced in this fork is route versioning, this isolates versions of the *API*.

i.e `/v1/:class/:method` will exist even when `/v2/` is deployed.

This enables seamless deprecation of old endpoints, and the ability to develop without
breaking applications that haven't been updated yet.

#### Standard Error/success response.

Along wih the versioning all responses will contain a standard response, with a
few extra fields in certain conditions

```json
{
  "success": false, // true when an error has not occurred.
  "deprecated": true, // ONLY included when the route/version has been deprecated.
  ... etc ...
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
