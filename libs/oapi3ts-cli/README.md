# CLI Application API for codegeneration from OAS3

> This is an experimental library. Now supporting TypeScript data types and model. Also, generating experimental Angular2+ services.
>
> Supporting of other languages and frameworks might be possible in the future.

It's a part of [@codegena](https://github.com/koshevy/codegena) scope.

See in action: https://codegena-playground.stackblitz.io/ / https://stackblitz.com/edit/codegena-playground.

## Using in NodeJS scripts

Install (without optional dependencies):

```
npm i @codegena/oapi3ts-cli --no-optional
```

or

```
yarn add @codegena/oapi3ts-cli --ignore-optional
```

So you can use `@codegena/oapi3ts-cli` in NodeJS scripts. For example, lets create `update-typings.js` script with code:

```javascript
"use strict";

var cliLib = require('@codegena/oapi3ts-cli');
var cliApp = new cliLib.CliApplication;

cliApp.createTypings();
cliApp.createServices('angular');
```

Then launch:

```
node ./update-typings.js --srcPath ./specs/todo-app-spec.json --destPath ./ --separatedFiles true
```

Class `CliApplication` will get command line arguments `destPath`, `srcPath` and `separatedFiles` by itself.

#### CLI arguments


| CLI Argument       | Description                                                                   |
|--------------------|-------------------------------------------------------------------------------|
| **srcPath**        | Path of url of JSON file with OpenAPI3 specification                          |
| **destPath**       | Path for destination directory                                                |
| **separatedFiles** | Whether should converted types been saved in separate files, or in single file |

Also, you can set some of options for convertor's [configuration](https://github.com/koshevy/oapi3codegen/blob/master/core/config.ts#L99)
config via CLI:

| Option                          | Description                                                                   |
|---------------------------------|-------------------------------------------------------------------------------|
| **defaultContentType**          | Default content-type contains no prefixes/suffixes in type names.             |
| **implicitTypesRefReplacement** | Mode when models that refer to any models via `$ref` are replacing implicitly even if firsts have names |
