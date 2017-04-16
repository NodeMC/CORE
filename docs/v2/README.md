# NodeMC API

**v2**

Written & maintained by [Jared Allard &lt;jaredallard@outlook.com&gt;](mailto:jaredallard@outlook.com)

**NOTICE: THIS SECTION DEFINES ALL TERMINOLOGY AND DEFINES WHAT THINGS ARE. READ THIS**

## Authentication

![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)

* API Keys

## Standard Format

![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)


### Basic metadata

All responses have a `metadata` field, this field returns some basic information:

```js
{
  "metadata": {
    "server_time": "1482189604",             // Server's unix timestamp.
    "instance": ""                           // server hostname, or docker container id
  }
}
```

### Errors

This is available when an error has occurred.

```js
{
  "error": {
    "message": "Helpful User Friendly Error Message",
    "code":    "ERRCODE"
  }
}
```
