import type { Locator } from '@playwright/test';

export async function getGraphViewportZoom(viewport: Locator): Promise<number> {
  return viewport.evaluate((element) => {
    const transform = new DOMMatrixReadOnly(
      getComputedStyle(element).transform,
    );

    return transform.a;
  });
}
