NodeMC Plugin Reference 
---

## General Layout

id: ID of plugin, similar to a Java package (com.author.pluginname)

ref: Reference for plugin (http://server/$ref)

name: Name for listing plugins

description: Description of plugin for list

routes: The routes for the plugin (http://server/$ref/$route)

comments: Comments for the plugin which are not seen by the user

## Example Plugin

```
{
	"id": "com.gabrielsimmer.helloworld",
	"ref": "helloworld",
	"name": "Hello World Plugin",
	"description": "Simple NodeMC Plugin",
	"routes": {
		"ping": {
			"reply": "pong"
		},
		"argtest": {
			"args": "$arg",
			"reply": "$arg"
		}
	},
	"comments": {
		"1": "This is a sample plugin for debugging the plugin API in NodeMC",
		"2": "You can use this file as a template for other plugins."
	}
}
```