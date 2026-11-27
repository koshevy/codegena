---
name: adr-skill
description: Consult, write, and maintain Codegena architecture decision records and their reading-order indexes before changing architectural contracts.
---

# Codegena ADRs

Use the [upstream ADR skill](https://raw.githubusercontent.com/vercel/ai/6617f11b68273e743a66a271b2b5d91d1e1c6d44/skills/adr-skill/SKILL.md) as the base workflow for decision capture, drafting, review, and lifecycle changes. The conventions below specify how this repository stores and navigates those records. When a task already provides the decision and authorizes the change, use that context instead of repeating the upstream interview or asking for another approval.

## Consult Decisions Before Investigating Code

1. Identify the owning Nx project from the task. Before researching implementation details, read the repository [ADR index](../../../adr/README.md) and the owning project's `adr/README.md`, when present. Scan their conceptual groups and reading order, then read the relevant records in full. Include records from adjacent projects when the contract crosses package boundaries.
2. Use the ADRs to frame code and test exploration. Check their status, decision, limits, implementation paths, and verification criteria. If code and a record disagree, investigate which reflects the current behavior before editing either.
3. After a significant change, update a related decision when it still expresses the same choice; create a new ADR when the choice is new; supersede and cross-link records when a decision is replaced. Routine fixes need no new ADR.

## Locate and Name Records

- Put workspace-wide decisions in `adr/`. Put an Nx project's local decisions in `packages/<project>/adr/` or `apps/<project>/adr/`.
- Name ADR files `<NNN>-<decision-slug>.md`: three-digit, zero-padded numbers such as `001` and `002`, followed by a concise decision phrase. Numbering is local to each ADR directory: foundational decisions come before the downstream decisions that depend on them. It reflects conceptual reading order and precedence, not status or date.
- Keep assigned numbers stable during ordinary additions and lifecycle updates. Append the next number unless an explicit ordering migration is needed. When renumbering or renaming is requested, update every index and every relative cross-reference in the same change.
- Keep `README.md` unnumbered. It is the directory's navigation entry point, not an ADR.

## Maintain a Reader-Focused Index

Use [`packages/oas3-core/adr/README.md`](../../../packages/oas3-core/adr/README.md) as the index model:

1. Open with the scope of the records and explain what their statuses mean.
2. Group decisions by **responsibility or concept**, so a reader can understand the architecture before opening individual files.
3. Provide a numbered **Reading order** with one linked ADR and a short purpose statement per item. Make the sequence useful for learning the system, and keep it aligned with filename numbers.
4. Link decisions owned by another project at the point where they clarify a boundary; do not duplicate those decisions locally.
5. Close with **What the tests established** or equivalent concrete evidence and limits when the index summarizes implemented behavior.

Keep the index concise. An ADR explains a decision and its trade-offs; its index explains where to start and what to read next.

## Write for Human Readers

- **🎯 Lead with the choice:** State the concrete problem and decision first. Keep the rationale and trade-offs; cut repetition and prose that reads like instructions to an agent.
- **🧩 One thesis per bullet:** Keep points short. Split a point with several ideas into indented subpoints. Use headings and whitespace to break dense passages.
- **✨ Emphasize the lead-in:** Bold the short phrase before a colon, especially in a longer thesis: `**🧩 Fixtures:** ...`. Highlight key decisions and consequences, never whole paragraphs.
- **🪧 Mark outcomes:** Give major theses relevant emoji, including labels such as `**✅ Good:**` and `**⚠️ Cost:**`. Use them for navigation, not decoration.
- **✂️ Edit for the reader:** Prefer plain, specific words to slogans or exhaustive checklists. A newcomer should grasp the choice and its cost without opening implementation files. Put operational checks in a brief verification section.
- **📐 Use Markdown deliberately:** Choose short headings, compact lists, links, and a callout for the central decision when they make the record easier to scan.

## State Requirements Precisely

Follow [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) when an ADR states a binding architectural contract. The [repository ADR index](../../../adr/README.md#requirement-language) defines how its uppercase terms apply across these records.

- Use **MUST** or **MUST NOT** for an invariant or prohibition needed to preserve the decision. Use **SHOULD** or **SHOULD NOT** when a justified exception is possible; use **MAY** only for a genuine option.
- Name the owner, condition, and required behavior. Keep rationale, current examples, alternatives, and trade-offs descriptive; do not turn each sentence into a requirement.
- Review ambiguous lowercase `must` and `should` in the Decision section. Clarify whether they state a requirement or merely describe a consequence; do not replace them mechanically.
- Keep requirements consistent with the ADR's status and verified implementation. A proposed record describes the intended contract but does not imply that maintainers have approved it or that unimplemented behavior already exists.

## Draft and Verify

- Follow the neighboring ADRs' front matter and decision sections. State current behavior, alternatives, consequences, non-goals, affected paths, and checkable verification. Describe another package's implementation as evidence without moving ownership of the decision to that package.
- Check all Markdown links after a move, especially sibling ADR links, cross-project links, and references from skills or code comments. Search for each old filename and confirm it has no remaining references.
- Ensure every ADR appears exactly once in its directory's reading order and that the numbers in filenames and index agree. Preserve earlier rationale when updating or superseding a decision.
