---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Report parser errors with source locations

## Why

“Invalid reference” is difficult to act on without a source position. Even malformed JSONC needs a useful file, line, and column when no complete syntax node exists.

## Decision

> [!IMPORTANT]
> **Keep source offsets internally; format a consistent location and code frame at the diagnostic boundary.**

- **📍 Coordinates:** [`getLineAndColByContent`](../transitive-parser/utils.ts) **MUST** convert a `jsonc-parser` offset to **one-based** line and column. The offset **MUST** come from a node or parser error, not a string search.
- **🧾 Code frame:** [`getNodeErrorText`](../transitive-parser/utils.ts) prints `file:line:column`, the source line and neighbors, numbered gutters, and a caret. The location stays readable without ANSI colors.
  - Newline offsets are indexed once for the current source. Each diagnostic reads only its three displayed lines, so repeated warnings do not split the entire document again.
- **⚠️ Failure type:** [`JsonParseError`](../transitive-parser/json-parse-error.ts) uses a node or the first parser error. Without an offset it **MUST** report an unknown location rather than invent one. It logs unless logging is disabled to avoid a duplicate event.

A convertor may catch `JsonParseError` for a documented fallback. Unexpected errors still propagate. A structured `{ node }` log alone does not automatically print a code frame; the caller includes one when needed.

## Trade-offs

- **✅ Good:** Terminal users and integrations get the same parseable location, including for invalid JSONC.
- **⚠️ Cost:** Formatting requires the original source content.

## Alternative

- **JSON path or raw offset alone:** Neither tells a reader where to look in the file.

## Verification

- [ ] [Diagnostic tests](../transitive-parser/utils.spec.ts) cover one-based positions, CRLF, tabs, long lines, and syntax errors without a node.
- [ ] OAS3 Core tree and parser tests pass after location behavior changes.

The [reconstruction decision](001-reconstruct-jsonc-into-source-aware-values.md) explains source nodes; the [logging decision](008-use-structured-pino-logging-with-portable-output.md) explains transport.
