[![npm version](https://badge.fury.io/js/teedy-api.svg)](https://www.npmjs.com/package/teedy-api)

# [Teedy](https://teedy.io) [API](https://demo.teedy.io/apidoc/)

Unofficial [Teedy](https://teedy.io) [API](https://demo.teedy.io/apidoc/) in form of
a [node module](https://www.npmjs.com/package/teedy-api)
Teedy is a lightweight document management system packed with alot of amazing features such as OCR, a very useful web-ui
with tag search and much more. visit their [official website](https://teedy.io)
or [repo](https://github.com/amanoooo/apidoc-swagger-3) to learn more.

I took
the [api-docs](https://github.com/sismics/docs/tree/master/docs-web/src/main/java/com/sismics/docs/rest/resource)   
provided by the official [Teedy/sismics](https://github.com/sismics/docs) repo and converted it into swagger 3 with
this [tool](https://github.com/amanoooo/apidoc-swagger-3),   
from there, I used the official [code-gen](https://github.com/swagger-api/swagger-codegen) swagger tool in order to
generate typescript-axios source code.

[Api Docs can be found here](https://demo.teedy.io/apidoc/)

# !----IMPORTANT REQUIREMENTS---!:

## Requirements when installing/updating the module

[git](https://git-scm.com/downloads) - in the environment path, used to
clone [Teedy repo](https://github.com/sismics/docs)   
[jre or jdk >= 1.7](https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html) - in the environment
path, used to run the official [swagger-codegen-cli.jar](https://github.com/amanoooo/apidoc-swagger-3) tool

## Usage and examples

* Install.

```bash
yarn add teedy-api
```

```bash
npm install teedy-api
```

* Import/Require Usage example

### [perform login](https://demo.teedy.io/apidoc/#api-User-PostUserLogin)

```js
import {UserApiFp} from "teedy-api";

const params = new URLSearchParams();
params.append('username', 'test');
params.append('password', 'test');
params.append('remember', "true");
const usersApi = UserApiFp({
    basePath: "https://demo.teedy.io/api/" //base url for the api
});
usersApi.userLoginPost({
    data: params,  //sent as form/urlencoded
})
    .then(r => r(/* optionally custom axios instance can be passed here for cookies etc...*/))
    .then(s => {
        //extract set-cookie from here
        console.log(s);
    });
```

## Credits

[Sismics company](https://github.com/sismics) - for providing such an amazing software as open source.

[Okoyl](https://github.com/Okoyl) - Helped me along the way to plan, find relevant sources and tools to make this module
possible.

## License

The license chosen for this project can be found inside package.json: MIT I do not own any names or trademarks in this
project. they belong to their respective companies.

## Note to Sismics company

you may have this module-name(teedy-api) or ownership of the module/repo at any time.
contact my email or open an [issue](https://github.com/vasilevich/teedy-api/issues) from your official account.    
I did not intend to infringe any trademarks.

Hopefully this module will save you some time, have fun and best of luck!
