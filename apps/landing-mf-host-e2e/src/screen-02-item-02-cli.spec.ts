import { expect, type Page, test } from '@playwright/test';

import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
} from './landing-journey';

async function scrollCliToProgress(page: Page, progressPercent: number): Promise<void> {
  await scrollSecondScreenTo(page, (4 + 4 * progressPercent / 100) / 17);
}

test('02.02 — CLI story shows an animated command and its diagnostics', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  await scrollCliToProgress(page, 99);
  await waitForPlaygroundIllustration(page);

  const terminal = playground.getByRole('region', {
    name: 'CLI terminal illustration',
  });

  await expect(playground.getByText('02 / CLI')).toBeVisible();
  await expect(playground.getByRole('heading', {
    name: 'One CLI for humans and AI',
  })).toBeVisible();
  await expect(terminal).toBeVisible();
  await expect(terminal).toContainText('mira@atelier-7 codegena %');
  await expect(terminal).toContainText('npx oas3ts convert', {
    timeout: 10_000,
  });
  await expect(terminal).toContainText('Welcome to');
  await expect(terminal).toContainText('Unable to correctly parse object');
  await expect(terminal).toContainText('Used Record<string, unknown> as a fallback.');
  await expect(terminal).toContainText('Generated 69 TypeScript file(s) in 0.24s.');
  await expect(terminal).toContainText('This is an artistic terminal preview,');
  await expect(terminal).toContainText('run the CLI in your terminal,');

  await scrollSecondScreenTo(page, 2 / 17);
  await expect(playground.getByText('01 / JSON SCHEMA')).toBeVisible();
  await expect(terminal).toBeHidden();

  await scrollCliToProgress(page, 99);
  await expect(playground.getByText('02 / CLI')).toBeVisible();
  await expect(playground.getByText('01 / JSON SCHEMA')).toBeHidden();
  await expect(terminal).toBeVisible();

  await expect(terminal).toContainText('Generated 69 TypeScript file(s) in 0.24s.');

  await playground.getByRole('heading', {
    name: 'One CLI for humans and AI',
  }).click();

  await expect(page).toHaveScreenshot('02-02-cli-terminal.png');
  expectNoDiagnostics();
});

test('02.02 — scrolling controls terminal playback', async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.clock.install();
  await page.goto('/?testingMode=true');

  const terminal = page.getByRole('region', {
    name: 'CLI terminal illustration',
  });

  await scrollCliToProgress(page, 20);
  await expect(terminal).toContainText('npx oas3ts');
  await expect(terminal).not.toContainText('Welcome to');

  const pausedOutput = await terminal.textContent();

  // Advancing time without scrolling must leave the terminal unchanged.
  await page.clock.fastForward(300);
  await expect(terminal).toHaveText(pausedOutput ?? '');
  await page.clock.resume();

  await scrollCliToProgress(page, 60);
  await expect(terminal).toContainText('Welcome to');
  await expect(terminal).not.toContainText('WARN');

  await scrollCliToProgress(page, 85);
  await expect(terminal).toContainText('Unable to correctly parse object');
  await expect(terminal).not.toContainText('Generated 69 TypeScript file(s)');

  await scrollCliToProgress(page, 99);
  await expect(terminal).toContainText('Generated 69 TypeScript file(s)');

  await scrollCliToProgress(page, 60);
  await expect(terminal).not.toContainText('Unable to correctly parse object');
  expectNoDiagnostics();
});

test('02.02 — touchpad scroll advances the terminal playback', {
  tag: '@desktop-touchpad',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  await scrollCliToProgress(page, 20);

  const output = playground.getByRole('region', {
    name: 'Simulated CLI output',
  });

  await output.hover();

  const pageScrollBeforePlaybackWheel = await page.evaluate(() => window.scrollY);

  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(pageScrollBeforePlaybackWheel);
  expectNoDiagnostics();
});

test('02.02 — touchpad scroll stays inside the terminal', {
  tag: '@desktop-touchpad',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  await scrollCliToProgress(page, 99);

  const output = playground.getByRole('region', {
    name: 'Simulated CLI output',
  });

  await expect(output).toContainText('Generated 69 TypeScript file(s) in 0.24s.', {
    timeout: 15_000,
  });
  await output.click();
  await page.keyboard.press('Home');
  await expect(output.getByText('Welcome to')).toBeInViewport();

  const pageScrollBeforeWheel = await page.evaluate(() => window.scrollY);

  await page.mouse.wheel(0, 200);
  await expect.poll(() => output.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBeforeWheel);
  expectNoDiagnostics();
});

test('02.02 — mobile terminal peel opens its drawer', {
  tag: '@mobile-peel',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  const terminal = playground.getByRole('region', {
    name: 'CLI terminal illustration',
  });
  const drawer = page.getByRole('dialog', { name: 'CLI terminal output' });
  const output = drawer.getByRole('region', { name: 'Simulated CLI output' });

  await scrollCliToProgress(page, 20);
  await terminal.getByRole('button', { name: 'Expand CLI terminal' }).click();
  await expect(drawer).toBeVisible();
  await expect(output).not.toContainText('Welcome to');

  await drawer.getByRole('button', { name: 'Collapse CLI terminal' }).click();
  await expect(drawer).toBeHidden();

  await scrollCliToProgress(page, 99);

  await terminal.getByRole('region', { name: 'Simulated CLI output' }).click();
  await expect(drawer).toBeHidden();

  await terminal.getByRole('button', { name: 'Expand CLI terminal' }).click();

  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Collapse CLI terminal' }))
    .toHaveAttribute('aria-expanded', 'true');

  await expect(output).toContainText('npx oas3ts convert', { timeout: 10_000 });
  await expect(output).toContainText('Generated 69 TypeScript file(s)', {
    timeout: 15_000,
  });

  await drawer.getByRole('button', { name: 'Collapse CLI terminal' }).click();
  await expect(drawer).toBeHidden();
  await expect(terminal.getByRole('button', { name: 'Expand CLI terminal' }))
    .toBeVisible();
  expectNoDiagnostics();
});
