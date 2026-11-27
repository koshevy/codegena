import { expect, test } from '../fixtures';
import { getGpuFrameCount, observeGpuFrames } from './gpu-rendering';
import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
} from './landing-journey';

const softwareGpuArgs = [
  '--enable-gpu',
  '--enable-unsafe-webgpu',
  '--use-angle=vulkan',
  '--enable-features=Vulkan',
  '--disable-vulkan-surface',
];
const hasContainerChromium = Boolean(process.env['LANDING_E2E_CHROMIUM']);
const gpuArgs = hasContainerChromium ? softwareGpuArgs : ['--enable-gpu'];

// Mesa supplies a WebGPU adapter to the container.
test.use({
  launchOptions: async ({ launchOptions }, applyOptions) => {
    await applyOptions({ ...launchOptions, args: gpuArgs });
  },
});

interface LayoutShift extends PerformanceEntry {
  sources: readonly { node: Node | null }[];
  value: number;
}

test('02.00 — Chrome reports no layout shifts for the moving blob', async ({ page }) => {
  await page.goto('/');
  await scrollSecondScreenTo(page, 1 / 17);

  const blob = page.getByRole('progressbar', { name: 'Current feature scroll progress' });

  await expect(blob).toHaveAttribute('data-has-shader', 'true');

  const initialY = await blob.evaluate((element) => element.getBoundingClientRect().y);

  const measurement = await blob.evaluateHandle((element) => {
    const scores: number[] = [];

    function recordBlobShifts(entries: PerformanceEntry[]): void {
      for (const entry of entries as LayoutShift[]) {
        if (entry.sources.some(({ node }) => element.contains(node))) {
          scores.push(entry.value);
        }
      }
    }

    const observer = new PerformanceObserver((list) => {
      recordBlobShifts(list.getEntries());
    });

    observer.observe({ type: 'layout-shift' });

    return () => {
      recordBlobShifts(observer.takeRecords());
      observer.disconnect();

      return scores;
    };
  });

  await scrollSecondScreenTo(page, 3 / 17);
  await expect(blob).toHaveAttribute('aria-valuenow', '75');

  const finalY = await blob.evaluate((element) => element.getBoundingClientRect().y);
  const blobShiftScores = await measurement.evaluate((readScores) => readScores());

  expect(finalY).toBeGreaterThan(initialY);
  expect(blobShiftScores).toEqual([]);
});

test('02.06 — the live GPU blob pauses and resumes without losing its renderer', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  let hasRequestedBlob = false;
  let hasRequestedShaderRegistry = false;

  page.on('request', (request) => {
    const { pathname } = new URL(request.url());

    if (pathname.startsWith('/landing-progress-blob')) {
      hasRequestedBlob = true;
    }

    if (pathname.startsWith('/shaders-built-in-registry.')) {
      hasRequestedShaderRegistry = true;
    }
  });

  await observeGpuFrames(page);
  await page.goto('/');

  const blob = page.getByRole('progressbar', {
    name: 'Current feature scroll progress',
  });
  const nebula = page.locator('.UnifiedUiNebula__shader');

  await expect(blob).toBeAttached();
  expect(hasRequestedBlob).toBe(false);

  await scrollSecondScreenTo(page, 14.5 / 17);
  await expect(page.getByText('05 / IDE PLUGINS')).toBeVisible();
  await expect(blob).toHaveAttribute('data-has-shader', 'true');
  expect(hasRequestedBlob).toBe(true);
  await expect.poll(() => getGpuFrameCount(blob)).toBeGreaterThan(1);

  const movingFrames = await getGpuFrameCount(blob);

  await expect.poll(() => getGpuFrameCount(blob)).toBeGreaterThan(movingFrames);

  await scrollSecondScreenTo(page, 15.5 / 17);
  await expect(page.getByText('06 / UNIFIED UI')).toBeVisible();
  await expect(blob).toHaveAttribute('data-has-shader', 'true');

  const frozenFrames = await getGpuFrameCount(blob);

  await scrollSecondScreenTo(page, 16 / 17);
  await expect(blob).toHaveAttribute('data-has-shader', 'true');
  expect(await getGpuFrameCount(blob)).toBe(frozenFrames);
  await expect.poll(() => getGpuFrameCount(nebula)).toBeGreaterThan(1);

  await scrollSecondScreenTo(page, 14.9 / 17);
  await expect(page.getByText('05 / IDE PLUGINS')).toBeVisible();
  await expect(blob).toHaveAttribute('data-has-shader', 'true');
  await expect.poll(() => getGpuFrameCount(blob)).toBeGreaterThan(frozenFrames);
  expect(hasRequestedShaderRegistry).toBe(false);
  expectNoDiagnostics();
});
