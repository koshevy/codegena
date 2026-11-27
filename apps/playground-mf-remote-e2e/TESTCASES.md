# Playground remote browser cases

**Status:** 🟢 Implemented · 🟡 Planned · 🔴 Blocked  
**Priority:** 🔴 P0 Critical · 🟡 P1 Important · 🟢 P2 Additional

Run `npm exec -- nx run playground-mf-remote-e2e:e2e`. Cases run headlessly on
desktop Chrome and iPhone 15, with independent browser contexts and no retries.

| Case | Priority | Status | User path and expected result |
| --- | --- | --- | --- |
| 01 | 🔴 P0 | 🟢 Implemented | Open the app, select 1Password, open search, and find ApiRequest. Real conversion succeeds; search responses come from PWA; the page fits its viewport without console diagnostics. |
| 02 | 🔴 P0 | 🟢 Implemented | With the conversion compiler download held to simulate a slow connection, select 1Password. Confirm the pending placeholder, then select Account schema. Cancel that exact unfinished API job and show the replacement specification. |
| 03 | 🔴 P0 | 🟢 Implemented | Open a route whose specUrl points to another origin. Show an error and do not load the foreign specification. |

The landing's [embedded journeys](../../apps/landing-mf-host-e2e/TESTCASES.md)
also check shared appearance during conversion, host navigation, and switching
examples through the menu. Standalone routes retain their example links.
