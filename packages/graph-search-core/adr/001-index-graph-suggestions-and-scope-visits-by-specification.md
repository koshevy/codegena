---
status: proposed
date: 2026-11-03
decision-makers: Codegena project maintainers
---

# Index graph suggestions and scope visits by specification

## Decision

> [!IMPORTANT]
> **Graph Search Core owns search data and ranking. Graph Search UI owns its
> presentation. The host owns navigation after selection.**

- **🔎 Index:** `GraphPayloadMiniSearch` **MUST** accept a graph and produce
  ordered `GraphSuggestion` results for directories, declarations, files,
  warnings, and source specification text. Its query result **MUST NOT** need
  additional ranking in the UI.
- **📊 Result limits:** A query **MUST** show at most 100 suggestions. When
  several kinds match, the engine **MUST** reserve up to 33 places each for
  declarations, files, and warnings, plus one for the specification, before
  filling remaining places with directories. It **MUST** report omitted
  matches so the UI can suggest refining the query.
- **🔠 Capitalization:** A kind with a title matching the query's capitalization
  **MUST** appear first. A kind matching that capitalization in a code excerpt
  or another indexed field **MUST** precede kinds without a same-case match.
  Matches within a kind **MUST** follow the same order before MiniSearch
  relevance and visits. Suggestions of one kind **MUST** stay together.
- **🧾 Excerpts:** A code result **SHOULD** show a same-case occurrence when one
  exists, so its visible excerpt explains the ranking. Otherwise it shows the
  first case-insensitive occurrence.
- **🕘 Visits:** `VisitHistory` **MUST** record graph node and warning visits
  under a content-derived specification ID. It **SHOULD** persist and sync
  them through IndexedDB when available; in-memory use remains valid elsewhere.
  Browser owners **MUST** start persistence after mounting and dispose it on
  cleanup, so discarded React renders cannot leave subscriptions behind.
- **⚙️ Execution:** The synchronous engine **MUST** work without a worker.
  Hosts **MAY** run the same engine through the PWA virtual HTTP API.
  PWA **MUST** own worker routing and transport. An API failure **MUST NOT**
  prevent local search.
- **🧭 Navigation:** The core **MUST NOT** import React, MUI, or application
  panel state. The optional React hook lives at `./react`; the host handles
  selected suggestions.

## Why

The graph, diagnostics, and source text have several search surfaces. One
framework-neutral index keeps their identity, ranking, and visit history
consistent. Optional background execution keeps large indexing work away from the UI
thread while preserving a simple local path.

## Trade-offs

- **✅ Good:** The same suggestion contract works in Jest, Storybook, and
  Playground. Dexie live queries keep recent visits consistent across tabs.
- **⚠️ Cost:** The host must initialize PWA and register the search API.
  The host also needs to compute a content ID when its specification changes.

## Where to look

- [Feature specification](../FEATURE_SPEC.md)
- [Search engine](../src/lib/graph-payload-mini-search.ts)
- [Visit history](../src/lib/visit-history/visit-history.ts)
- [Virtual HTTP API decision](002-use-pwa-for-background-search.md)
