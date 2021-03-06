# JSON Plus

Experimental work to see if there is a blend of JSON with simple extension functions that keeps
the nice attributes of JSON, but, allows simple functions and lookups for common use cases that are often moved to JavaScript.

Example json with the features:

```json
{
  "john": {
    "age": "23",
    "lastname": "smith"
  },
  "bob": {
    "age": "29",
    "firstname": "bob",
    "lastname": "smith",
    "fullname": { "$concat": ["$bob.firstname", " ", "$bob.lastname"]}
  },
  "jonny": {
    "age": {"$value": "$bob.age"},
    "firstname": {"$value": "$bob.firstname"},
    "lastname":  {"$value": "$bob.lastname"},
    "fullname": { "$concat": ["$bob.firstname", " ", "$bob.lastname"]},
    "home_directory": {"$value": "$options.home"}
  },
  "greg": {
    "age": { "$value": "$options.defaultAge"},
    "lastname": "smith"
  },
  "options": {
    "defaultAge": "21",
    "home": {"$process.env": "HOME"}
  }
}

```
## Features
* Injection of environment variables ($process.env or $env command).
* Copy values from one part of the JSON document to another without duplicating the values ($value command)
* Basic concatination functions ($concat command)
* Index for items in the JSON object to allow 'flattened' access (i.e. root.container.somevalue)
* Ability to call custom functions so JavaScript can be used to expand/inject content ($function command)

## Examples

To see the example above in action you can use this command:

```sh
npm run loadfile
```

## Feature Backlog

## References

https://www.youtube.com/watch?v=ymjClXYuG2w&index=3&list=PLe-ggMe31CTcEwaU8a1P1Gd95A77HV85K

### License

jsonplus is [BSD licensed](./LICENSE.md).
