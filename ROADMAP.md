# CODEGENA 3.x: Actual Roadmap

## Motivation

This project was originally started as an experiment and
was an experiment (or MVP) over the past two years.
All this time conditions have been coming clearer.
And it has been figuring out what it takes to do this.

As it turns out, it is quite possible to create robust code generation tool by one person.
Understanding of niche and needs should help me to save efforts and continue with
a clear-cut goals and vision. I think it's a good time to prepare the next stage:
with well figured ideology and contribution guide.

So, experience to use concepts from this project in real commercial applications had shown:

- **No need for CLI application**. Every project has its own CI infrastructure with individual requirements and these requirements can't be generalized avoiding huge efforts.
- **No need for readymade code (such as services or functions)**. The same reason: requirements are so much different and not-generalizable that design, development, delivery and support come to be too expensive. It's preferable to provide simple helpers (validation, simple result picking etc.) and promote practice of in-project code generation (see the next thesis).
- **It had better to embed into ecosystems**. Everyone relies on their ecosystem. For instance, there is in Angular ecosystem [Schematics](https://angular.io/guide/schematics) solution has scope and common practices. It's likely, developers accustomed to Angular will try to use Schematics when there is arose to deal with code-generation or any kind of automation.
- **Solution should be simple to integrate and modify (AST)**. Continuing the theme of common ecosystems and solutions (like the Angular Schematics). Once you try to embed auto-generated code into your infrastructure, you facing to need to deal with AST. So you can integrate and modify result of code generating.
- **No point to think about any other languages**. There is no way to support different language because every language requires to deal with it's own ecosystem. A bird in the hand is worth two in the bush, and that bird is the TypeScript. 

## Goals

To provide API for OAS3-converting that should be friendly to best practices of code generation in modern applications. The undoubted leader (and pioneer!) in this way is the [Angular Schematics](https://angular.io/guide/schematics). It means convenience to work with Angular Schematics is in priority.

## API

API should facilitate to:

1. **Useful work with AST (creating/modification)**. API should generate all necessary entities in AST and allow to traverse through and modify result.
1. **Useful work with OAS3 metadata**. Generating of new code based on metadata should be simply. As well as the traverse between metadata and already generated related entities.

## Roadmap

1. Stop supporting all libraries but `oapi3ts` (`axios-wrapper`, `ng-api-service` and `oapi3ts-cli` getting trashed)
1. Design new API contract
1. Refactor `oapi3ts` in order to support contract changing (renew tests and simplify structure)
1. Add bridge between old implementation and new contract
1. **Make contributing guide**
1. Continue improving

## Time frame

Time frame is getting clear now.
