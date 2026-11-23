# OAS3 Visitor TypeScript Development Skills

Use these workflows for changes in `packages/oas3-visitor-typescript`. Before starting, load
the repository-level
[`relevant-changes`](../../.agents/skills/relevant-changes/SKILL.md) skill and
follow its project-specific code, test, fixture, lint, and TypeScript guidance.

## `create-new-typescript-visitor-fn`

Use this workflow when a transitive node needs a TypeScript declaration that no
existing visitor produces.

1. Identify the JSON Schema type or combination of schema keywords that should
   produce the target TypeScript declaration. Check for a corresponding
   `SchemaConvertorAbstract` implementation in
   `packages/oas3-core/transitive-parser/schema-convertors`.
2. If the required transitive node or its convertor is missing, complete the
   [`add-schema-convertor`](../oas3-core/SKILLS.md#add-schema-convertor) workflow
   before adding the visitor.
3. Add the visitor function in an appropriately named subdirectory of
   `packages/oas3-visitor-typescript/src/visitors`. Study comparable visitors first, including
   how they split AST construction into helpers and how they use visitor
   context, so the new implementation follows the local decomposition and
   registration conventions.
4. Add the visitor's specification file, needed fixtures, and focused test
   cases. Review nearby visitor specifications for their fixture-loading
   helpers. Review `packages/oas3-visitor-typescript/src/visitors/__mocks__` and create a
   focused mock there when the visitor needs one. Cover the strongest supported
   cases and meaningful unsupported or fallback cases.
5. Add the visitor to the ordered visitor list in
   `packages/oas3-visitor-typescript/src/typescript-parser-visitor.ts`. Place it before any
   broader visitor that could otherwise consume the same transitive node.

## `maintain-use-cases-table`

Use this workflow for changes to OAS3 Visitor TypeScript code, tests, or fixtures, including
changes in `packages/oas3-core` that alter generated OAS3 Visitor TypeScript declarations. Keep
[USECASES.md](USECASES.md) synchronized with the behavior and its unit tests in
the same change.

1. Read the table's guide and find the affected cases by visitor, schema
   keywords, fixture, and option profile. Confirm the current behavior in the
   implementation and the linked test assertions; a fixture alone does not
   establish coverage.
2. Add or update a focused unit test for each changed behavior. Reuse a nearby
   fixture where it expresses the case clearly, or add a relevant local fixture.
   Assert the complete generated declaration, and check diagnostics or the
   complete type listing when they are part of the behavior. Place a test that
   covers the full renderer at the library level under the owner-and-concern
   naming convention in `relevant-changes`; keep visitor-specific tests beside
   their visitor.
3. Update the matching table row after updating the test. Merge fixtures and
   tests into one row when they demonstrate the same behavior or invariant,
   even if their schema domains differ. Add a row only for a distinct case;
   place it under the appropriate topology section and give it a unique case
   ID that names the behavior, never the fixture or domain. For a refactor
   with unchanged output, update the existing row to identify the regression
   test rather than adding a duplicate case.
4. Keep every column grounded in the current code and test: the JSON Pointer
   must locate the case in its linked fixture; the primary visitor must link to
   its implementation; keywords, topology, options, expected declaration,
   semantic invariant, expected log, test level, fixture, and testing file must
   describe the same scenario. Label pointers by fixture when a row has several
   inputs at different locations. Link to project-local fixtures and test files.
5. Set coverage status from assertions, not from fixture presence or comments:
   use `covered` for a direct assertion, `partial` for an incompletely asserted
   case, `gap` for no direct assertion, and `investigate` for unresolved
   behavior. Do not claim coverage that the linked tests cannot demonstrate.
6. Check that case IDs remain unique, all Markdown links resolve, and every
   table row retains the existing columns. Run the relevant Nx tests and other
   checks required by `relevant-changes` before finishing.
