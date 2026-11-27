---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Use structured Pino logging with portable output

## Why

Recoverable schema details need visible warnings. Convertors should not depend on `console` or terminal formatting, and tests must be able to inspect the same events.

## Decision

> [!IMPORTANT]
> **Pino carries structured events. A small local formatter presents terminal messages; browser consumers use Pino's browser output.**

- **🧩 Event contract:** [`logger.ts`](../logger/logger.ts) exports the Pino-backed `Logger`, `LogEvent`, and factory. [`extractTransitiveNodesFromSchema`](../transitive-parser/extract-transitive-nodes-from-schema.ts) **MUST** accept and forward a logger.
- **📦 Per-conversion collection:** [`CollectingLogger`](../logger/collecting-logger.ts) gives each conversion its own Pino logger and returns core-owned `CollectedLog` records. It retains original JSONC nodes and errors; `getLogs()` adds source locations when source text and a file ID are supplied. Consumers **SHOULD** pass its logger into conversion and collect its records afterward. A global logger **MUST NOT** be used as a conversion-scoped log store.
- **🖥️ Output:** [`format-log-record.ts`](../logger/format-log-record.ts) owns level labels and optional ANSI color for immediate output, test capture, and collection output. Callers choose an output destination, not a new formatter. This path imports neither `node:stream` nor `pino-pretty`.
- **🌐 Browser view:** Pino's browser entrypoint sends records through the same local formatter to the browser console. ANSI color is optional; browser output stays plain. Parsing and rendering **MUST NOT** import Node terminal formatters.
- **🧪 Test capture:** [`create-testing-logger.ts`](../logger/create-testing-logger.ts) uses `CollectingLogger` to capture the same formatted messages through a lightweight destination, without patching `console`.
- **📍 Source context:** Recoverable cases **SHOULD** log at an appropriate level with the source node when available. [`JsonParseError`](../transitive-parser/json-parse-error.ts) logs by default; `logger: false` suppresses a duplicate event when the caller handles it.

Not every warning is fatal or needs a printed code frame. The structured event remains available to consumers that retain source nodes; the text formatter is only a presentation boundary.

## Trade-offs

- **✅ Good:** Parser, renderer, tests, and terminal output share one event interface.
- **⚠️ Cost:** The local formatter is intentionally narrow: it prints the level and message, while richer presentation belongs to a consumer.

## Alternative

- **Direct `console` calls:** Hard to capture and unable to retain structured source metadata.

## Verification

- [ ] OAS3 Core [parser](../transitive-parser/extract-transitive-nodes-from-schema.spec.ts) and [tree](../transitive-parser/active-jsonc-tree/active-jsonc-tree.spec.ts) tests capture fallbacks and warnings through `createTestingLogger`.
- [ ] New layers forward the logger and emit each recoverable fallback once at its owner.

The [diagnostics decision](007-report-parser-errors-with-source-locations.md) defines location formatting independently of log delivery.
