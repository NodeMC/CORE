# /auth endpoint

Authentication related requests endpoint.

## GET /verify - Verify API key

Verify credentials via the HTTP header `Authentication`.

Returns normal success response if valid, or error if not.

## POST /token - Get API Key from username and password.

Get API Key used as the Hawk "password".

Example POST body

```js
  {
    "username": "testuser",
    "password": "password"
  }
```

Example response

```js
  {
    "token": "superlongtoken"
  }
```

#### Security Concerns

The tokens are extremely long in the hopes that they will not ever
be cracked, *however* there may be an eventual bug in the PRNG of node rendering
them to be cracked anyways due to weak PRNG.

So, it is *highly recommended* that
the token scheme be changed in future versions to one that requires token
refresh much like [OAuth 2.0 Refresh Tokens](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
Though at this time it is recommended that we use the old access token to generate
a new one, but only once. (it's not bad to fallback to username/password in failure)

## GET /bewit - One time use token

Get a one-time use token that is valid for 5 minutes, this token is designed
to be used only for scheduler registration. This token will eventually only be
generated for admin level accounts.

Example response

```js
  {
    "bewit": "token",
    "created_at": 123023223, // unix timestamp at which this token was created
    "valid": 2000000 // Time
  }
```

#### Time Zone Constraints

It's likely that once this is deployed to production and used in a multi time zone
environment, that there will be issues with validity of the token which is purposely set to small values (5 minutes by default).

Therefore we suggest you **always** implement logic to handle errors returned by
APIs using bewit tokens, since then the server is in charge of determining if it
is, or isn't, valid.
