# Contributing to Codegena

> [!IMPORTANT]
> **Read [CODE_STYLE.md](CODE_STYLE.md) before making any contribution.** It is
> the required guide to this repository's code structure, TypeScript and React
> conventions, testing, and verification. It applies to human contributors and
> AI assistants alike.

Start with the [README](README.md) to find the project that owns your change.
Read the [repository ADR index](adr/README.md) and the owning project's ADR
index for decisions behind its conventions.

For AI-assisted changes, [AGENTS.md](AGENTS.md) identifies the required skills
and workspace workflow. Project-specific guidance is available in
[OAS3 Core's SKILLS.md](packages/oas3-core/SKILLS.md) and
[OAS3 Visitor TypeScript's SKILLS.md](packages/oas3-visitor-typescript/SKILLS.md).

## Work locally

Use the Node.js and npm versions declared in [package.json](package.json).
The lockfile requires npm 12 because it records narrow peer-dependency repairs
for ESLint 10 plugins. Install locked dependencies with `npm ci`, then inspect
the project's resolved Nx targets before running the checks relevant to your
change:

```bash
npm exec -- nx show project <project-name> --json
npm exec -- nx run <project-name>:<target>
```

Not every project has the same targets. The [code style guide's verification
section](CODE_STYLE.md#verification-and-sources) describes the review and
testing expectations, including related E2E projects and test-case catalogs.

After implementing a feature, run the repository's dependency audit too:

```bash
npm exec -- @codegena/audit-ci
```

The command must exit with code 0. Follow the
[Security rules](CODE_STYLE.md#security) for patched updates, human approval of
Nx or breaking changes, and temporary exceptions when no patched release exists.
