---
status: proposed
date: 2026-11-01
decision-makers: Codegena project maintainers
---

# Seed generated Storybook data

## Why

Some UI states need realistic, varied text. Repeating one sentence obscures how
wrapping and scrolling behave. Unseeded random text changes between reloads,
making visual comparison and browser failures harder to reproduce.

## Decision

> [!IMPORTANT]
> **Stories that generate text with Faker MUST seed a local Faker instance before
> creating their args or fixtures.**

- **📝 Readable examples:** Use a sentence or product-description generator
  suited to the component. Generate enough text to exercise the state without
  filling the story with repeated filler.
- **🎲 Stable output:** Choose a fixed seed in the story file. Story rendering
  **MUST NOT** generate new random values on each React render.
- **🧩 Local ownership:** Faker is a development dependency of the library that
  owns the story. Production components receive plain values and remain
  independent of Faker.

```tsx
function createStoryFaker(): Faker {
  const storyFaker = new Faker({ locale: [en] });

  storyFaker.seed(441);

  return storyFaker;
}

const faker = createStoryFaker();

export const LongMessage = {
  args: {
    message: Array.from({ length: 8 }, () => (
      faker.commerce.productDescription()
    )).join('\n\n'),
  },
};
```

## Trade-offs

- **✅ Good:** Stories show realistic overflow and produce the same content on
  every reload.
- **⚠️ Cost:** The story package needs a development-only Faker dependency and
  an explicit seed. Changing the seed intentionally updates the example.

## Where to look

The [severity card story](../packages/ui-unified/feedback/severity-card/severity-card.stories.tsx)
exercises long-message scrolling. The [notification card stories](../packages/notification-ui-notistack/src/lib/notification-card/notification-card.stories.tsx)
also seed Faker before creating message args.

## Verification

- [ ] The affected Storybook target builds.
- [ ] Reopening a story produces the same generated content.
