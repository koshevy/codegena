---
status: proposed
date: 2026-10-20
decision-makers: Codegena project maintainers
---

# Model OpenAPI documents as operation entrypoints

## Why

An OpenAPI document contains paths, operations, requests, responses, and media
types. Treating its root as a JSON Schema loses these relationships and cannot
give an HTTP operation a stable source location or name.

## Decision

> [!IMPORTANT]
> **An `openApiDocument` transitive node owns ordered `entrypointRecord` nodes.**
> Each entrypoint retains its method and path; its request, response, content,
> headers, and parameters are separate linked nodes.

- **🧭 Source order:** The document lists paths in source order. Within each
  path, fixed operations follow the converter's method order; OpenAPI 3.2
  `additionalOperations` follow their map order. References to component
  schemas still pass through the existing JSON Schema convertors.
- **🏷️ Names, tags, and breadcrumbs:** An operation's `operationId` **MUST** supply
  its PascalCase name. Punctuation splits the ID into breadcrumbs, except that
  `-` and `_` remain within a breadcrumb unless the ID contains an uppercase
  letter or adjacent letters and digits. Every part contributes to the name.
  Breadcrumbs **MUST** travel through nested conversion without being added to
  the source `tags`.
  The entrypoint also retains the original, unformatted ID and source tags
  alongside its HTTP method and path, so renderers can document them accurately.
  An absent ID falls back to method and path with a warning. Status-code and
  media-type map entries remain anonymous. Names starting with a digit receive
  an `Api` prefix so they remain valid identifiers. The document name comes
  from `info.title`, or the source filename when the title is absent. This
  fallback permits conversion of a document missing the required OpenAPI title
  without weakening the strict OpenAPI type guard.
- **📝 Annotations:** The shared annotation converter prefers `summary` over
  `title`, keeping one annotation path for schema and OpenAPI nodes.
- **📍 Diagnostics:** Unsupported parameters, references, media schemas, and
  paths produce source-aware warnings. Missing media schemas become `unknown`
  nodes so the containing request or response remains usable.
- **🔢 Extensible keys:** Media types and response codes use string-keyed
  records. Numeric response keys such as `"200"` remain object properties in
  `ActiveJsoncTree` instead of being interpreted as array indexes.
- **📬 Response headers:** `ResponseRecord.headers` **MUST** keep one structure per
  status code (or `default`). Header definitions from different responses
  **MUST NOT** be merged. A linked `responseHeadersRecord` keeps the ordered
  status keys and a declaration name, allowing visitors to render headers in
  their own file. Request header parameters and direct request headers still
  combine within the request.

## Limits and trade-offs

- **✅ Good:** The hierarchy preserves HTTP semantics without introducing a
  target-language visitor or flattening operations into unrelated declarations.
- **⚠️ Scope:** Local JSON Pointer references are resolved for parameters,
  request bodies, responses, and headers. External OpenAPI references need a
  resolver and currently produce warnings or are skipped. Webhook and callback
  operations are not yet included in the document entrypoints.

## Verification

The [parser specification](../transitive-parser/extract-transitive-nodes-from-schema.spec.ts)
uses the 1Password Connect and Beeceptor Storefront documents plus focused
header-by-status and fallback cases. The large GitHub REST description is
outside this change's inspected fixtures.
