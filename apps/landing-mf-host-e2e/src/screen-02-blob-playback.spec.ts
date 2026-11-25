import type { Locator } from '@playwright/test';

import { expect, test } from '../fixtures';
import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
} from './landing-journey';

interface BlobAnimationSample {
  finalTime: number;
  initialTime: number;
  state: AnimationPlayState;
}

async function sampleBlobAnimation(blob: Locator): Promise<BlobAnimationSample> {
  return blob.evaluate(async (element) => {
    const animation = element.getAnimations({ subtree: true }).find((item) => (
      item instanceof CSSAnimation
    ));

    if (!animation) {
      const name = getComputedStyle(element, '::before').animationName;

      throw new Error(`The blob must retain its shape animation while paused: ${name}`);
    }

    const initialTime = Number(animation.currentTime);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    return {
      finalTime: Number(animation.currentTime),
      initialTime,
      state: animation.playState,
    };
  });
}

test('02.06 — the full-screen blob freezes and resumes on backward scrolling', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const blob = page.getByRole('progressbar', {
    name: 'Current feature scroll progress',
  });

  await scrollSecondScreenTo(page, 14.5 / 17);
  await expect(page.getByText('05 / IDE PLUGINS')).toBeVisible();

  const moving = await sampleBlobAnimation(blob);

  expect(moving.state).toBe('running');
  expect(moving.finalTime).toBeGreaterThan(moving.initialTime);

  await scrollSecondScreenTo(page, 15.5 / 17);
  await expect(page.getByText('06 / UNIFIED UI')).toBeVisible();

  const frozen = await sampleBlobAnimation(blob);

  expect(frozen.state).toBe('paused');
  expect(frozen.finalTime).toBe(frozen.initialTime);

  await scrollSecondScreenTo(page, 16 / 17);

  const held = await sampleBlobAnimation(blob);

  expect(held.state).toBe('paused');
  expect(held.finalTime).toBe(frozen.finalTime);

  await scrollSecondScreenTo(page, 14.9 / 17);
  await expect(page.getByText('05 / IDE PLUGINS')).toBeVisible();

  const resumed = await sampleBlobAnimation(blob);

  expect(resumed.state).toBe('running');
  expect(resumed.initialTime).toBeGreaterThanOrEqual(frozen.finalTime);
  expect(resumed.finalTime).toBeGreaterThan(resumed.initialTime);
  expectNoDiagnostics();
});
