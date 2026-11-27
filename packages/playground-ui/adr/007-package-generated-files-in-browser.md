---
status: proposed
date: 2026-10-19
decision-makers: Codegena project maintainers
---

# Package generated files in the browser

## Decision

> [!IMPORTANT]
> **The Playground builds a ZIP from every generated file in `GraphPayload`, regardless of the details panel's selected/all view.**

- **📦 Archive:** [`download-files`](../download-files/) **MUST** package every group node's filename and complete text with `fflate`, regardless of selection. The source schema filename determines the ZIP filename.
- **⏳ First click:** The header button stays pending for at least three seconds while the archive is prepared. A success notification offers a **Download zip-file** action.
- **⚡ Repeat click:** The feature caches the ready data URL for the current graph. Another button click **MUST** download immediately without repeating the pending period. The notification keeps its visible message as text and places only the data URL in its transport fallback.
- **🧭 Ownership:** The file-details feature owns preparation and notification state. The button only renders the action and pending state; archive creation stays in `download-files`.

## Trade-offs

- **✅ Good:** Export covers hidden and unselected files without a server or separate data source. The button and notification action use the same finished archive.
- **⚠️ Cost:** A data URL holds the ZIP in memory while the graph remains mounted. Large outputs may need a streamed or server-backed export later.

## Verification

The [generated-file details E2E cases](../../../apps/playground-ui-e2e/e2e/json-schema/generated-file-details.spec.ts) check the pending period, all-file contents, notification action, filename, and cached repeat download.
