---
status: proposed
date: 2026-10-13
decision-makers: Codegena project maintainers
---

# Compose the playground from three resizable regions

## Why

The source schema, generated graph/tree, and file details all need screen space. A details drawer and fixed columns limited inspection. Yet reopening a panel after every selection would undo a user's deliberate choice.

## Decision

> [!IMPORTANT]
> **Use three resizable regions. Ordinary selection reveals hidden panels only once; explicit navigation can reveal them again.**

- **📐 Layout:** One `react-resizable-panels` group contains `source`, `generated`, and `details`. The generated region always remains visible and starts in graph mode. Source and details collapse; each open region has a 10% minimum width. Details starts closed without saved preferences.
- **🧭 Visibility ownership:** Playground layout and navigation hooks **MUST** own widths and visibility.
  - First generated-item selection reveals source and details once.
  - Later selection **MUST** respect manual closure; a restored layout already counts as a choice.
  - Source or warning navigation may explicitly reopen a needed region.
- **🔎 View stability:** Keep graph content at its screen position when the source region moves.
  - Adjust horizontal pan by the opposite canvas offset; preserve vertical pan and zoom.
  - Use the reusable themed, auto-hiding scroll area for tree and details while retaining their existing viewport elements.
  - Monaco and React Flow keep their own scrolling.
  - Custom tracks have a translucent border; square handles and interaction colors follow the same theme tokens as Monaco.
- **💾 Preferences:** One versioned `localStorage` record keeps completed layout, last nonzero source/details widths, Graph/List choice, Show selected/Show all choice, list sorting, and Light/Dark/System appearance.
  - Saved preferences **MUST** be validated before first client render; absent, invalid, or unavailable storage **MUST** fall back to defaults.
  - New sessions sort files alphabetically and follow the system appearance setting unless the host supplies an initial appearance. Existing records without an appearance choice use that initial appearance.
  - `persistenceKey` isolates instances; `null` disables storage.
  - A collapsed panel reopens at its last nonzero width.

This decision does not choose graph positions, change the generated-file model, or define narrow-screen breakpoints.

## Trade-offs

- **✅ Good:** All three concerns can be inspected without an overlay; manual panel choices remain stable.
- **⚠️ Cost:** Layout, navigation, and storage need separate owners. Resize, collapse, and restore behavior require browser review.

## Alternatives

- **Fixed columns or details drawer:** Simpler, but hard to adapt to long source and output.
- **Reveal on every selection:** Makes each target visible but overrides manual closure.
- **Store widths only or store each control separately:** Loses collapsed reopen size or makes restoration inconsistent.

## Where to look

- **Composition:** [`Playground`](../playground/playground.tsx) owns the three regions.
- **State:** [Layout](../playground/use-playground-panel-layout.ts), [preferences](../preferences/use-playground-preferences.ts), [storage](../preferences/playground-preferences-storage.ts), and [navigation](../navigation/use-playground-navigation.ts) have distinct owners.
- **Scrolling:** The [themed scroll area](../../ui-unified/scrolling/themed-scroll-area/) keeps application surfaces consistent.

## Verification

- [ ] [Playground stories](../playground/playground.stories.tsx) cover opening, resizing, first selection, manual closure, explicit reveal, and stable graph zoom.
- [ ] Reload restores widths, visibility, and toolbar choices; invalid storage falls back safely and `persistenceKey={null}` avoids storage.
- [ ] Related Playground Nx and browser checks pass after layout changes.
