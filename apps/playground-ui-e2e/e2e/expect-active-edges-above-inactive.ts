import { expect, type Locator } from '@playwright/test';

export async function expectActiveEdgesAboveInactive(
  graphView: Locator,
): Promise<void> {
  const layers = await graphView.locator('.react-flow__edge')
    .evaluateAll((elements) => elements.map((element) => ({
      isActive: element.classList.contains('animated'),
      zIndex: Number(getComputedStyle(element.parentElement ?? element).zIndex),
    })));

  const activeLayers = layers
    .filter(({ isActive }) => isActive)
    .map(({ zIndex }) => zIndex);

  const inactiveLayers = layers
    .filter(({ isActive }) => !isActive)
    .map(({ zIndex }) => zIndex);

  expect(activeLayers.length).toBeGreaterThan(0);
  expect(inactiveLayers.length).toBeGreaterThan(0);
  expect(Math.min(...activeLayers)).toBeGreaterThan(Math.max(...inactiveLayers));
}
