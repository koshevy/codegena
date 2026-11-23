---
status: proposed
date: 2026-10-31
decision-makers: Codegena project maintainers
---

# Run the conversion API in Node and browser

## Why

The same TypeScript generator powers the CLI and can be used by browser tools such as Storybook. File access, paths, logging, and formatting crossed that boundary even when a browser caller already had the schema text.

## Decision

> [!IMPORTANT]
> **OAS3 Core owns file reading. The TypeScript generator passes its input and optional file adapter to Core without a second loading layer.**

- **📄 Input:** [`jsonSchemaToTypescript`](../src/json-schema-to-typescript.ts) **MUST** accept loaded text with a source ID or a source path. It passes either form to OAS3 Core.
  - Browser callers can fetch text first or supply a synchronous `fileReadingAdapter` for a path.
- **🧩 Core contract:** [`ActiveJsoncTreeOptions`](../../oas3-core/transitive-parser/active-jsonc-tree/active-jsonc-tree.ts) retains both input forms. `ActiveJsoncTree` owns file reading.
  - Its [default adapter](../../oas3-core/transitive-parser/active-jsonc-tree/file-reading-adapter.ts) uses `process.getBuiltinModule('node:fs')` on Node.js 22+, avoiding a static Node import in Core.
- **🛣️ Paths:** Shared generation paths **MUST** use `pathe`; Node's `path` module stays in Node-only adapters, CLI code, and tests.
- **🖨️ Formatting:** The generated-file formatter **MUST** work with browser-compatible Prettier plugins. Prettier's package resolves to its standalone build for browsers. The JSDoc plugin is supplied as an object in browsers and by package name in Node.
- **📣 Diagnostics:** The [core logging decision](../../oas3-core/adr/008-use-structured-pino-logging-with-portable-output.md) keeps the exported logger clear of `pino-pretty` and Node streams. Its formatter can color terminal levels without requiring browser-only code to interpret ANSI.

The CLI still calls the npm API. Browser code can import or fetch schema text, then supply a stable `srcFileId` for diagnostics and names.

## Trade-offs

- **✅ Good:** One conversion path serves Node and browser callers without a browser filesystem shim.
- **⚠️ Cost:** Browser callers own text loading or provide a synchronous file adapter. The generated TypeScript/Prettier bundle is substantial.

## Verification

- [ ] API tests cover file-path and text inputs.
- [ ] OAS3 Core and OAS3 Visitor TypeScript build, lint, and test targets pass.
- [ ] A browser-targeted bundle can import the API without a static `node:fs` import from OAS3 Core.
