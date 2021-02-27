[![npm version](https://badge.fury.io/js/teedy-api.svg)](https://www.npmjs.com/package/teedy-api)

# Teedy API

Unofficial Teedy API in form of npm module

I took
the [api-docs](https://github.com/sismics/docs/tree/master/docs-web/src/main/java/com/sismics/docs/rest/resource)   
provided by the official [Teedy/sismics](https://github.com/sismics/docs) repo and converted it into swagger 3 with this [tool](https://github.com/amanoooo/apidoc-swagger-3),   
from there, I used the official [code-gen](https://github.com/swagger-api/swagger-codegen) swagger tool in order to generate typescript-node-fetch source code.  

    

[Api Docs can be found here](https://demo.teedy.io/apidoc/)

## Requirements when first installing IMPORTANT!!!

[git](https://git-scm.com/downloads) in the environment - used to clone [Teedy repo](https://github.com/sismics/docs)   
[java 7+](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html) in the environment - used to
run the official [swagger-codegen-cli.jar](https://github.com/amanoooo/apidoc-swagger-3) tool

## Usage and examples

* Install.

```bash
yarn add teedy-api
```

```bash
npm install teedy-api
```

* Import/RequireUsage

```js

```

## License

The license chosen for this project can be found inside package.json: MIT

Hopefully this module will save you a little of time, have fun and best of luck!
