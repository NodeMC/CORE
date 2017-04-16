# /auth endpoint

Authentication related requests endpoint.

## POST /verify

Verify credentials via the HTTP header `Authentication`, or via JSON.

* `apikey` - API Key to validate.

Example JSON POST.


```js
{
  "apikey": "xxxxxx-xxxxxx-xxxxxx"
}
```

Returns `true` if successful, or error if not.
