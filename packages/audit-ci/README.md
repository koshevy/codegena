# Codegena audit CI

A zero-dependency npm audit CLI with temporary CWE and GitHub advisory exceptions.
It runs directly from MJS source: no TypeScript, compilation, or bundler is needed.

## Run in this repository

From the repository root:

```sh
npm exec -- @codegena/audit-ci
```

Create `.vulnerabilities-ignore.json` in the directory being audited:

```json
{
  "$schema": "node_modules/@codegena/audit-ci/vulnerabilities-ignore-schema.json",
  "cwe": [],
  "ghsa": []
}
```

An empty configuration keeps every advisory active. The library does not add
exceptions to this repository or change npm's audit report.

## Install and use elsewhere

```sh
npm install --save-dev @codegena/audit-ci
npm exec -- audit-ci
```

The package publishes its MJS sources, declarations, executable, and JSON Schema.
It has no runtime dependencies and no build step.

## Temporary exceptions

Each exception requires an expiration date. Add an explanation for the decision.

**Illustrative example:** Suppose an existing build dependency has no patched
release and is reviewed on April 10, 2030. An expiry of April 24 is 14 days later.
The advisory ID and package below are fictional. Replace them, the dates, and
the reason with the facts established during your review:

```json
{
  "cwe": [],
  "ghsa": [
    {
      "id": "GHSA-xxxx-yyyy-zzzz",
      "expires": "2030-04-24",
      "description": "Reviewed 2030-04-10: example-build-tool 1.2.3 is required by builds; no patch exists. Trusted configuration only. https://github.com/advisories/GHSA-xxxx-yyyy-zzzz"
    }
  ]
}
```

- **GHSA:** Supply an advisory `id` or its exact
  `https://github.com/advisories/GHSA-…` URL, never both.
- **CWE:** Supply an `id` such as `CWE-1321`. A finding is ignored through CWE
  rules only when every related CWE has an active exception.
- **Expiry:** Expired exceptions no longer ignore findings. Dates are interpreted
  by JavaScript's `Date`; use `YYYY-MM-DD` for midnight UTC.
- **Visibility:** Ignored findings remain in the command output with their reasons.
- **Exit status:** Unhandled findings, invalid configuration, audit failures, and
  timeouts produce a nonzero exit. Only a completed, fully handled audit succeeds.

npm can report several affected packages for one advisory. The CLI evaluates
the underlying advisory records, so its advisory count can differ from npm's
affected-package total.

Choose dates at review time; do not reuse the example's dates. In this repository, the
[Security rules](../../CODE_STYLE.md#security) allow exceptions only for existing
unpatchable dependencies, with an explanation and at most 14 days until expiry.
The [audit decision](../../adr/017-check-dependencies-with-audit-ci.md) explains
why this check is required and what still needs review beyond its exit status.

## JavaScript API

```js
import { run } from '@codegena/audit-ci';

await run({ cwd: process.cwd(), timeout: 120000 });
```

## Checks and publishing

```sh
npm exec -- nx run @codegena/audit-ci:lint
npm exec -- nx run @codegena/audit-ci:test
npm pack --workspace @codegena/audit-ci --dry-run
```

Tests use Node's built-in test runner and local audit fixtures, without a registry
connection. Development tooling follows the workspace's versions.
