# /files Endpoint

![authenticated:true](https://img.shields.io/badge/authenticated-true-green.svg?style=flat-square)

Download / Manage files on the Minecraft server.

## GET /:path

Get the contents of `:path` if it's a file, or return an array of it's contents
if it's a directory.

Directory response:

```js
[
	{
		"type": "file",
		"name": "file.txt",
		"size": 0,
		"created": "2017-04-19T18:04:07.062Z"
	}
]
```

File response: (with guessed MIME Type)

```js
DJFgrkelnwlfrnlnfkjrnjw file
```

## PUT /:path

![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)

**NOTICE:** This must be a `multipart/form-data` request, just like a normal file
upload.

Put the file data into `:path`, will throw an error if it's a directory, or outside
of the minecraft dir.

```js
// success or error, see README.md. Empty response.
```

## DELETE /:path

Delete file or directory at `:path`.

Returns `data: ""` on success, or error otherwise.
