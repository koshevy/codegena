import { collectBrowserDiagnostics, getStoryUrl } from '@codegena/util-e2e';
import { expect, test, type Locator, type Page } from '@playwright/test';

import {
  expectGeneratedLine,
  expectSourceLine,
  getFileCard,
} from './file-details-navigation';

const storyUrl = getStoryUrl(
  'codegena-playground--one-password-connect-with-persistence',
);

test.use({ viewport: { height: 1117, width: 1728 } });

function getGraphNode(graph: Locator, id: string): Locator {
  return graph.locator(`.react-flow__node[data-id="${id}"]`);
}

async function openGraphAndDetails(
  page: Page,
  scope: 'all' | 'selected' = 'all',
): Promise<Locator> {
  await page.goto(storyUrl);

  const graphMode = page.getByRole('button', { name: 'Graph', exact: true });

  await expect(graphMode).toBeVisible();

  const showSource = page.getByRole('button', { name: 'Show source schema' });

  if (await showSource.isVisible()) {
    await showSource.click();
  }

  const showDetails = page.getByRole('button', { name: 'Show details' });

  if (await showDetails.isVisible()) {
    await showDetails.click();
  }

  if (await graphMode.getAttribute('aria-pressed') !== 'true') {
    await graphMode.click();
  }

  const scopeButton = page.getByRole('button', {
    name: scope === 'all' ? 'Show all' : 'Show selected',
  });

  if (await scopeButton.getAttribute('aria-pressed') !== 'true') {
    await scopeButton.click();
  }

  return page.locator('.react-flow');
}

test('graph declarations reveal their file and generated source lines', async ({
  page,
}) => {
  const browserMessages = collectBrowserDiagnostics(page);
  const graph = await openGraphAndDetails(page);

  await test.step('root namespace', async () => {
    await getGraphNode(graph, 'index.ts::Api1PasswordConnect').click();

    const card = getFileCard(page, 'index.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 20, 'namespace Api1PasswordConnect');
    await expectSourceLine(page, 1, '{');
  });

  await test.step('activity operation file', async () => {
    await getGraphNode(graph, 'activity').getByRole('button', {
      name: 'Expand ./activity directory',
    }).click();
    await getGraphNode(graph, 'activity/index.ts')
      .locator('.FileNode__header').click();

    const card = getFileCard(page, 'activity/index.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 1, 'export type');
    await expectSourceLine(page, 47, '"get": {');
  });

  await test.step('root document file', async () => {
    await page.getByRole('button', { name: 'Fit View' }).click();
    await getGraphNode(graph, 'index.ts')
      .locator('.FileNode__header').click();

    const card = getFileCard(page, 'index.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 1, 'import');
    await expectSourceLine(page, 1, '{');
  });

  await test.step('API request interface', async () => {
    await getGraphNode(graph, 'activity/api-request.ts::ApiRequest').click();

    const card = getFileCard(page, 'activity/api-request.ts');

    await expect(card).toBeInViewport();
    await expect(card).toHaveClass(/GeneratedFileDetailsFile__selected/);
    await expectGeneratedLine(card, 5, 'interface ApiRequest');
    await expectSourceLine(page, 1775, '"APIRequest"');
  });

  expect(browserMessages).toEqual([]);
});

test('directory selection reveals direct details and active relations', async ({
  page,
}) => {
  const browserMessages = collectBrowserDiagnostics(page);
  const graph = await openGraphAndDetails(page);

  await getGraphNode(graph, 'items').getByRole('button', {
    name: 'Expand ./items directory',
  }).click();
  await getGraphNode(graph, 'items/_common').getByRole('button', {
    name: 'Expand ./items/_common directory',
  }).click();
  await getGraphNode(graph, 'items/_common').click();

  const details = page.getByRole('region', {
    name: 'Generated file details',
  });
  const firstFile = getFileCard(page, 'items/_common/field.ts');
  const secondFile = getFileCard(page, 'items/_common/full-item.ts');
  const barrel = getFileCard(page, 'items/_common/index.ts');

  await expect(firstFile).toBeInViewport();
  await expect(secondFile).toBeInViewport();
  await expect(barrel).toBeAttached();
  await expect(details).toBeVisible();
  await expect.poll(async () => {
    const [fileBounds, detailsBounds] = await Promise.all([
      firstFile.boundingBox(),
      details.boundingBox(),
    ]);

    if (!fileBounds || !detailsBounds) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.abs(fileBounds.y - detailsBounds.y);
  }).toBeLessThan(24);

  await page.getByRole('button', { name: 'Fit View' }).click();

  const placementColor = await page.getByText('Placement', { exact: true })
    .evaluate((element) => getComputedStyle(element).color);
  const importColor = await page.getByText('Import', { exact: true })
    .evaluate((element) => getComputedStyle(element).color);

  await expect.poll(async () => {
    const activeColors = await graph
      .locator('.react-flow__edge.animated .react-flow__edge-path')
      .evaluateAll((paths) => paths.map((path) => (
        getComputedStyle(path).stroke
      )));

    return {
      imports: activeColors.filter((color) => color === importColor).length,
      placements: activeColors.filter((color) => color === placementColor).length,
    };
  }).toEqual({ imports: 8, placements: 6 });
  expect(browserMessages).toEqual([]);
});

test('graph warning reveal shows the warning and hides the shortcut', async ({
  page,
}) => {
  await openGraphAndDetails(page, 'selected');

  const declaration = page.getByLabel('Api1PasswordConnect declaration');

  await declaration.getByRole('button', {
    name: 'Reveal warnings for Api1PasswordConnect',
  }).click();

  const details = page.getByRole('region', {
    name: 'Generated file details',
  });
  const warnings = details.getByRole('article', {
    name: /^Warning: oas3-onepassword-connect\.json:/,
  });
  const warning = warnings.first();
  const warningShortcut = page.getByRole('button', {
    name: 'Scroll to warnings in generated file details',
  });

  await expect(warning).toBeInViewport({ ratio: 0.6 });
  await expect(warning).toContainText('oas3-onepassword-connect.json:');
  await expect(warning).toHaveCSS(
    'border-left-color',
    /rgb\((201, 138, 16|229, 168, 50)\)/,
  );
  await expect(warningShortcut).toBeHidden();

  await details.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await expect.poll(async () => {
    const [detailsBounds, warningBounds, scroll] = await Promise.all([
      details.boundingBox(),
      warnings.last().boundingBox(),
      details.evaluate((element) => ({
        height: element.scrollHeight,
        top: element.scrollTop,
      })),
    ]);

    if (!detailsBounds || !warningBounds) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.abs(
      scroll.height
      - (warningBounds.y + warningBounds.height
        - detailsBounds.y + scroll.top),
    );
  }).toBeLessThan(32);
});
