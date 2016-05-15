# CORE

[![Build Status](http://ci.nodemc.space/buildStatus/icon?job=NodeMC)](http://nodemc.space:8080/job/NodeMC/) [![Gitter](https://img.shields.io/badge/slack-community-brightgreen.svg)](https://nodemc.space/slack/)

## About

[Official Documentation](https://nodemc.space/docs)

[Official Website](https://nodemc.space)

[My Patreon](https://www.patreon.com/gmemstr?ty=h)

NodeMC CORE is the core application for NodeMC. It is an API wrapper
for Minecraft servers that developers can use to build dashboards 
and apps around using whatever frameworks and languages they choose. 

It is written in Node.js for utmost speed and reliability, as well
as the wealth of npm packages that are used to expand the functionality
well beyond traditional dashboards abilities.

## Requirements

- [Node.js](https://nodejs.org/en/) >= 5.7.0

- [npm](https://www.npmjs.com/) >= 3.6.0

- [Java JRE](https://www.java.com/en/) >= 1.7.0

### (Optional) Building Requirements

- [nexe](https://jaredallard.me/nexe/) >= 1.1.0
    - Linux / Mac / BSD / Windows
    - Python 2.6 or 2.7 (use --python if not in PATH)
    - Windows: Visual Studio 2010+
    
## Running

Running NodeMC is easy. 

```
git clone https://github.com/NodeMC/CORE.git NodeMC/

cd NodeMC/

npm install

node server.js
```

Then navigate to http://localhost:3000 and go through the setup processs.

## Contributing

### Wall of Fame

[Mathew Da Costa](https://github.com/md678685) for his incredible work on the plugin system
and for his continued support of NodeMC. :thumbsup:

[Jared Allard](https://github.com/jaredallard) for his immense contributions of rewriting NodeMC
using ES6 sepcifications and the default dashboard in React. :heart:

I welcome contributions from other developers, however there are a few
things you should keep in mind when making a pull request.

First things first, pull requests will never be accepted to the master branch
unless there is an important security or performance patch. Otherwise, they will be
merged to whichever is the newest upcoming version of NodeMC (v7).

Second, if you are considering a major rewrite of a particular component of NodeMC,
be sure to run it by me in the Gitter (@gmemstr) so I can be aware of your proposed changes.

## Building

TL;DR - If you modify NodeMC, you need to mark your code and/or binary as such.

> For the developers' and authors' protection, the GPL clearly explains 
that there is no warranty for this free software.  For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.

I use [nexe](https://github.com/jaredallard/nexe) for the builds of NodeMC. I recommend it - version 2.0.0
should be available around the time of this branch being merged upstream.

## Credits

**ExpressJS Components**

[express](http://expressjs.com/)

[body-parser](https://github.com/expressjs/body-parser)

[cookie-parser](https://github.com/expressjs/cookie-parser)

[cors](https://github.com/expressjs/cors)

[morgan](https://github.com/expressjs/morgan)

**Other NPM packages**

[async](https://github.com/caolan/async) by caolan

[external-ip](https://github.com/J-Chaniotis/external-ip) by J-Chaniotis

[file-stream-rotator](https://github.com/holidayextras/file-stream-rotator) by holidayextras

[mkdirp](https://github.com/substack/node-mkdirp) by substack

[mocha](https://mochajs.org/) by MochaJS

[node-fs](https://github.com/bpedro/node-fs) by bpedro

[properties-reader](https://github.com/steveukx/properties) by steveukx

[request](https://github.com/request/request) by request

## License

GNU GPL3