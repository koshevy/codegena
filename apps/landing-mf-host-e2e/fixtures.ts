import { expect, test as base } from '@playwright/test';

export const test = base.extend<{ hasAcknowledgedConstructionNotice: boolean }>({
  hasAcknowledgedConstructionNotice: [true, { option: true }],
  context: async ({ context, hasAcknowledgedConstructionNotice }, runWithContext) => {
    if (hasAcknowledgedConstructionNotice) {
      await context.addInitScript(() => {
        sessionStorage.setItem('codegena:under-construction', 'acknowledged');
      });
    }

    await runWithContext(context);
  },
});

export { expect };
