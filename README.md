# Code generation from OpenAPI 3 to TypeScript

Lightweight and simple. Can be used for *browser's* and for Node.js ecosystems.
Now supports converting from **OpenAPI 3** to **TypeScript** types (OpenAPI 2 and below are not supported).

<details>
<summary>For example, creates constructions such as (click to expand):</summary>

```typescript
/**
 * Typical 401 response
 */
export interface HttpErrorUnauthorized {
  /**
   * Error message
   */
  message: string;

  /**
   * Data appropriate to
   * [WWW-Authenticate](https://tools.ietf.org/html/rfc7235#section-3.1).
   */
  wwwAuthenticate?: {
    /**
     * Prompt to authenticate
     */
    title: string;

    /**
     * Kind of authorization user has to use
     */
    type: string;

    /**
     * Type of authority ("barrier" or etc.)
     */
    realm: string;
  };
}

export interface GetParametersMeta_response401
  extends HttpErrorUnauthorized {

  /**
   * Error message
   */
  message: string;

  /**
   * Data appropriate to
   * [WWW-Authenticate](https://tools.ietf.org/html/rfc7235#section-3.1).
   */
  wwwAuthenticate?: {
    /**
     * Prompt to authenticate
     */
    title: string;

    /**
     * Kind of authorization user has to use
     */
    type: string;

    /**
     * Type of authority ("barrier" or etc.)
     */
    realm: string;
  };
}

/**
 * Kind of request error: syntax or semantic. Syntax error means the
 * application logic error, semantics — error of data, that contragent
 * inputs.
 */
export enum HttpErrorBadRequestTypeEnum {
  Syntax = "syntax",
  Semantic = "semantic"
}

/**
 * Typical response one Bad Request Error (400)
 */
export interface HttpErrorBadRequest {
  /**
   * Common error message
   */
  message: string;

  /**
   * Kind of request error: syntax or semantic. Syntax error means the
   * application logic error, semantics — error of data, that contragent
   * inputs.
   */
  type?: HttpErrorBadRequestTypeEnum;

  /**
   * Explained description of error
   */
  description?: string;

  /**
   * Additional list of errors with JSON-pointers
   */
  errors?: Array<{
    originalMessage: string;

    message?: string;

    jsonPointer: string;
  }>;
}

/**
 * ## MetaDataView
 * MetaData helps decide what the method has to use to
 * interpret and render parameter or category of parameters.
 */
export type GetParametersMeta_response200 = Array<Category | Parameter>;

```
</details>

-----

> #### 🚦 Status of project
> - **Stabilization:** ready to use in non-production projects (see Road Map).
> - **Not supported YML (only JSON)**. *Will be supported soon. Now, you can use something like [js-yaml](https://www.npmjs.com/package/js-yaml)*
> - ***🐞 UPDATE:*** Fixed problem with infinity loop in recursive types!
>
> Please, if it possible: send me your schemas that not converts properly.

### Online demo

Work in progress! Now, see how to use.

### Road map

Work is just started, and current functionality (creating TypeScript types) —
It's just a first part of the supposed functionality.
With time, it's supposed, possibilities of this plugin will be extended by:

- *Make project well documented [in progress]*
- *YAML support [in progress]*
- *Stabilization [in progress]*
- *Playground site [in progress]*
- Plugins support
- Generation classes (now creates only interfaces) with internal validation [ *concept description is coming soon* ]
- Generation API Classes
    - Solutions for AngularX based on *Assured requests idea* with internal validation [ *concept description is coming soon* ]
    - *May be, something else...*
- **DDD-tools** (Start kit for OpenAPI3-projects):
    - Bundler for complex files structure. Need fo organization complex API-libraries.
    - [Dredd](https://www.npmjs.com/package/dredd)
    - Most populars doc-generators (at least, [Redoc](https://www.npmjs.com/package/redoc) and [SwaggerUI](https://www.npmjs.com/package/swagger-ui))
    - Convention for working with DDD OpenAPI3
- **Other languages** (is there are need for it?): Kotlin, Java, PHP, 

### Ideology

- **Data format loyalty:** it's should be as useful as it possible regardless validity of source data.
- **Integration**: solution should be able to be integrated to any system (at least, based on NPM). It's mean, should have CLI and API.

### Why not swagger-codegen?

- Uses NPM instead Java (install via npm and easy-integratable)
- Lightweight ([swagger-codegen](https://github.com/swagger-api/swagger-codegen) solution — it's about a 14mb for ready JAR)
- Supports OpenAPI3
- Above all, intended for TypeScript 

## Install

##### 1. Install TypeScript

```sh
npm install typescript@latest -g
``` 

##### 2. Install oapi3codegen global (for CLI using)

```sh
npm install oapi3codegen -g
``` 

##### 3. Install oapi3codegen for local project

```sh
npm install oapi3codegen --save
``` 

## Using via CLI

```sh
oapi3codegen --srcPath /PATH/TO/SRC/open-api-file.json --destPath /PATH/TO/DEST --separatedFiles true
```

#### CLI arguments

| CLI Argument       | Description                                                                   |
|--------------------|-------------------------------------------------------------------------------|
| **srcPath**        | Path of url of JSON file with OpenAPI3 specification                          |
| **destPath**       | Path for destination directory                                                |
| **separatedFiles** | Whether should converted types be saved in separated files, or in single file |

Also, you can set some of options for convertor's [configuration](https://github.com/koshevy/oapi3codegen/blob/master/core/config.ts#L99)
config via CLI:

| Option                          | Description                                                                   |
|---------------------------------|-------------------------------------------------------------------------------|
| **defaultContentType**          | Default content-type contains no prefixes/suffixes in type names.             |
| **implicitTypesRefReplacement** | Mode when models that refer to any models via `$ref` are replacing implicitly even if firsts have names |

## Using via API (TypeScript)

You can convert whole OpenAPI3-specification:

```typescript
import { Convertor } from 'oapi3codegen';

const convertor: Convertor = new Convertor();

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
        // You can see how oapi3codegen's CLI uses this calback here:
        // https://github.com/koshevy/oapi3codegen/blob/master/cli.ts#L73
    }
);
```

And also, you can convert stand-alone JSON-schema into type descriptor,
that could be rendered:

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

And this code will print result:

```typescript
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

## API (TypeScript)

Coming soon...

## How to extend?

Coming soon...
