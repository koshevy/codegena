# Codegeneration from OAS3

> This is an experimental library. Now supporting TypeScript data types and model. Also, generating experimental Angular2+ services.
>
> Supporting of other languages and frameworks might be possible in the future.

This project is a kit of tools for generation code from OpenAPI3 specification:

- Data types and models (see [generated examples](https://github.com/koshevy/codegena/tree/master/libs/todo-app-scheme/src/lib/typings) from [this spec](https://github.com/koshevy/codegena/blob/master/libs/todo-app-scheme/specs/todo-app-spec.json))
- REST API client services ([examples](https://github.com/koshevy/codegena/tree/master/libs/todo-app-scheme/src/lib/services))
- Validation tools in clients
- Extracted JSON Schemas ([example](https://github.com/koshevy/codegena/blob/master/libs/todo-app-scheme/src/lib/services/schema.f494efb9904ca366b64883.ts))

In the future it's can be appended with:
- REST API backend service templates
- Pure validation tools and validation presets

## Table of contents

1. [Demo](#demo)
1. [Packages](#packages)
1. [How to use](#how-to-use)
   - [oapi3ts-cli: using in NodeJS scripts](#oapi3ts-cli-using-in-nodejs-scripts)
   - [CLI arguments for oapi3ts-cli](#cli-arguments-for-oapi3ts-cli)
   - [oapi3ts API](#oapi3ts-api)
1. [Work with this project](#work-with-this-project)


## Demo

- [TypeScript types and Angular client services](https://github.com/koshevy/codegena/tree/master/libs/todo-app-scheme) in a demo project
- [Stackblitz playground](https://codegena-playground.stackblitz.io/)
- [Example of using of generated data types](https://github.com/koshevy/codegena/blob/master/apps/todo-app-backend/src/app/app.controller.ts) in a demo backend-controller
- [Example of using of generated data types](https://github.com/koshevy/codegena/blob/master/apps/todo-app/src/app/todo-tasks/todo-tasks.store.ts) in a demo frontend application
- [todo-app-backend](https://github.com/koshevy/codegena/tree/master/apps/todo-app-backend) — demo backend application (NestJS) uses `@codegena` tools
- [todo-app](https://github.com/koshevy/codegena/tree/master/apps/todo-app) — demo frontend application (Angular) uses `@codegena` tools
- [Source code of codegena-playground](https://stackblitz.com/edit/codegena-playground). Demonstrates work in a browser.

## Packages

- [oapi3ts](https://github.com/koshevy/codegena/tree/master/libs/oapi3ts) — core library with base adadpters for supported languages. Does generation of data types and models.
- [ng-api-service](https://github.com/koshevy/codegena/tree/master/libs/ng-api-service) — experimental library for generating Angular client services
- [oapi3ts-cli](https://github.com/koshevy/codegena/tree/master/libs/oapi3ts-cli) — Aggregator for supported generation libraries. Provides application working in browser or in CLI.
- [todo-app-scheme](https://github.com/koshevy/codegena/tree/master/libs/todo-app-scheme) — Demo library with auto generated data types and Angular services. Works locally, does't get published in NPM. 

## How to use

#### oapi3ts-cli: using in NodeJS scripts

Install packages of scope:

```
npm i @codegena/oapi3ts, @codegena/ng-api-service, @codegena/oapi3ts-cli
```

So you can use `@codegena/oapi3ts-cli` in NodeJS scripts. For example, let create `update-typings.js` script with code:

```javascript
"use strict";

var cliLib = require('@codegena/oapi3ts-cli');
var cliApp = new cliLib.CliApplication;

cliApp.createTypings();
cliApp.createServices('angular');
```

Then launch:

```
node ./update-typings.js --srcPath ./specs/todo-app-spec.json --destPath ./src/lib --separatedFiles true
```

Class `CliApplication` will get command line arguments `destPath`, `srcPath` and `separatedFiles` by itself.

#### CLI arguments for oapi3ts-cli


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

#### oapi3ts API

You can use API of `@codegena/oapi3ts` to convert whole OAS3 schema object to data type descriptions. Example for TypeScript:

```typescript
import { Convertor } from '@codegena/oapi3ts';

const convertor: Convertor = new Convertor();
const context = {};

/**
 * Base models of specification:
 *  - Requests bodies models
 *  - Requests params sets models
 *  - Responses models
 *
 * Converting starts from entry points and extracts
 * referred types and dependencies. It s why we need
 * to get "entry points". 
 */
const entryPoints = convertor.getOAPI3EntryPoints(context);

/**
 * Rendering each type: every entry point and each of
 * theirs related types.
 */
Convertor.renderRecursive(
    entryPoints,
    (descriptor: DataTypeDescriptor, text) => {
        // Here your code: you get text and type descriptor.
        // Example of using: 
        // https://github.com/koshevy/codegena/blob/master/libs/oapi3ts-cli/src/abstract-application.ts#L57
    }
);
```

And also, you can convert just a JSON-schema into type descriptor and render it:

```typescript
import { Convertor } from 'oapi3codegen';
// you need prettier to beautify result of rendering
import * as prettier from 'prettier';
// provides `_.each(...)` for our example
import * as _ from 'lodash';

const convertor: Convertor = new Convertor();

const anotherJsonSchemaObject = {
    "title": "Person",
    "description": "Information about person you have to register in your system.",
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string"
        },
        "lastName": {
            "type": "string"
        },
        "age": {
            "description": "Age in years",
            "type": "integer",
            "minimum": 0
        }
    },
    "required": ["firstName", "lastName"]
};

const convertResult = convertor.convert(
    anotherJsonSchemaObject,
    {},
    'AnotherType'
);

_.each(convertResult, typeDescriptor => {
    const typeCode = prettier.format(
        typeDescriptor.render([]),
        {parser: 'typescript'}
    );

    console.log(typeCode);
});
```

It will output:

```plaintext
/**
 * ## Person
 * Information about person you have to register in your system.
 */
export interface AnotherType {
  firstName: string;

  lastName: string;

  /**
   * Age in years
   */
  age?: number;
}
```

## Work with this project

| Command                         | Action                                                                   |
|---------------------------------|-------------------------------------------------------------------------------|
| `ng serve todo-app-backend` | Run demo backend application. |
| `ng serve todo-app` | Run demo frontend application. |
| `npm run build:all-libs`          | Build all valuable libs and turn applications to use prebuilt versions of libs (not TypeScript). It's necessary for running and testing applications and libraries in terms close to production.             |
| `npm run clear:prebuilt-libs` | Clear prebuilt libs versions and return project to using live reloading TypeScript sources. |
| `npm run test:libs` | Test libraries supposed to be published. |
| `npm run docs:swagger-ui` | Runs `swagger-ui` for spec file at http://localhost:3001.  |

