# /scheduler endpoint

![authenticated:true](https://img.shields.io/badge/authenticated-true-green.svg?style=flat-square) ![status:not-implemented](https://img.shields.io/badge/status-not--implemented-red.svg?style=flat-square)

Create and manage schedulers.

## PUT / - Register a new scheduler

Allows you to create a new scheduler, this endpoint would be ideally be hit by
a scheduler instance that has just been started.

```js
  {
    "success": true,
    "data": "SCHEDULER_CREATED"
  }
```

## DELETE /:id - Delete an existing scheduler

Delete a scheduler formally by `:id`

Example Reponse

```js
  {
    "success": true,
    "data": "SCHEDULER_DELETED"
  }
```

## GET /metrics/:id - Get scheduler metrics

Returns scheduler metrics.

Example Response

```js
  {
    "success": true,
    "data": {
      "created_at": "2017-10-16T13:31:00-07:00",                   // Time this metric was generated at
      "uptime": "seconds",                       // seconds of uptime.
      "health": "good",                          // scheduler evaluation of health
      "load": {
        "current": 25,                           // load percentage
        "average": 22                            // average load, in %? 0-4?
      },
      "cpu": {                                   // cpu information
        "manufacturer": 'Intel®',
        "brand": 'Core™ i5-4210U',
        "vendor": 'GenuineIntel',
        "family": '6',
        "model": '69',
        "stepping": '1',
        "revision": '',
        "speed": '1.70',
        "speedmin": '2.39',
        "speedmax": '2.39',
        "cores": 4
      },
      "instances": [ "id" ],                     // instances scheduler knows it has
      "kernel": "Darwin 10.12.6",                // Platform Release
      "storage": {
        "/dev/sda": {                            // device name
          "size": 20000,                         // size in Bytes
          "free": 20000,                         // free space in Bytes
          "used": 10000,                         // used space in Bytes
          "type": "HFS"                          // filesystem type
        }
      },
      "memory": {
        "total": 2000,                           // total memory in bytes
        "used": 20000,                           // used memory in Bytes
        "free": 10000                            // free memory in Bytes
        /** more data available on certain platforms **/
      }
    }
  }
```
