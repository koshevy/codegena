# TodoApp typings and API-services

This library contains TypeScript typings and API-services (Angular) of demo appplication TodoApp generated from OpenAPI3 [specification](https://github.com/koshevy/codegena/blob/master/libs/todo-app-scheme/specs/todo-app-spec.json) by [@codegena/oapi3ts-cli](https://github.com/koshevy/codegena/tree/master/libs/oapi3ts-cli):

- [typings](https://github.com/koshevy/codegena/tree/master/libs/todo-app-scheme/src/lib/typings)
- [services](https://github.com/koshevy/codegena/tree/master/libs/todo-app-scheme/src/lib/services)

## Work with this library

| Command                         | Action                                                                   |
|---------------------------------|-------------------------------------------------------------------------------|
| `yarn run prepare`          | Prepares library to work. Run it at the first time. |
| `yarn run typings:generate` | Generates typings and services from [spec file](https://github.com/koshevy/codegena/blob/master/libs/todo-app-scheme/specs/todo-app-spec.json). |
| `yarn run docs:swagger-ui` | Runs `swagger-ui` for spec file at http://localhost:3001. |

Other commands see in package.json.



