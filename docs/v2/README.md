# NodeMC API

**v2**

Written & maintained by [Jared Allard &lt;jaredallard@outlook.com&gt;](mailto:jaredallard@outlook.com)

**NOTICE: THIS SECTION DEFINES ALL TERMINOLOGY AND DEFINES WHAT THINGS ARE. READ THIS**

## Authentication

* API Keys

## Standard Format

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
  "errors": [
    {
      "message": "err_type_or_whatever", // Always default to this.
      "friendly": "Human friendly error message representation", // Optional.
      "code":    "HTTP Error Code"
    }
    // Always parse as many as possible, in the future multiple errors may be given.
  ]
}
```
