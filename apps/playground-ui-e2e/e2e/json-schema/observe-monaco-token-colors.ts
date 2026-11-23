import type { Locator } from '@playwright/test';

interface MonacoTokenColorObservation {
  sampleCount: number;
  uncoloredSamples: string[][];
}

export async function observeMonacoTokenColors(
  editor: Locator,
): Promise<() => Promise<MonacoTokenColorObservation>> {
  const monitor = await editor.evaluateHandle((root) => {
    const uncoloredSamples: string[][] = [];
    let isObserving = true;
    let sampleCount = 0;

    const sample = (): void => {
      if (!isObserving) {
        return;
      }

      const colors = [...root.querySelectorAll('.view-line span[class*="mtk"]')]
        .slice(0, 80)
        .map((token) => getComputedStyle(token).color);

      sampleCount += 1;

      const uniqueColors = new Set(colors);

      if (uniqueColors.size <= 1 && uncoloredSamples.length < 5) {
        uncoloredSamples.push(colors);
      }

      requestAnimationFrame(sample);
    };

    requestAnimationFrame(sample);

    return {
      stop: (): MonacoTokenColorObservation => {
        isObserving = false;

        return { sampleCount, uncoloredSamples };
      },
    };
  });

  return async () => {
    const observation = await monitor.evaluate(({ stop }) => stop());

    await monitor.dispose();

    return observation;
  };
}
