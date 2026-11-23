# Playground UI end-to-end tests

Run `npm exec -- nx e2e playground-ui-e2e` from the repository root. Playwright starts the `@codegena/playground-ui:storybook-e2e` target on port 6006, waits for Storybook, and then runs the browser tests. Set `BASE_URL` to test an already running Storybook instance instead.

Each run saves a screenshot and video under `dist/.playwright/apps/playground-ui-e2e/test-output/`. The HTML report is at `dist/.playwright/apps/playground-ui-e2e/playwright-report/index.html`.

Tests are organized by the source behind the story's graph: [JSON Schema](e2e/json-schema/) and [OAS3](e2e/oas3/). Within each directory, specs follow user workflows. Browser helpers used only by JSON Schema tests live beside those specs.

See [TESTCASES.md](TESTCASES.md) for implemented coverage, priorities, and planned cases. The [local ADR index](adr/README.md) explains case ownership and tracking.
