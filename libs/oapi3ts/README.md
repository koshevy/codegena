# Compiler from OpenAPI3 to TypeScript

> This is an experimental library. Now supporting TypeScript data types and model. Also, generating experimental Angular2+ services.
>
> Supporting of other languages and frameworks might be possible in the future.


It's a part of [@codegena](https://github.com/koshevy/codegena) scope.

See in action: https://codegena-playground.stackblitz.io/ / https://stackblitz.com/edit/codegena-playground.

#### How to use

Install this package:

```
npm i @codegena/oapi3ts
```


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
