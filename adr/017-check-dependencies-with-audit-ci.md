---
status: proposed
date: 2026-11-15
decision-makers: Codegena project maintainers
---

# Check dependencies with Codegena Audit CI

## Why

Source linting does not check the vulnerabilities of installed packages.
`npm audit` does, but an unpatchable finding can leave every run failing with
no record of why a dependency remains in use. Broad severity exclusions would
also hide unrelated findings.

[`@codegena/audit-ci`](../packages/audit-ci/README.md) runs npm's audit and applies
explicit, expiring exceptions. It keeps their reasons visible and fails on
unhandled findings. Its MJS CLI runs without a build or runtime dependencies.

## Decision

> [!IMPORTANT]
> **After every feature, the repository dependency audit MUST exit with code 0.
> New vulnerable packages or versions MUST NOT be introduced. Exceptions are
> limited to existing dependencies with no patched release, for at most 14 days.**

The [Security rules](../CODE_STYLE.md#security) define the contribution policy.
They complement the [source-security decision](012-check-source-security-in-shared-eslint-policy.md)
and the [dependency ownership decision](016-declare-dependencies-in-consuming-projects.md).

## Run the check

From the repository root, after installing the locked workspace dependencies:

```bash
npm exec -- @codegena/audit-ci
```

- **✅ Success:** The scan completes with no unhandled findings. This can mean
  no advisories were reported, or that every reported advisory has an active,
  permitted exception. All severities and development dependencies remain in
  scope.
- **⛔ Failure:** Unhandled findings, invalid configuration, audit errors, and
  timeouts produce a nonzero exit. A failed scan is not a clean result.
- **🔎 Review additions:** Compare changed manifests and resolved lockfile
  versions with current advisories. A pull request introducing a vulnerable
  package or version **MUST** be rejected even if an existing exception makes
  the command pass.

## Fix findings first

1. **📦 Direct dependency:** Update its consuming manifest and any shared root
   provider. Keep the lockfile synchronized.
2. **🔧 Transitive dependency:** If the parent cannot yet select the patch,
   use a narrow root override after checking caller compatibility.
3. **👤 Disruptive changes:** Prefer compatible patched releases. An AI
   assistant **MUST** obtain human approval before changing `nx`, any `@nx/*`
   dependency, or making a breaking dependency update.
4. **🧪 Verification:** Run the affected Nx checks and the audit again. Do not
   treat an automatic force upgrade or an unverified downgrade as a fix.

## Temporary exceptions

Only an **already-used package and version with no patched release** qualifies.
Record the exception in root
[`.vulnerabilities-ignore.json`](../.vulnerabilities-ignore.json).

- **🎯 Identify:** Prefer its specific GHSA ID. A CWE entry covers a whole
  weakness category and **MUST NOT** hide unrelated findings.
- **📝 Explain:** `description` **MUST** include the review date, why the
  package remains necessary, the absence of a patch, relevant exposure or
  mitigation, and an upstream link.
- **📅 Expire:** `expires` **MUST** be no later than 14 days after the decision
  or explicit renewal review. `YYYY-MM-DD` means the start of that day in UTC.
- **🔁 Revisit:** Recheck upstream releases before any renewal. Once a patch
  exists, the exception **MUST NOT** be extended; apply the fix and remove it.
  An inconvenient breaking patch still counts as an available patch.

An exception records a **time-limited acceptance of risk**, not a security fix.
Its `description` records the affected package and version, review facts, and
reason; `expires` sets the deadline for the identified advisory. This ADR
defines why exceptions are allowed and how they are reviewed. The JSON file
holds the active exception list.

**Illustrative record for the `ghsa` array:** The package and advisory below
are fictional. A review on April 10, 2030 permits expiry by April 24. Replace
the example values with the facts and dates from your review.

```json
{
  "id": "GHSA-xxxx-yyyy-zzzz",
  "expires": "2030-04-24",
  "description": "Reviewed 2030-04-10: example-build-tool 1.2.3 is required by builds; no patch exists. Trusted configuration only. https://github.com/advisories/GHSA-xxxx-yyyy-zzzz"
}
```

See the [package README](../packages/audit-ci/README.md#temporary-exceptions)
for the complete configuration format.

## What the tool does and does not enforce

- **✅ Enforced by the CLI:** Expired exceptions stop matching. Unhandled
  advisories and unsuccessful scans fail. Ignored findings retain their
  explanations in the output.
- **👤 Enforced by review:** The CLI does not compare a pull request with its
  base, query patched releases for exception eligibility, require explanations,
  or impose this repository's 14-day limit. Reviewers **MUST** check those
  conditions; the JSON Schema alone does not prove policy compliance.
- **⚠️ Advisory scope:** A GHSA exception matches the advisory, not a frozen
  package/version pair. It **MUST NOT** authorize another affected version or
  a newly added vulnerable dependency.
- **⚠️ Coverage:** SCA depends on published advisories and the installed tree.
  A successful run does not prove the absence of unknown vulnerabilities.

## Alternatives and consequences

- **Raw npm audit alone:** Reports vulnerabilities but cannot record narrowly
  accepted, expiring exceptions with their reasons.
- **Severity cutoffs or broad ignores:** Could hide new, unrelated findings.
- **✅ Consistency:** Humans and AI use the same command and policy.
- **⚠️ Maintenance:** Unpatchable dependencies need review within two weeks.
  Network or registry failures block completion until the scan succeeds.

## Verification criteria

Use local audit-report fixtures to check the CLI independently of which
advisories happen to affect the installed dependency tree:

- **Unhandled advisory:** A report containing an advisory with no matching
  active exception produces a nonzero exit code.
- **Accepted advisory:** A report whose findings all have matching active
  exceptions produces exit code 0 and prints the reasons. Accepting a finding
  does not remove it from the underlying npm audit report.
- **Expired exception:** The same unresolved advisory produces a nonzero exit
  code after its exception expires.
- **Unsuccessful scan:** Invalid reports and npm execution failures produce a
  nonzero exit code, even when exceptions are configured.

For each dependency change, also review the manifest and lockfile diff for new
vulnerable packages or versions. Check each exception's eligibility, explanation,
and expiry against the policy. A successful CLI run does not replace that review.
