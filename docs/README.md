# NodeMC API Style Guide

This style guide follows the MSTP style guide in all cases except where otherwise
noted, so please use that for any gaps provided here and assume defaults.

## Format

You can find all docs stored in `/v<API_VERSION>`.

All docs must be written in [Markdown](<link>), you can see the structure below:

```md
# ENDPOINT

[ENDPOINT BADGES]

DESCRIPTION OF ENDPOINT

## /METHOD

[METHOD SPECIFIC BADGES]

DESCRIPTION OF ENDPOINT

IF BODY

* paramater - what it does

*REQUEST DATA SAMPLE*

IF RETURNS

*RESPONSE DATA SAMPLE*

```

For all response and request data, you must wrap it in 3 back ticks like so:

\`\`\`

code

\`\`\`

## Testing

All markdown files must pass the [write-good]() linter. There are
available plugins for the editor [Atom](https://atom.io), such as,
[atom-write-good-linter](<linter-plugin-here).

Otherwise run in an interactive shell:

```bash
# NOT IMPLEMENTED
gulp docs-style
```

# Badges

Badges help us convoy information visually and textually, we use them to make our
documentation more visual and less boring to read through.


### Not Implemented

Use this badge when a endpoint or it's method isn't implemented.

![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)

**Markdown**

```md

![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)
```

## Authenticated

Use this badge when authentication is required to access an endpoint.

![authenticated:true](https://img.shields.io/badge/authenticated-true-green.svg?style=flat-square)

**Markdown**

```md

![authenticated:true](https://img.shields.io/badge/authenticated-true-green.svg?style=flat-square)
```
