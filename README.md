# NodeMC-CORE

**Make sure you own the directory jarfiles save to, or 
else you will encounter a `EPIPE` error!**

## About

[Official Documentation](https://docs.nodemc.space)

[Official Website (deprecated to a certain extent)](https://nodemc.space)

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

- [glibc](https://www.gnu.org/software/libc/) >= 2.23

### (Optional) Building Requirements

- [nexe](https://jaredallard.me/nexe/) >= 1.1.0
    - Linux / Mac / BSD / Windows
    - Python 2.6 or 2.7 (use --python if not in PATH)
    - Windows: Visual Studio 2010+
    
## Running

Running NodeMC is easy. 

```
git clone https://github.com/NodeMC/NodeMC-CORE.git

cd NodeMC-CORE

npm install

node Main.js
```

Then navigate to http://localhost:3000 and go through the setup processs

## Contributing

I welcome contributions from other developers, however there are a few
things you should keep in mind when making a pull request.

First, any additions that are considered security risks, even in favour of
performance, will immediately be rejected. Should you believethe pull be
reconsidered, create a new issue with the 'pull reconsideration' tag. It
will be looked over, and if approved you can resubmit a new pull request.
Failure to do so will result in loss of pull request privelage. 

Second, NodeMC *is not* goverened by a 'features over performance' **OR**
'performance over features' mentality. Rather, it is a 'what the average
user wants, as effeciently as possible'. In this way, there is no unnecessary
'fluff' features.

Third, pre-done npm packages are discouraged unless absolutely neccesary. While
there are currently quite a few npm package dependencies, it is planned to eliminate
the need for most of these and replace them with more specific methods. Help with
these are greatly appreciated. 

## Building

> For the developers' and authors' protection, the GPL clearly explains 
that there is no warranty for this free software.  For both users' and
authors' sake, the GPL requires that modified versions be marked as
changed, so that their problems will not be attributed erroneously to
authors of previous versions.   

If you want to build NodeMC as a binary for easier deployment on servers, 
you **may only for personal use**. Distribution of custom binaries is
covered in the LICENSE file.

[nexe](https://github.com/jaredallard/nexe) is the official packaging
tool used for NodeMC, as I use it personally and am therefore
able to provide the most support for it. You can build with the
following commands.

```
# *nix (OSX and Linux)
nexe -i Main.js -o NodeMC
# Windows
nexe -i Main.js -o NodeMC.exe
```

You must include both the `server_files` and `server.properties`
(`server.properties` can be blank) with your distributed binary.
