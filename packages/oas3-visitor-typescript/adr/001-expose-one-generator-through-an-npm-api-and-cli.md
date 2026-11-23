---
status: proposed
date: 2026-10-14
decision-makers: Codegena project maintainers
---

# Expose one generator through an npm API and a CLI

## Why

Programs and command-line users need the same JSON Schema-to-TypeScript conversion. Separate engines could disagree on naming, imports, comments, or file modes.

## Decision

> [!IMPORTANT]
> **The npm API MUST own conversion. The CLI MUST call it and write its result groups rather than implement a second conversion pipeline.**

- **🧩 Public conversion:** [`jsonSchemaToTypescript`](../src/json-schema-to-typescript.ts) takes OAS3 Core extraction inputs, required `singleFile` or `separateFiles` mode, optional root name, and visitor options. It uses `UltimateParser` with `TypescriptParserVisitor` and returns groups with filenames, declarations, AST, and renderers, not just text.
- **📦 Package API:** [`src/index.ts`](../src/index.ts) exports the function, props type, and version. The [`oas3-visitor-typescript` binary](../package.json) uses a separate [`cli/index.ts`](../cli/index.ts) entrypoint.
- **🎨 Shared greeting:** The small [`greeting` entrypoint](../greeting/index.ts)
  exports the CLI's `createGreeting` for browser illustrations without loading
  the conversion API or the executable entrypoint.
- **⌨️ CLI adapter:** [`runCli`](../cli/run-cli.ts) handles Yargs setup and help.
  The [`convert` command](../cli/commands/convert.ts) calls
  [`convertSchema`](../cli/convert-schema.ts), which uses the shared API.
- **📁 Output files:** The [output-file helpers](../cli/output-files/index.ts)
  **MUST** validate every path before creating directories, then write files in bounded
  batches. The command measures elapsed time and prints the completion summary.
- **🛣️ Same modes:** Both surfaces support single and separate files. The API can accept text with a source ID; the CLI `convert` command accepts a schema path and output directory. `analyze` remains a placeholder, not another pipeline.
- **🌐 Browser input:** The API **MUST** accept already loaded text with a source ID. For path input, it passes an optional file-reading adapter to OAS3 Core's `ActiveJsoncTree`. The default adapter reads files in Node.js 22+; browser callers can supply their own synchronous adapter.

The CLI-specific [Rollup wrapper](../rollup/bundle-cli-dependencies.cjs) is a packaging exception, not a second conversion owner. OpenAPI document conversion uses the same public generator; this decision does not specify its visitor-level representation.

## Trade-offs

- **✅ Good:** Integrations and CLI output share semantics and group metadata.
- **⚠️ Cost:** The CLI owns filesystem work, and group filename changes affect both callers and command output.

## Alternative

- **CLI-only renderer or text-only API:** Duplicates policy or discards declaration relationships.

## Verification

- [ ] [API tests](../src/json-schema-to-typescript.spec.ts), [built CLI tests](../cli/index.spec.ts), and [file-writing tests](../cli/convert-schema.spec.ts) agree on output and relative imports.
- [ ] Entry-point changes pass OAS3 Visitor TypeScript Nx test, lint, and build checks.

The [declaration-group decision](../../../adr/003-represent-output-as-declaration-groups.md) explains the shared return value.
