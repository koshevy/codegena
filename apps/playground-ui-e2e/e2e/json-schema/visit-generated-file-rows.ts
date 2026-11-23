import { expect, type Locator } from '@playwright/test';

export async function visitGeneratedFileRows(
  fileDetails: Locator,
  checkRows: (rows: Locator) => Promise<void>,
): Promise<void> {
  const fileCount = Number(await fileDetails.locator('[data-file-count]')
    .getAttribute('data-file-count'));

  // Measured Monaco rows can increase the list height after the scan starts.
  const offsets = Array.from(
    { length: fileCount * 4 },
    (_value, index) => index * 240,
  );

  const visitedIndices = await offsets.reduce<Promise<number[]>>(
    async (previousIndices, offset) => {
      const indices = await previousIndices;
      const visitedFiles = new Set(indices);

      if (visitedFiles.size === fileCount) {
        return indices;
      }

      await expect(fileDetails).toBeVisible();

      await fileDetails.evaluate((element, nextOffset) => {
        element.scrollTop = nextOffset;
      }, offset);

      await fileDetails.evaluate(() => new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }));

      const rows = fileDetails.locator('[data-details-row="file"]');

      if (await rows.count() === 0) {
        return indices;
      }

      await checkRows(rows);

      const mountedIndices = await rows.evaluateAll((items) => items.map(
        (item) => Number(item.dataset['index']),
      ));

      return [...indices, ...mountedIndices];
    },
    Promise.resolve([]),
  );

  const uniqueVisitedIndices = new Set(visitedIndices);

  expect(uniqueVisitedIndices.size).toBe(fileCount);
}
