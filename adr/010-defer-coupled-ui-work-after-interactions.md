---
status: proposed
date: 2026-10-18
decision-makers: Codegena project maintainers
---

# Defer coupled UI work after interactions

## Why

A click in the Playground can update several mounted views at once. Selecting a
file may change the tree, graph, source editor, and generated-file list. When
all of their handlers and state updates run in the original event task, the
control can feel stuck before it responds.

## Decision

> [!IMPORTANT]
> **Keep the immediate interaction small.** When a button, menu, or list action
> demonstrably jams because it triggers substantial synchronous work in other
> components, the owning feature **SHOULD** defer that downstream work with
> `setTimeout(..., 0)` so the originating event can finish.

- **🖱️ Handle the event now:** Read the selected item and modifier keys, prevent
  default behavior when needed, and close a menu or update the pressed control
  synchronously. The callback **MUST** receive captured values, not retain
  the event object for later use.
- **⏱️ Defer the coupled updates:** Schedule the cross-view selection, reveal,
  navigation, or theme work at the owning feature boundary. One deliberate
  deferral is easier to follow than timers scattered through child controls.
- **🎯 Apply it selectively:** Use this pattern where an interaction fans out
  into several synchronous handlers or a browser regression demonstrates
  jamming. A simple local button action stays synchronous. Do not defer an
  operation that must complete in the original event task.
- **🧪 Preserve the outcome:** Keep the resulting selection, focus, scroll
  target, and ordering correct. Add a browser test for a timing bug, including
  rapid or distant-item interactions when those expose it.

A zero-delay timer starts a later **task**, giving the browser an opportunity
to process the original interaction first. A Promise callback or microtask
does not provide the same task boundary. The browser is **not guaranteed** to
paint between tasks, and the deferred callback can still block the main
thread. Reduce or split genuinely expensive work instead of adding more
timers. See [Google's explanation of task yielding](https://web.dev/articles/optimize-long-tasks)
and [MDN's event-loop guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide).

## Trade-offs

- **✅ Good:** The originating control finishes its event handling before
  related views perform their updates. The scheduling point remains visible
  at the owner of the interaction.
- **⚠️ Cost:** The update is asynchronous. Other events may arrive first, so
  the owner must keep selection order and stale callbacks in mind.
- **⚠️ Limit:** Deferral does not fix an inefficient render, a feedback loop,
  or a long-running callback. Profile and simplify those causes directly.

## Alternatives

- **Run every update synchronously:** Appropriate for small local actions, but
  can make a coupled interaction unresponsive.
- **Defer every handler:** Adds latency and ordering hazards without helping
  simple actions.
- **Use a microtask:** Runs before the browser gets the same opportunity to
  handle another task or update rendering.

## Where to look

- [Playground navigation](../packages/playground-ui/navigation/use-playground-navigation.ts)
  defers the state changes following a selection across views.
- [Theme menu choices](../packages/ui-unified/menus/theme-mode-menu/use-context-menu-items.tsx)
  defer the theme update after the menu action.
- The [Playground E2E workflows](../apps/playground-ui-e2e/e2e/) cover
  cross-view selection and scroll behavior. The
  [composed-UI testing decision](008-test-composed-ui-through-storybook-and-playwright.md)
  explains why these journeys need browser coverage.

## Verification

- [ ] A coupled action remains responsive and reaches the intended visible
  state in the related browser workflow.
- [ ] Event-only requirements, such as modifier keys and `preventDefault`,
  are handled before deferral.
- [ ] A deferred callback does not replay stale work after a newer action.
