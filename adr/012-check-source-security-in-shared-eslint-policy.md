---
status: proposed
date: 2026-10-25
decision-makers: Codegena project maintainers
---

# Check source security in the shared ESLint policy

## Why

Security-sensitive mistakes can enter through browser code, shared utilities,
or authentication code. Finding recognizable patterns while editing is cheaper
than discovering them only after a release. A single lint policy also makes
the same check visible in every Nx project that uses the shared configuration.

## Decision

> [!IMPORTANT]
> **JavaScript and TypeScript source MUST use the strict security rule presets
> from the shared Codegena NX Plugin ESLint configuration, excluding specs,
> fixtures, mocks, and build or test-runner configuration files. Enabled
> security rules MUST report errors.**

- **🛡️ Three scopes:** The [security rule group](../packages/infr-nx/eslint-config/rule-sets/security-rules.mjs)
  combines the strict presets from
  [browser-security](https://www.npmjs.com/package/eslint-plugin-browser-security),
  [secure-coding](https://www.npmjs.com/package/eslint-plugin-secure-coding),
  and [jwt-security](https://www.npmjs.com/package/eslint-plugin-jwt-security).
  They cover browser APIs, general secure coding patterns, and JWT handling.
- **🧭 One owner:** The [shared root config](../packages/infr-nx/eslint-config/root.config.mjs)
  applies the group to JavaScript and TypeScript files. Projects **MUST NOT**
  copy these presets into local ESLint configs to obtain the baseline.
- **🧪 Source scope:** The security group skips `*.spec.*`, `*.fixture.*`, and
  `*.mock.*` files, plus files inside `__examples__`, `fixtures`,
  `__fixtures__`, `mocks`, or `__mocks__` directories. It also skips Rollup,
  SWC, Webpack, Vite, Rspack, Rsbuild, and Jest configuration files and their
  dedicated tooling directories, including config factories and Jest presets.
  The shared `eslint-config` directory is skipped as well. Other lint rules
  still apply to these files.
- **🔑 Literal property keys:** `secure-coding/detect-object-injection` uses
  `allowLiterals: true`. Literal bracket keys remain allowed; dynamic keys
  remain checked at error severity.
- **🔎 Review findings:** A security diagnostic is a prompt to inspect the
  affected behavior. It **MUST NOT** be silenced merely to make lint pass;
  exceptional suppressions follow the approval rule in
  [CODE_STYLE.md](../CODE_STYLE.md#rule-75).
- **🧪 Schema patterns:** OAS3 Core checks schema-supplied regular expressions with
  [recheck](https://www.npmjs.com/package/recheck) before compiling them.
  Only a `safe` result is accepted; vulnerable or inconclusive patterns use
  the existing fallback. The dynamic constructor has an approved, single-rule
  exception because the lint rule cannot follow that runtime check.
- **⚖️ Resolve rule conflicts:** Simplifying a validation condition can
  remove a necessary guard. When a style rule recommends code that weakens a
  security check, the security rule **MUST** take precedence. Keep the safer
  condition and remove or revise the conflicting style rule in the shared
  config. For example, [`typeof value === 'object'`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
  also accepts `null` and arrays; a plain-object guard still needs explicit
  checks for those values. The shared config therefore excludes
  `unicorn/prefer-simplified-conditions`.

## Limits and trade-offs

- **✅ Early feedback:** The same checks run in editor linting and Nx lint
  targets, close to the change that introduced a risky pattern.
- **⚠️ Findings need judgment:** Static rules can report false positives and
  cannot prove that code is secure. Tests, review, and runtime controls remain
  necessary.
- **⚠️ Runtime cost:** OAS3 Core's synchronous conversion requires a synchronous
  pattern check, bounded by a timeout. Complex patterns can still consume
  conversion time or fall back when analysis is inconclusive.
- **⚠️ Adoption exposes existing code:** Initial lint failures show the
  migration work. This decision does not classify or fix those findings; they
  should be reviewed separately rather than hidden by lowering severity.

## Verification

- [ ] A representative JavaScript and TypeScript file resolves rules from all
  three plugins at error severity.
- [ ] Nx lint reports existing violations without changing application code.
