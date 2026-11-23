---
status: proposed
date: 2026-10-20
decision-makers: Codegena project maintainers
---

# Render OpenAPI types with scoped files and a root namespace

## Why

An OpenAPI operation has several related declarations: parameters, request
bodies, response bodies, and headers. A flat list loses their relationship;
one undifferentiated body type loses the status and media-type choices.

## Decision

> [!IMPORTANT]
> **In separate-file output, use the root namespace to aggregate named types
> from directory barrels.** Each nested barrel re-exports type declarations
> directly from its own directory. Single-file output groups operations in the
> document namespace.

- **🧭 Single-file navigation.** The document namespace groups operation namespaces by
  source tags and the slash-delimited domain of an operation ID. These remain
  separate in OAS3 Core metadata. Each group path uses its last segment as the
  namespace name. When two paths would use the same name, preceding segments
  are added from right to left until the names differ. The document forwards
  type-only operations through nested namespaces with explicit type aliases,
  preserving their member paths, generic constraints, and defaults.
- **🧩 Operation members.** Each operation namespace in single-file output **MUST** alias its parameter,
  request, response, and header declarations. A response header alias selects
  the structure associated with a status code. Response headers live in their
  own declaration and file, like response bodies. Its TSDoc records the
  original HTTP path, method, operation ID, and source tags when supplied;
  operation-ID breadcrumbs and generated fallback names **MUST NOT** masquerade
  as original tags.
- **📚 Component navigation.** In single-file output, each operation has a `Lib` child namespace
  exposing the component schemas it uses, including schemas reached through
  nested references. The document has a `Lib` namespace exposing the union of
  those components through its operation aliases. When an operation tag already
  occupies `Lib`, the document uses `LibApi`, `LibApi1`, and so on. Both levels
  document the library's purpose, and each alias carries the source schema's
  TSDoc. In separate-file output, the document's `Lib` aliases refer to directory
  barrels. The generated documentation links to the namespace that exposes the type.
- **🔀 Body selection:** Request types **MUST** branch on media type. Response types
  **MUST** branch on status code, then media type. Impossible media combinations yield
  `never`, so defaults spanning several media types remain useful unions.
- **📦 Separate-file navigation.** The root `index.ts` **MUST** be the only
  generated file with namespaces. Its document namespace uses `info.title`,
  with the source filename as fallback. Its members mirror the generated
  directories and type names. Each directory barrel **MUST** use named
  `export type` statements for its own files. The root **MUST** also export the
  document namespace as its type-only default. Nested barrels **MUST NOT**
  emit default exports. An existing declaration at a preferred barrel path
  keeps its filename.
- **📂 Directory scope:** Separate-file output places operations under the
  first source tag, when present, then under `operationId` breadcrumbs split at
  punctuation. Hyphens and underscores split only when the ID has an uppercase
  letter or adjacent letters and digits. Repeated words are removed across
  folder levels.
  The normalized HTTP path supplies folders only when an operation has no ID.
  A component used by one operation stays beside it. Components shared across
  operation directories move to `_common` within their nearest shared scope;
  those shared across tags move to root `_common`. A naming option can choose
  the common directory from its parent path and sibling directory names. The
  default adds a numeric suffix when `_common` is already occupied.
- **🔗 Component placement:** Components and operation declarations use the
  same scope and folder simplification rules. A component reached through one
  consumer stays beside it, such as `event.ts` and `fork-event.ts`. Components
  shared across operations move to their nearest common scope. A component
  **MUST NOT** gain an extra directory merely from its consumer's declaration
  name; recursive references likewise **MUST NOT** create circular folders.
- **🗂️ Path transformation:** `transformFilePath` **MUST** receive the
  directory-qualified path before imports are calculated. Repeated folder
  names and folders that are their parent's only entry are collapsed for all
  declarations. Documents stay at the root, and JSON Schema-only output
  remains flat.

The [OAS3 Core OpenAPI model](../../oas3-core/adr/009-model-openapi-documents-as-operation-entrypoints.md)
owns extraction and naming. OAS3 Visitor TypeScript owns only the TypeScript representation.

## Trade-offs

- **✅ Good:** A caller can navigate from a document to an operation, then
  choose a status and media type without losing the referenced body schema.
- **⚠️ Cost.** TypeScript rejects a whole module alias inside a namespace with
  `verbatimModuleSyntax` enabled. The root imports each barrel with
  `import type * as` and forwards each member with an explicit type alias.
  These aliases retain generic constraints and defaults.
- **📝 Formatting cost:** Use the parser's comment offsets when formatting
  TSDoc. Scanning the full generated file for every comment makes large
  barrels slow to format. Bundle the patched JSDoc formatter so that
  published CLI installs use the same implementation as the workspace.
- **⚠️ Limit:** A response with neither content nor headers currently has no
  status entry in the OAS3 Core transitive node. OAS3 Visitor TypeScript cannot recover that status
  from the node alone.
- **🧩 Compiler compatibility.** Generated ESM files **MUST** compile with
  `verbatimModuleSyntax`. Consumers can use named type imports from an
  individual file or its directory barrel. The root namespace supports both
  named and default type imports.

## Verification

The [OpenAPI visitor tests](../src/visitors/oas3/visitor-oas3.spec.ts) compare
complete declarations, check directory placement across nested references,
and compile separate generated files with `verbatimModuleSyntax` enabled.
The matching [use cases](../USECASES.md#openapi-operation-trees) track media,
status, header, namespace, and import behavior.
