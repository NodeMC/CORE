# /user endpoint

Manage users.

# POST / - Create a new user.

This endpoint enables you to create a new user.

Example POST body

```js
  {
    "username": "testuser",
    "password": "password"
  }
```

Example Response

```js
  {
    "success": true,
    "data": "USER_CREATED"
  }
```

# DELETE /:username - Delete the current user.

![authenticated:true](https://img.shields.io/badge/authenticated-true-green.svg?style=flat-square) ![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)

This endpoint enables you to delete any user by their username, will one day
require admin status.

Example Response

```js
{
  "success": true,
  "data": "USER_DELETED"
}
```

# PUT /:username - Update the user's information.

![authenticated:true](https://img.shields.io/badge/authenticated-true-green.svg?style=flat-square) ![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)

Update `:username`'s information.

Example POST body

```js
  {
    "username": "newusername",
    "password": "newpassword"
  }
```

Example Response

```js
{
  "success": true,
  "data": "USER_UPDATED"
}
```
