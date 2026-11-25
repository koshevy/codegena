import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { expectActiveEdgesAboveInactive } from '../expect-active-edges-above-inactive';
import { getGraphViewportZoom } from '../get-graph-viewport-zoom';
import { expectSourceLine } from './file-details-navigation';

function getGraphNode(graphView: Locator, id: string): Locator {
  return graphView.locator(`.react-flow__node[data-id="${id}"]`);
}

async function expandGraphDirectory(
  graphView: Locator,
  id: string,
): Promise<void> {
  await getGraphNode(graphView, id).getByRole('button', {
    name: `Expand ./${id} directory`,
  }).click();
}

async function panGraphRight(page: Page, graph: Locator): Promise<void> {
  const bounds = await graph.boundingBox();

  if (!bounds) {
    throw new Error('The graph canvas must be visible.');
  }

  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width - 20,
    bounds.y + bounds.height - 20,
    { steps: 8 },
  );
  await page.mouse.up();
}

async function getElementCenter(element: Locator): Promise<{
  x: number;
  y: number;
}> {
  return element.evaluate((node) => {
    const bounds = node.getBoundingClientRect();

    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };
  });
}

async function getDistanceBetweenCenters(
  first: Locator,
  second: Locator,
): Promise<number> {
  const [firstCenter, secondCenter] = await Promise.all([
    getElementCenter(first),
    getElementCenter(second),
  ]);

  return Math.hypot(
    firstCenter.x - secondCenter.x,
    firstCenter.y - secondCenter.y,
  );
}

const expectedRootChildOrder = [
  '_common',
  'activity',
  'files',
  'health',
  'items',
  'metrics',
  'vaults',
  'index.ts',
];

async function getRootChildOrder(graphView: Locator): Promise<string[]> {
  const positions = await Promise.all(expectedRootChildOrder.map(async (id) => ({
    id,
    y: await getGraphNode(graphView, id).evaluate((element) => (
      element.getBoundingClientRect().top
    )),
  })));

  return positions.toSorted((first, second) => first.y - second.y)
    .map(({ id }) => id);
}

test('keeps root directory children in name order when items expands', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');

  await expect.poll(() => getRootChildOrder(graphView))
    .toEqual(expectedRootChildOrder);

  await getGraphNode(graphView, 'items')
    .getByRole('button', { name: 'Expand ./items directory' })
    .click();

  await expect(getGraphNode(graphView, 'items/_common')).toBeVisible();
  await expect.poll(() => getRootChildOrder(graphView))
    .toEqual(expectedRootChildOrder);
});

test('keeps the root index file beside first-level directories', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const health = getGraphNode(graphView, 'health');
  const index = getGraphNode(graphView, 'index.ts');

  await health.getByRole('button', {
    name: 'Expand ./health directory',
  }).click();

  const checkLiveness = getGraphNode(graphView, 'health/check-liveness');

  await expect(checkLiveness).toBeVisible();
  await checkLiveness.getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  }).click();

  await expect(getGraphNode(graphView, 'health/check-liveness/index.ts'))
    .toBeVisible();

  await expect.poll(() => getRootChildOrder(graphView))
    .toEqual(expectedRootChildOrder);

  await expect.poll(async () => {
    const rootRight = await getGraphNode(graphView, '.').evaluate((element) => (
      element.getBoundingClientRect().right
    ));

    const indexLeft = await index.evaluate((element) => (
      element.getBoundingClientRect().left
    ));

    const healthRight = await health.evaluate((element) => (
      element.getBoundingClientRect().right
    ));

    return indexLeft > rootRight && indexLeft < healthRight;
  }).toBe(true);
});

test('keeps a directory visible after collapsing its expanded tree', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const items = getGraphNode(graphView, 'items');

  await expandGraphDirectory(graphView, 'items');
  await expandGraphDirectory(graphView, 'items/_common');
  await expandGraphDirectory(graphView, 'items/create-new-item');
  await expandGraphDirectory(graphView, 'items/delete-item-by-id');
  await expandGraphDirectory(graphView, 'items/get-all');
  await expandGraphDirectory(graphView, 'items/get-details-by-id');
  await expandGraphDirectory(graphView, 'items/update-item-details');
  await expandGraphDirectory(graphView, 'items/update-subset-attributes');

  const lastExpandedDirectory = getGraphNode(
    graphView,
    'items/update-subset-attributes',
  );

  await expect.poll(() => getDistanceBetweenCenters(
    lastExpandedDirectory,
    graphView,
  )).toBeLessThan(3);

  const viewport = graphView.locator('.react-flow__viewport');
  const zoomBeforeCollapse = await getGraphViewportZoom(viewport);

  await items.getByRole('button', {
    name: 'Collapse ./items directory',
  }).click();

  await expect(items).toBeInViewport();
  await expect.poll(() => getGraphViewportZoom(viewport))
    .toBeCloseTo(zoomBeforeCollapse, 2);
  await expect.poll(() => getDistanceBetweenCenters(items, graphView))
    .toBeLessThan(40);
});

test('loads the 1Password OpenAPI story and restores its view', async ({ page }) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  const sourceEditor = page.locator('.monaco-editor').first();
  const graphView = page.locator('.react-flow');

  await expect(sourceEditor).toContainText('1Password Connect');
  await expect(getGraphNode(graphView, 'items')).toBeVisible();

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });

  await expect(tree.locator('[data-node-id="items"]')).toBeVisible();
  await page.reload();
  await expect(tree.locator('[data-node-id="items"]')).toBeVisible();
});

test('reveals a source declaration inside collapsed graph directories', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  const graphView = page.locator('.react-flow');
  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await expect(graphView).toBeVisible();
  await page.getByRole('button', { name: 'Hide source schema' }).click();
  await page.getByRole('button', { name: 'Show source schema' }).click();
  await expect(sourceEditor).toBeVisible();

  const vaults = getGraphNode(graphView, 'vaults');
  const listAll = getGraphNode(graphView, 'vaults/list-all');
  const targetNode = getGraphNode(
    graphView,
    'vaults/list-all/response-vaults-list-all.ts::ResponseVaultsListAll',
  );

  await expect(vaults.getByRole('button', {
    name: 'Expand ./vaults directory',
  })).toHaveAttribute('aria-expanded', 'false');
  await expect(listAll).toHaveCount(0);
  await expect(targetNode).toHaveCount(0);

  await sourceEditor.locator('.view-line').nth(5).click();
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');
  await page.keyboard.press('PageDown');

  const declarationButton = sourceEditor.getByRole('button', {
    name: 'Reveal generated declarations for line 140',
  });

  await expect(declarationButton.getByRole('img', { name: 'Alias' }))
    .toBeVisible();
  await declarationButton.click();

  await expect(vaults.getByRole('button', {
    name: 'Collapse ./vaults directory',
  })).toHaveAttribute('aria-expanded', 'true');

  await expect(listAll.getByRole('button', {
    name: 'Collapse ./vaults/list-all directory',
  })).toHaveAttribute('aria-expanded', 'true');

  await expect(targetNode).toBeVisible();
  await expect(targetNode).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect.poll(async () => {
    const [nodeCenter, graphCenter] = await Promise.all([
      getElementCenter(targetNode),
      getElementCenter(graphView),
    ]);

    return Math.hypot(
      nodeCenter.x - graphCenter.x,
      nodeCenter.y - graphCenter.y,
    );
  }).toBeLessThan(40);
});

test('keeps nested OAS directories collapsed after reopening their parent', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const health = getGraphNode(graphView, 'health');
  const liveness = getGraphNode(graphView, 'health/check-liveness');

  await expect(health.getByRole('button', {
    name: 'Expand ./health directory',
  })).toHaveAttribute('aria-expanded', 'false');
  await expect(liveness).toHaveCount(0);

  await health.getByRole('button', {
    name: 'Expand ./health directory',
  }).click();
  await liveness.getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  }).click();
  await expect(getGraphNode(graphView, 'health/check-liveness/index.ts'))
    .toBeVisible();

  await health.getByRole('button', {
    name: 'Collapse ./health directory',
  }).click();
  await expect(liveness).toHaveCount(0);

  await health.getByRole('button', {
    name: 'Expand ./health directory',
  }).click();
  await expect(liveness.getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  })).toHaveAttribute('aria-expanded', 'false');
  await expect(getGraphNode(graphView, 'health/check-liveness/index.ts'))
    .toHaveCount(0);
});

test('shows generated directories in graph and list views', async ({
  page,
}) => {
  const storyId = 'codegena-playground--directory-hierarchy';

  await page.goto(getStoryUrl(storyId));

  const graphView = page.locator('.react-flow');
  const health = getGraphNode(graphView, 'health');
  const operationFile = getGraphNode(
    graphView,
    'health/check-liveness/index.ts',
  );

  await expect(health).toBeVisible();
  await expect(operationFile).toHaveCount(0);

  await health.getByRole('button', { name: 'Expand ./health directory' }).click();

  const checkLiveness = getGraphNode(graphView, 'health/check-liveness');

  await expect(checkLiveness.getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  })).toBeVisible();
  await checkLiveness.getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  }).click();
  await expect(operationFile).toBeVisible();

  const operationDeclaration = getGraphNode(
    graphView,
    'health/check-liveness/index.ts::HealthCheckLiveness',
  );

  await expect(operationDeclaration.getByRole('img', { name: 'Namespace' }))
    .toBeVisible();

  await health.getByRole('button', { name: 'Collapse ./health directory' }).click();
  await expect(operationFile).toHaveCount(0);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const healthItem = tree.locator('[data-node-id="health"]');
  const checkLivenessItem = tree.locator(
    '[data-node-id="health/check-liveness"]',
  );
  const operationItem = tree.locator(
    '[data-node-id="health/check-liveness/index.ts"]',
  );

  await expect(healthItem).toBeVisible();
  await expect(operationItem).toHaveCount(0);

  await tree.getByRole('button', { name: 'Expand ./health' }).click();
  await tree.getByRole('button', { name: 'Expand ./health/check-liveness' }).click();

  await expect(checkLivenessItem).toBeVisible();
  await expect(operationItem).toBeVisible();

  await tree.getByRole('button', {
    name: 'Expand health/check-liveness/index.ts',
  }).click();

  await expect(operationItem.locator('[data-node-id$="::HealthCheckLiveness"]'))
    .toBeVisible();
});

test('describes direct directory contents in graph and list views', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graph = page.locator('.react-flow');
  const healthNode = getGraphNode(graph, 'health');

  const healthGraphCount = healthNode.getByRole('note', {
    name: '2 directories · 0 files',
  });

  await expect(healthGraphCount).toBeVisible();
  await expect(healthGraphCount).toHaveText('2 directories · 0 files');

  await healthNode.getByRole('button', {
    name: 'Expand ./health directory',
  }).click();

  const checkLivenessGraphCount = getGraphNode(
    graph,
    'health/check-liveness',
  ).getByRole('note', {
    name: '0 directories · 3 files',
  });

  await expect(checkLivenessGraphCount).toBeVisible();
  await expect(checkLivenessGraphCount).toHaveText('0 directories · 3 files');

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const healthTreeCount = tree.locator('[data-node-id="health"]')
    .getByRole('note', {
      name: '2 directories · 0 files',
    });

  await expect(healthTreeCount).toBeVisible();
  await expect(healthTreeCount).toHaveText('(2 directories · 0 files)');

  await tree.getByRole('button', { name: 'Expand ./health' }).click();

  const checkLivenessTreeCount = tree.locator(
    '[data-node-id="health/check-liveness"]',
  ).getByRole('note', {
    name: '0 directories · 3 files',
  });

  await expect(checkLivenessTreeCount).toBeVisible();
  await expect(checkLivenessTreeCount).toHaveText('(0 directories · 3 files)');
});

test('keeps directory names readable across the 20vw count threshold', async ({
  page,
}) => {
  const storyId = 'codegena-playground-generated-files-list--constrained-directories';

  await page.setViewportSize({ height: 720, width: 1280 });
  await page.goto(getStoryUrl(storyId));

  const tree = page.getByRole('tree', { name: 'Generated files' });

  await tree.getByRole('button', { name: 'Expand ./health' }).click();

  const directory = tree.locator('[data-node-id="health/check-liveness"]');
  const name = directory.getByText('check-liveness', { exact: true });
  const description = directory.getByRole('note', {
    includeHidden: true,
    name: '0 directories · 3 files',
  });

  await directory.hover();
  await expect(name).toBeVisible();
  await expect(description).toHaveCSS('opacity', '1');
  await expect.poll(() => description.evaluate((element) => (
    element.clientWidth
  ))).toBeGreaterThan(24);

  const nameRight = await name.evaluate((element) => (
    element.getBoundingClientRect().right
  ));
  const descriptionLeft = await description.evaluate((element) => (
    element.getBoundingClientRect().left
  ));

  expect(descriptionLeft).toBeGreaterThan(nameRight);
  await expect.poll(() => name.evaluate((element) => (
    element.clientWidth >= element.scrollWidth
  ))).toBe(true);

  await page.setViewportSize({ height: 720, width: 1728 });

  await expect(description).toBeHidden();
  await expect(name).toBeVisible();
  await expect.poll(() => name.evaluate((element) => (
    element.clientWidth >= element.scrollWidth
  ))).toBe(true);
});

test('shows total file and folder chips for the active list sort', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const fileCountStatus = page.getByRole('status', {
    name: '72 generated files in this specification',
  });

  const folderCountStatus = page.getByRole('status', {
    name: '22 generated directories in this specification',
  });

  await expect(fileCountStatus).toBeVisible();
  await expect(fileCountStatus).toHaveText('72');
  await expect(folderCountStatus).toBeVisible();
  await expect(folderCountStatus).toHaveText('22');

  await page.getByRole('button', {
    name: 'By source file and line',
  }).click();

  await expect(fileCountStatus).toBeVisible();
  await expect(folderCountStatus).toHaveCount(0);

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  await expect(fileCountStatus).toBeVisible();
  await expect(folderCountStatus).toBeVisible();
  await fileCountStatus.hover();
  await expect(page.getByRole('tooltip', {
    name: '72 generated files in this specification',
  })).toBeVisible();
  await folderCountStatus.hover();
  await expect(page.getByRole('tooltip', {
    name: '22 generated directories in this specification',
  })).toBeVisible();
  await expect(page.getByRole('list', {
    name: 'Visible edge types',
  }).getByRole('listitem')).toHaveText(['Placement']);
});

test('updates the edge legend as 1Password directories expand and collapse', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const legendItems = page.getByRole('list', {
    name: 'Visible edge types',
  }).getByRole('listitem');

  await expect(legendItems).toHaveText(['Placement']);

  await expandGraphDirectory(graphView, '_common');
  await expect(legendItems).toHaveText(['Import', 'Placement']);

  await getGraphNode(graphView, '_common').getByRole('button', {
    name: 'Collapse ./_common directory',
  }).click();

  await expect(legendItems).toHaveText(['Placement']);

  await expandGraphDirectory(graphView, 'activity');
  await expect(legendItems).toHaveText([
    'Import',
    'Placement',
  ]);

  await getGraphNode(graphView, 'activity').getByRole('button', {
    name: 'Collapse ./activity directory',
  }).click();

  await expect(legendItems).toHaveText(['Placement']);

  await expandGraphDirectory(graphView, 'metrics');
  await expect(legendItems).toHaveText(['Import', 'Placement']);

  await getGraphNode(graphView, 'metrics').getByRole('button', {
    name: 'Collapse ./metrics directory',
  }).click();

  await expect(legendItems).toHaveText(['Placement']);
});

test('explains hidden nested directories and switches to selected details', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const notice = page.locator('#details').getByRole('button', {
    name: 'Reveal nested directories in file details',
  });

  await expect(notice).toHaveCount(0);

  const tree = page.getByRole('tree', { name: 'Generated files' });

  await tree.getByText('health', { exact: true }).click();
  await expect(notice).toBeVisible();
  await expect(page.locator('#source').getByRole('button', {
    name: 'Reveal nested directories in file details',
  })).toHaveCount(0);

  await notice.hover();
  await expect(page.getByRole('tooltip', {
    name: [
      'Nested directories are hidden in "Show all".',
      'Click to switch to "Show selected".',
    ].join(' '),
  })).toBeVisible();
  await expect(notice).toHaveAttribute('aria-describedby', /.+/);

  await notice.click();
  await expect(page.getByRole('button', { name: 'Show selected' }))
    .toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', {
    name: 'Select ./health/check-liveness directory',
  })).toBeVisible();
  await expect(notice).toHaveCount(0);

  await tree.getByText('check-liveness', { exact: true }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await expect(notice).toHaveCount(0);
});

test('lists files by source location without directory rows', async ({ page }) => {
  const storyId = 'codegena-playground--directory-hierarchy';

  await page.goto(getStoryUrl(storyId));
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const directory = tree.locator('[data-node-id="health"]');
  const nestedFile = tree.locator(
    '[data-node-id="health/check-liveness/index.ts"]',
  );

  await expect(directory).toBeVisible();
  await page.getByRole('button', { name: 'By source file and line' }).click();

  await expect(directory).toHaveCount(0);

  const fileIds = await tree.locator('[data-node-id]').evaluateAll((elements) => (
    elements.map((element) => (
      element instanceof HTMLElement ? element.dataset['nodeId'] : undefined
    ))
  ));

  expect(fileIds).toEqual([
    'index.ts',
    'activity/index.ts',
    'activity/query-parameters-activity-get-api-requests.ts',
    'activity/response-activity-get-api-requests.ts',
    'activity/response-headers-activity-get-api-requests.ts',
    'vaults/list-all/index.ts',
    'vaults/list-all/query-parameters-vaults-list-all.ts',
    'vaults/list-all/response-vaults-list-all.ts',
    'vaults/get-details/index.ts',
    'vaults/get-details/path-parameters-vaults-get-details.ts',
    'vaults/get-details/response-vaults-get-details.ts',
    'items/get-all/index.ts',
    'items/get-all/path-parameters-items-get-all.ts',
    'items/get-all/query-parameters-items-get-all.ts',
    'items/get-all/response-items-get-all.ts',
    'items/create-new-item/index.ts',
    'items/create-new-item/path-parameters-items-create-new-item.ts',
    'items/create-new-item/request-items-create-new-item.ts',
    'items/create-new-item/response-items-create-new-item.ts',
    'items/get-details-by-id/index.ts',
    'items/get-details-by-id/path-parameters-items-get-details-by-id.ts',
    'items/get-details-by-id/response-items-get-details-by-id.ts',
    'items/update-item-details/index.ts',
    'items/update-item-details/path-parameters-items-update-item-details.ts',
    'items/update-item-details/request-items-update-item-details.ts',
    'items/update-item-details/response-items-update-item-details.ts',
    'items/delete-item-by-id/index.ts',
    'items/delete-item-by-id/path-parameters-items-delete-item-by-id.ts',
    'items/delete-item-by-id/response-items-delete-item-by-id.ts',
    'items/update-subset-attributes/index.ts',
    'items/update-subset-attributes/path-parameters-items-update-subset-attributes.ts',
    'items/update-subset-attributes/request-items-update-subset-attributes.ts',
    'items/update-subset-attributes/response-items-update-subset-attributes.ts',
    'files/get-all-inside-item/index.ts',
    'files/get-all-inside-item/path-parameters-files-get-all-files-inside-item.ts',
    'files/get-all-inside-item/query-parameters-files-get-all-files-inside-item.ts',
    'files/get-all-inside-item/response-files-get-all-files-inside-item.ts',
    'files/get-file-details/index.ts',
    'files/get-file-details/path-parameters-files-get-file-details.ts',
    'files/get-file-details/query-parameters-files-get-file-details.ts',
    'files/get-file-details/response-files-get-file-details.ts',
    'files/get-content/index.ts',
    'files/get-content/path-parameters-files-get-content.ts',
    'files/get-content/response-files-get-content.ts',
    'files/get-content/response-headers-files-get-content.ts',
    'health/check-liveness/index.ts',
    'health/check-liveness/response-health-check-liveness.ts',
    'health/server-state-check/index.ts',
    'health/server-state-check/response-health-server-state-check.ts',
    'metrics/index.ts',
    'metrics/response-metrics-query-server-metrics.ts',
    '_common/error-response.ts',
    '_common/file.ts',
    'vaults/_common/vault.ts',
    'items/_common/generator-recipe.ts',
    'items/_common/item.ts',
    'items/_common/full-item.ts',
    'items/_common/field.ts',
    'activity/api-request.ts',
    'items/update-subset-attributes/patch.ts',
    'health/server-state-check/service-dependency.ts',
    'activity/activity-get-api-requests-response.ts',
    'vaults/list-all/vaults-list-all-response.ts',
    'items/get-all/items-get-all-response.ts',
    'files/get-all-inside-item/files-get-all-files-inside-item-response.ts',
    'files/get-content/files-get-content-response.ts',
    'health/check-liveness/health-check-liveness-response.ts',
    'health/server-state-check/health-server-state-check-response.ts',
    'metrics/metrics-query-server-metrics-response.ts',
    '_common/index.ts',
    'items/_common/index.ts',
    'vaults/_common/index.ts',
  ]);
  await expect(nestedFile.locator('.GeneratedFilesListFileItem__text'))
    .toHaveText('health/check-liveness/index.ts');

  await page.getByRole('button', { name: 'By filename' }).click();
  await expect(directory).toBeVisible();

  await tree.getByRole('button', { name: 'Expand ./health' }).click();
  await tree.getByRole('button', { name: 'Expand ./health/check-liveness' }).click();
  await expect(nestedFile.locator('.GeneratedFilesListFileItem__text'))
    .toHaveText('index.ts');
});

test('selects graph directories separately from expanding them', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');
  const root = getGraphNode(graphView, '.');
  const health = getGraphNode(graphView, 'health');
  const expandHealth = health.getByRole('button', {
    name: 'Expand ./health directory',
  });

  await expect(root).toContainText('7 directories · 1 file');
  await expect(health).toContainText('2 directories · 0 files');
  await expect(health).not.toHaveClass(/\bselected\b/);

  await health.click();

  await expect(health).toHaveClass(/\bselected\b/);
  await expect(expandHealth).toHaveAttribute('aria-expanded', 'false');

  await expandHealth.click();

  await expect(health).toHaveClass(/\bselected\b/);
  await expect(getGraphNode(graphView, 'health/check-liveness')).toBeVisible();

  await health.getByRole('button', {
    name: 'Collapse ./health directory',
  }).click();

  await expect(health).toHaveClass(/\bselected\b/);
  await expect(getGraphNode(graphView, 'health/check-liveness')).toHaveCount(0);

  await health.click();

  await expect(health).not.toHaveClass(/\bselected\b/);

  await health.focus();
  await page.keyboard.press('Enter');

  await expect(health).toHaveClass(/\bselected\b/);
});

test('keeps the graph viewport still when selecting and deselecting nodes', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');
  const viewport = graphView.locator('.react-flow__viewport');
  const root = getGraphNode(graphView, '.');

  await expect(root).toBeVisible();

  const getScreenPosition = async (): Promise<{ x: number; y: number }> => (
    root.evaluate((element) => {
      const { x, y } = element.getBoundingClientRect();

      return { x, y };
    })
  );

  const initialPosition = await getScreenPosition();
  const initialZoom = await getGraphViewportZoom(viewport);

  const expectStableView = async (): Promise<void> => {
    const position = await getScreenPosition();

    expect(Math.hypot(
      position.x - initialPosition.x,
      position.y - initialPosition.y,
    )).toBeLessThan(1);
    expect(await getGraphViewportZoom(viewport))
      .toBe(initialZoom);
  };

  await page.clock.install();
  await root.click();
  await expect(root).toHaveClass(/\bselected\b/);
  await page.clock.runFor(400);
  await expectStableView();

  await root.click();
  await expect(root).not.toHaveClass(/\bselected\b/);
  await page.clock.runFor(400);
  await expectStableView();
});

test('selects graph directories and their direct children', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');
  const root = getGraphNode(graphView, '.');
  const health = getGraphNode(graphView, 'health');
  const checkLiveness = getGraphNode(graphView, 'health/check-liveness');
  const indexFile = getGraphNode(graphView, 'index.ts');
  const operationFile = getGraphNode(
    graphView,
    'health/check-liveness/index.ts',
  );

  await root.click();

  await expect(indexFile).toHaveClass(/\bimplicitly-selected\b/);
  await expect(health).toHaveClass(/\bimplicitly-selected\b/);
  await expect(page.getByRole('button', {
    name: 'Select ./health directory',
  })).toBeVisible();
  await expect(page.locator('[data-details-row="directory"]')).toHaveCount(7);
  await expect(page.locator('[data-details-row="file"]')).toHaveCount(1);

  await expandGraphDirectory(graphView, 'health');
  await expandGraphDirectory(graphView, 'health/check-liveness');

  await expect(checkLiveness).not.toHaveClass(/\bimplicitly-selected\b/);
  await expect(operationFile).not.toHaveClass(/\bimplicitly-selected\b/);

  await checkLiveness.click({ modifiers: ['Shift'] });

  await expect(root).toHaveClass(/\bselected\b/);
  await expect(checkLiveness).toHaveClass(/\bselected\b/);
  await expect(indexFile).toHaveClass(/\bimplicitly-selected\b/);
  await expect(operationFile).toHaveClass(/\bimplicitly-selected\b/);
});

test('selects and expands tree directories like files', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const health = tree.locator('[data-node-id="health"]');
  const checkLiveness = tree.locator('[data-node-id="health/check-liveness"]');
  const expandHealth = tree.getByRole('button', { name: 'Expand ./health' });

  await expandHealth.click();
  await expect(health).not.toHaveAttribute('aria-checked', 'true');

  await health.getByText('health', { exact: true }).click();
  await expect(health).toHaveAttribute('aria-checked', 'true');
  await expect(checkLiveness).toHaveAttribute('aria-checked', 'true');

  const directoryDetails = page.getByRole('button', {
    name: 'Select ./health/check-liveness directory',
  });

  await expect(directoryDetails).toBeVisible();
  await directoryDetails.hover();
  await expect(page.getByRole('tooltip', {
    name: 'Click to fall into ./health/check-liveness',
  })).toBeVisible();
  await expect.poll(() => directoryDetails.evaluate((element) => {
    const icon = element.querySelector('svg');

    return icon
      ? icon.getBoundingClientRect().left - element.getBoundingClientRect().left
      : Number.POSITIVE_INFINITY;
  })).toBeLessThan(25);

  await page.getByRole('button', { name: 'Show all' }).click();
  await expect(directoryDetails).toHaveCount(0);
  await page.getByRole('button', { name: 'Show selected' }).click();
  await expect(directoryDetails).toBeVisible();

  await health.focus();
  await page.keyboard.press('Space');
  await expect(health).not.toHaveAttribute('aria-checked', 'true');
  await expect(checkLiveness).not.toHaveAttribute('aria-checked', 'true');
  await expect(checkLiveness).toBeVisible();

  await health.getByText('health', { exact: true }).click();

  await health.getByText('health', { exact: true }).click();
  await expect(health).not.toHaveAttribute('aria-checked', 'true');
  await expect(checkLiveness).toBeVisible();

  await tree.getByRole('button', { name: 'Collapse ./health' }).click();
  await expect(checkLiveness).toHaveCount(0);
  await expect(health).not.toHaveAttribute('aria-checked', 'true');

  await health.getByText('health', { exact: true }).click();
  await expect(checkLiveness).toBeVisible();
  await directoryDetails.click();

  await expect(health).not.toHaveAttribute('aria-checked', 'true');
  await expect(checkLiveness).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-details-row="file"]')
    .getByRole('group', {
      name: 'Details header for health/check-liveness/index.ts',
    })).toBeVisible();
});

test('reveals a directory chosen from details inside a collapsed tree', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');

  await getGraphNode(graphView, '.').click();
  await page.getByRole('button', {
    name: 'Select ./health directory',
  }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const checkLiveness = tree.locator('[data-node-id="health/check-liveness"]');

  await expect(checkLiveness).toBeVisible();
  await tree.getByRole('button', { name: 'Collapse ./health' }).click();
  await expect(checkLiveness).toHaveCount(0);
  await page.getByRole('button', {
    name: 'Select ./health/check-liveness directory',
  }).click();

  await expect(checkLiveness).toBeVisible();
  await expect(checkLiveness).toHaveAttribute('aria-checked', 'true');
});

test('uses the file selection color for directory rows', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const health = tree.locator('[data-node-id="health"]');
  const indexFile = tree.locator('[data-node-id="index.ts"]');

  await health.getByText('health', { exact: true }).click();
  await page.mouse.move(0, 0);

  const directoryColor = await health
    .locator(':scope > .MuiTreeItem-content')
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  await indexFile.getByText('index.ts', { exact: true }).click();
  await page.mouse.move(0, 0);

  const fileColor = await indexFile
    .locator(':scope > .MuiTreeItem-content')
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(directoryColor).toBe(fileColor);
  await expect(health).not.toHaveAttribute('aria-checked', 'true');
});

test('selects an implicitly selected tree directory with Space', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const health = tree.locator('[data-node-id="health"]');
  const checkLiveness = tree.locator('[data-node-id="health/check-liveness"]');

  await health.getByText('health', { exact: true }).click();
  await expect(checkLiveness).toBeVisible();
  await expect(checkLiveness).toHaveAttribute('aria-checked', 'true');

  await checkLiveness.focus();
  await page.keyboard.press('Space');

  await expect(checkLiveness).toHaveAttribute('aria-checked', 'true');
  await expect(health).not.toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('ControlOrMeta+A');

  await expect(health).toHaveAttribute('aria-checked', 'true');
  await expect(tree.locator('[data-node-id="index.ts"]'))
    .toHaveAttribute('aria-checked', 'true');
});

test('activates placement paths between Shift-selected root and nested file', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const root = getGraphNode(graphView, '.');
  const targetFileId = 'items/_common/generator-recipe.ts';
  const targetFile = getGraphNode(graphView, targetFileId);

  await expandGraphDirectory(graphView, 'items');
  await expandGraphDirectory(graphView, 'items/_common');

  await root.click();
  await page.keyboard.down('Shift');

  try {
    await targetFile.getByRole('heading', {
      name: `File ${targetFileId}`,
      exact: true,
    }).click();
  }
  finally {
    await page.keyboard.up('Shift');
  }

  await expect(root).toHaveClass(/\bselected\b/);
  await expect(targetFile).toHaveClass(/\bselected\b/);
  await expect(page.getByRole('combobox', {
    name: /^Search generated files,/,
  })).toHaveCount(0);

  const intermediateNodeIds = ['items', 'items/_common'];

  await Promise.all(intermediateNodeIds.map(async (id) => {
    await expect(getGraphNode(graphView, id)).toHaveClass(/\bimplicitly-selected\b/);
  }));

  const placementEdgeIds = [
    '.->items',
    'items->items/_common',
    `items/_common->${targetFileId}`,
  ];

  await Promise.all(placementEdgeIds.map(async (id) => {
    const edge = graphView.locator(`.react-flow__edge[data-id="${id}"]`);

    await expect(edge).toHaveClass(/\banimated\b/);
    await expect(edge.locator('.react-flow__edge-path'))
      .toHaveCSS('stroke-dasharray', '8px');
  }));
});

test('keeps the graph root open while real directories toggle on double-click', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');
  const root = getGraphNode(graphView, '.');
  const health = getGraphNode(graphView, 'health');
  const checkLiveness = getGraphNode(graphView, 'health/check-liveness');

  await expect(health).toBeVisible();
  await expect(root.getByRole('button', {
    name: 'Collapse . directory',
  })).toHaveCount(0);

  await root.getByText('./', { exact: true }).dblclick();
  await expect(health).toBeVisible();

  await health.getByText('health', { exact: true }).dblclick();
  await expect(checkLiveness).toBeVisible();

  await health.getByText('health', { exact: true }).dblclick();
  await expect(checkLiveness).toHaveCount(0);
});

test('names graph directories in themed path tooltips', async ({ page }) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graphView = page.locator('.react-flow');
  const rootTitle = getGraphNode(graphView, '.').getByText('./', { exact: true });

  await rootTitle.hover();
  await expect(page.getByRole('tooltip', {
    name: 'Directory ./',
  })).toBeVisible();

  const itemsTitle = getGraphNode(graphView, 'items')
    .getByText('items', { exact: true });

  await itemsTitle.hover();
  await expect(page.getByRole('tooltip', { name: 'Directory ./items' }))
    .toBeVisible();
});

test('reveals a graph node in either details scope or its specification', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graph = page.locator('.react-flow');
  const file = getGraphNode(graph, 'index.ts');
  const declaration = getGraphNode(graph, 'index.ts::Api1PasswordConnect');

  await file.getByRole('heading', { name: 'File index.ts' }).hover();
  await expect(page.getByRole('tooltip', {
    name: 'File ./index.ts',
  })).toBeVisible();

  await declaration.getByRole('heading', {
    name: 'Declaration Api1PasswordConnect',
  }).hover();
  await expect(page.getByRole('tooltip', {
    name: 'Declaration \'Api1PasswordConnect\'',
  })).toBeVisible();

  await declaration.getByRole('img').hover();
  await expect(page.getByRole('tooltip', {
    name: 'Click to reveal source line in specification and generated code',
  })).toBeVisible();

  await file.getByRole('heading', { name: 'File index.ts' })
    .click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Reveal details (only this)',
  }).click();

  await expect(file).toHaveClass(/selected/);
  await expect(page.getByRole('button', { name: 'Show selected' }))
    .toHaveAttribute('aria-pressed', 'true');

  await file.getByRole('heading', { name: 'File index.ts' })
    .click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Reveal details (only this)',
  })).toBeDisabled();
  await page.getByRole('menuitem', {
    name: 'Reveal details (between others)',
  }).click();

  await expect(page.getByRole('button', { name: 'Show all' }))
    .toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Fit View' }).click();
  await expandGraphDirectory(graph, 'activity');

  const apiRequestFile = getGraphNode(graph, 'activity/api-request.ts');
  const apiRequestHeader = apiRequestFile.getByRole('heading', {
    name: 'File activity/api-request.ts',
  });

  await apiRequestHeader.click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Reveal details (only this)',
  }).click();
  await apiRequestHeader.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Reveal details (only this)',
  })).toBeDisabled();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Fit View' }).click();
  await declaration.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Reveal in specification',
  })).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Hide source schema' }).click();
  await page.getByRole('button', { name: 'Fit View' }).click();
  await declaration.click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Reveal in specification',
  }).click();

  await expect(declaration).toHaveClass(/selected/);
  await expect(page.getByRole('button', { name: 'Hide source schema' }))
    .toBeVisible();
  await expectSourceLine(page, 1, '{');

  await declaration.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Reveal in specification',
  })).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const treeFile = page.getByRole('tree', { name: 'Generated files' })
    .locator('[data-node-id="index.ts"]');

  await treeFile.locator(
    '[data-node-id="index.ts::Api1PasswordConnect"]',
  ).getByRole('img').hover();
  await expect(page.getByRole('tooltip', {
    name: 'Click to reveal source line in specification and generated code',
  })).toBeVisible();

  await treeFile.click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Reveal details (between others)',
  }).click();

  await expect(page.getByRole('button', { name: 'Show all' }))
    .toHaveAttribute('aria-pressed', 'true');
});

test('collapses graph and list directories from shared menus', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const graph = page.locator('.react-flow');
  const header = page.getByRole('group', { name: 'Generated output header' });

  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeDisabled();
  await expect(page.getByRole('menuitem', {
    name: 'Expand all directories',
  })).toBeEnabled();
  await page.keyboard.press('Escape');

  await expandGraphDirectory(graph, 'activity');
  await expect(getGraphNode(graph, 'activity/index.ts')).toBeVisible();

  await panGraphRight(page, graph);
  await panGraphRight(page, graph);

  await expect(getGraphNode(graph, '.')).not.toBeInViewport();

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Collapse all directories',
  }).click();
  await expect(getGraphNode(graph, 'activity/index.ts')).toHaveCount(0);
  await expect(getGraphNode(graph, '.')).toBeInViewport();
  await expect(getGraphNode(graph, 'index.ts')).toBeInViewport();

  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeDisabled();
  await page.keyboard.press('Escape');

  await graph.getByRole('button', { name: 'Zoom In' }).click();

  const zoomBeforeExpand = await getGraphViewportZoom(
    graph.locator('.react-flow__viewport'),
  );

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Expand all directories',
  }).click();
  await expect(getGraphNode(graph, 'activity/index.ts')).toBeVisible();
  await expect.poll(() => getGraphViewportZoom(
    graph.locator('.react-flow__viewport'),
  )).toBeLessThan(zoomBeforeExpand);

  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Expand all directories',
  })).toBeDisabled();
  await page.keyboard.press('Escape');

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', {
    name: 'Collapse all directories',
  }).click();
  await expandGraphDirectory(graph, 'activity');

  const activityDirectory = getGraphNode(graph, 'activity');

  await activityDirectory.click({ button: 'right' });
  await expect(page.getByRole('menuitem').nth(1))
    .toHaveText('Collapse directory');
  await page.getByRole('menuitem', { name: 'Collapse directory' }).click();
  await expect(getGraphNode(graph, 'activity/index.ts')).toHaveCount(0);

  await activityDirectory.click({ button: 'right' });
  await expect(page.getByRole('menuitem').nth(1))
    .toHaveText('Expand directory');
  await page.getByRole('menuitem', { name: 'Expand directory' }).click();
  await expect(getGraphNode(graph, 'activity/index.ts')).toBeVisible();

  await graph.locator('.react-flow__pane').click({
    button: 'right',
    position: { x: 10, y: 10 },
  });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeEnabled();
  await page.getByRole('menuitem', {
    name: 'Collapse all directories',
  }).click();
  await expect(getGraphNode(graph, 'activity/index.ts')).toHaveCount(0);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const activityFile = tree.locator('[data-node-id="activity/index.ts"]');

  await tree.getByRole('button', { name: 'Expand ./activity' }).click();
  await expect(activityFile).toBeVisible();
  await tree.getByRole('button', { name: 'Expand activity/index.ts' }).click();

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Collapse all files' }).click();
  await expect(tree.locator('[data-node-id="activity"]'))
    .toHaveAttribute('aria-expanded', 'true');
  await expect(activityFile).toHaveAttribute('aria-expanded', 'false');

  await tree.getByRole('button', { name: 'Expand activity/index.ts' }).click();
  await tree.getByRole('button', { name: 'Collapse ./activity' }).click();

  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeDisabled();
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all files',
  })).toBeDisabled();
  await page.keyboard.press('Escape');

  const activityTreeDirectory = tree.locator('[data-node-id="activity"]');

  await activityTreeDirectory.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Expand directory' }).click();
  await expect(activityFile).toBeVisible();

  await page.locator('.PlaygroundGeneratedOutputView__root').click({
    button: 'right',
    position: { x: 2, y: 2 },
  });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeEnabled();
  await page.getByRole('menuitem', {
    name: 'Collapse all directories',
  }).click();
  await expect(activityFile).toHaveCount(0);

  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeDisabled();
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all files',
  })).toBeDisabled();
  await expect(page.getByRole('menuitem', {
    name: 'Expand all directories',
  })).toBeEnabled();
  await page.keyboard.press('Escape');

  await page.getByRole('button', {
    name: 'By source file and line',
  }).click();
  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Collapse all directories',
  })).toBeDisabled();
  await expect(page.getByRole('menuitem', {
    name: 'Expand all directories',
  })).toBeDisabled();
});

test('opens both side panels from a graph declaration glyph', async ({ page }) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  await page.getByRole('button', { name: 'Hide source schema' }).click();
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Hide details' }).click();

  const graph = page.locator('.react-flow');
  const declaration = getGraphNode(graph, 'index.ts::Api1PasswordConnect');

  await declaration.getByRole('img', { name: 'Namespace' }).click();

  await expect(page.getByRole('button', { name: 'Hide source schema' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide details' }))
    .toBeVisible();
  await expect(declaration).toHaveClass(/selected/);
});

test('graph glyph actions keep selected declarations and reveal unselected ones', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  const graph = page.locator('.react-flow');
  const declaration = getGraphNode(graph, 'index.ts::Api1PasswordConnect');
  const file = getGraphNode(graph, 'index.ts');
  const declarationGlyph = declaration.getByRole('button', {
    name: 'Reveal source and code for Api1PasswordConnect',
  });
  const warningGlyph = declaration.getByRole('button', {
    name: 'Reveal warnings for Api1PasswordConnect',
  });

  await file.getByRole('heading', { name: 'File index.ts' }).click();
  await declarationGlyph.click();
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(file).toHaveClass(/(?:^|\s)selected(?:\s|$)/);

  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await sourceEditor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .not.toHaveText('1');
  await declarationGlyph.click();
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expectSourceLine(page, 1, '{');
  await warningGlyph.click();
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(page.getByRole('region', {
    name: 'Generated file details',
  }).getByRole('article', { name: /^Warning:/ }).first()).toBeInViewport();

  await declaration.click();
  await declaration.click();
  await expect(declaration).not.toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await warningGlyph.click();
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await declaration.click();
  await declarationGlyph.click();
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
});

test('list glyph actions keep selected declarations and reveal unselected ones', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const file = tree.getByRole('treeitem', { name: /index\.ts/ }).first();

  await file.click();
  await file.getByRole('button', {
    name: 'Reveal warnings for index.ts',
  }).click();
  await expect(file).toHaveAttribute('aria-checked', 'true');

  const declaration = tree.getByRole('treeitem', {
    name: /Api1PasswordConnect/,
  });
  const declarationGlyph = declaration.getByRole('button', {
    name: 'Select Api1PasswordConnect declaration',
  });
  const warningGlyph = declaration.getByRole('button', {
    name: 'Reveal warnings for Api1PasswordConnect',
  });

  await declarationGlyph.click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
  await expect(file).toHaveAttribute('aria-checked', 'true');

  const sourceEditor = page.locator('.Playground__source .monaco-editor');

  await sourceEditor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .not.toHaveText('1');
  await declarationGlyph.click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
  await expectSourceLine(page, 1, '{');
  await warningGlyph.click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('region', {
    name: 'Generated file details',
  }).getByRole('article', { name: /^Warning:/ }).first()).toBeInViewport();

  await declaration.click();
  await declaration.click();
  await expect(declaration).toHaveAttribute('aria-checked', 'false');
  await warningGlyph.click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
  await declaration.click();
  await declarationGlyph.click();
  await expect(declaration).toHaveAttribute('aria-checked', 'true');
});

test('fits graph after hidden bulk expansion and repeated collapse', async ({ page }) => {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  const graph = page.locator('.react-flow');
  const viewport = graph.locator('.react-flow__viewport');

  await graph.getByRole('button', { name: 'Zoom In' }).click();

  const originalZoom = await getGraphViewportZoom(viewport);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const header = page.getByRole('group', { name: 'Generated output header' });

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Expand all directories' }).click();

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Collapse all directories' }).click();

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Expand all directories' }).click();

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  await expect(getGraphNode(graph, 'activity/index.ts')).toBeVisible();
  await expect.poll(() => getGraphViewportZoom(viewport))
    .toBeLessThan(originalZoom);

  await panGraphRight(page, graph);
  await panGraphRight(page, graph);
  await expect(getGraphNode(graph, '.')).not.toBeInViewport();

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Collapse all directories' }).click();
  await page.getByRole('button', { name: 'Graph', exact: true }).click();
  await expect(getGraphNode(graph, '.')).toBeInViewport();

  await panGraphRight(page, graph);
  await panGraphRight(page, graph);
  await expect(getGraphNode(graph, '.')).not.toBeInViewport();

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.getByRole('tree', { name: 'Generated files' })
    .getByRole('button', { name: 'Expand ./activity' }).click();
  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Collapse all directories' }).click();
  await page.getByRole('button', { name: 'Graph', exact: true }).click();
  await expect(getGraphNode(graph, '.')).toBeInViewport();
});

test('hides graph handles without a visible edge', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');
  const root = getGraphNode(graphView, '.');
  const health = getGraphNode(graphView, 'health');

  await expect(root.locator('.react-flow__handle-left'))
    .toHaveCSS('visibility', 'hidden');
  await expect(root.locator('.react-flow__handle-right'))
    .toHaveCSS('visibility', 'visible');
  await expect(health.locator('.react-flow__handle-left'))
    .toHaveCSS('visibility', 'visible');
  await expect(health.locator('.react-flow__handle-right'))
    .toHaveCSS('visibility', 'hidden');

  await health.getByRole('button', {
    name: 'Expand ./health directory',
  }).click();

  await expect(health.locator('.react-flow__handle-right'))
    .toHaveCSS('visibility', 'visible');

  const checkLiveness = getGraphNode(graphView, 'health/check-liveness');

  await checkLiveness.getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  }).click();

  const file = getGraphNode(
    graphView,
    'health/check-liveness/health-check-liveness-response.ts',
  );

  await expect(file.locator('.react-flow__handle-left'))
    .toHaveCSS('visibility', 'visible');
  await expect(file.locator('.react-flow__handle-right'))
    .toHaveCSS('visibility', 'hidden');
});

test('keeps equal insets around graph file declarations', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--directory-hierarchy'));

  const graphView = page.locator('.react-flow');
  const health = getGraphNode(graphView, 'health');
  const file = getGraphNode(graphView, 'health/check-liveness/index.ts');
  const declaration = getGraphNode(
    graphView,
    'health/check-liveness/index.ts::HealthCheckLiveness',
  );

  await health.getByRole('button', { name: 'Expand ./health directory' }).click();
  await getGraphNode(graphView, 'health/check-liveness').getByRole('button', {
    name: 'Expand ./health/check-liveness directory',
  }).click();
  await expect(declaration).toBeVisible();

  const insets = await file.evaluate((fileElement) => {
    const headerElement = fileElement.querySelector('.FileNode__header');
    const declarationElement = document.querySelector(
      '[data-id="health/check-liveness/index.ts::HealthCheckLiveness"]',
    );

    if (!headerElement || !declarationElement) {
      throw new Error('The graph file needs a header and declaration.');
    }

    const fileBounds = fileElement.getBoundingClientRect();
    const headerBounds = headerElement.getBoundingClientRect();
    const declarationBounds = declarationElement.getBoundingClientRect();
    const scale = fileBounds.width / 360;

    return {
      bottom: (
        fileBounds.bottom - declarationBounds.bottom
      ) / scale,
      left: (
        declarationBounds.left - fileBounds.left
      ) / scale,
      right: (
        fileBounds.right - declarationBounds.right
      ) / scale,
      top: (
        declarationBounds.top - headerBounds.bottom
      ) / scale,
    };
  });

  expect(insets.right).toBeCloseTo(insets.left, 0);
  expect(insets.top).toBeCloseTo(insets.left, 0);
  expect(insets.bottom).toBeCloseTo(insets.left, 0);
});

test('indents each generated-files list level by one rem', async ({ page }) => {
  const storyId = 'codegena-playground-generated-files-list--with-directories';

  await page.goto(getStoryUrl(storyId));

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const fileId = 'health/check-liveness/index.ts';

  await tree.getByRole('button', { name: 'Expand ./health' }).click();
  await tree.getByRole('button', { name: 'Expand ./health/check-liveness' }).click();
  await tree.getByRole('button', { name: `Expand ${fileId}` }).click();

  const ids = [
    'health',
    'health/check-liveness',
    fileId,
    `${fileId}::HealthCheckLiveness`,
  ];

  const paddings = await Promise.all(ids.map(async (id) => (
    tree.locator(`[data-node-id="${id}"]`)
      .locator(':scope > .MuiTreeItem-content')
      .evaluate((element) => (
        Number(getComputedStyle(element).paddingLeft.slice(0, -2))
      ))
  )));

  const oneRem = await page.evaluate(() => (
    Number(getComputedStyle(document.documentElement).fontSize.slice(0, -2))
  ));

  expect(paddings.slice(1).map((padding, index) => (
    padding - paddings[index]
  ))).toEqual([oneRem, oneRem, oneRem]);
});

async function openMetricsGraph(page: Page): Promise<Locator> {
  await page.goto(
    getStoryUrl('codegena-playground--one-password-connect-with-persistence'),
  );

  const hideSource = page.getByRole('button', { name: 'Hide source schema' });

  if (await hideSource.isVisible()) {
    await hideSource.click();
  }

  const hideDetails = page.getByRole('button', { name: 'Hide details' });

  if (await hideDetails.isVisible()) {
    await hideDetails.click();
  }

  const graphMode = page.getByRole('button', { name: 'Graph', exact: true });

  if (await graphMode.getAttribute('aria-pressed') !== 'true') {
    await graphMode.click();
  }

  const graph = page.locator('.react-flow');

  await expandGraphDirectory(graph, 'metrics');

  return graph;
}

test('uses imports without duplicate references for Metrics sole declarations', async ({
  page,
}) => {
  const graph = await openMetricsGraph(page);

  const fileIds = [
    'index.ts',
    'metrics/index.ts',
    'metrics/response-metrics-query-server-metrics.ts',
    'metrics/metrics-query-server-metrics-response.ts',
  ];

  await Promise.all(fileIds.map(async (id) => {
    await expect(getGraphNode(graph, id)).toBeVisible();
  }));

  const placementEdges = [
    ['.', 'metrics'],
    ['metrics', 'metrics/index.ts'],
    ['metrics', 'metrics/response-metrics-query-server-metrics.ts'],
    ['metrics', 'metrics/metrics-query-server-metrics-response.ts'],
  ];

  await Promise.all(placementEdges.map(async ([source, target]) => {
    await expect(graph.getByRole('img', {
      name: `placement edge from ${source} to ${target}`,
    })).toHaveCount(1);
  }));

  const importEdges = [
    ['index.ts', 'metrics/index.ts'],
    ['metrics/index.ts', 'metrics/response-metrics-query-server-metrics.ts'],
    ['metrics/index.ts', 'metrics/metrics-query-server-metrics-response.ts'],
    [
      'metrics/response-metrics-query-server-metrics.ts',
      'metrics/metrics-query-server-metrics-response.ts',
    ],
  ];

  await Promise.all(importEdges.map(async ([source, target]) => {
    await expect(graph.getByRole('img', {
      name: `import edge from ${source} to ${target}`,
    })).toHaveCount(1);
  }));

  await expect(graph.getByRole('img', {
    name: /^reference edge from .*::.* to .*::/,
  })).toHaveCount(0);

  await expect(page.getByRole('list', {
    name: 'Visible edge types',
  }).getByRole('listitem')).toHaveText(['Import', 'Placement']);
});

test('layers active placement and import edges above inactive edges', async ({
  page,
}) => {
  const graph = await openMetricsGraph(page);
  const file = getGraphNode(graph, 'metrics/index.ts');

  await file.locator('.FileNode__header').click();

  await expect(graph.getByRole('img', {
    name: 'placement edge from metrics to metrics/index.ts',
  })).toHaveClass(/animated/);

  await expect(graph.getByRole('img', {
    name: 'import edge from index.ts to metrics/index.ts',
  })).toHaveClass(/animated/);

  await expectActiveEdgesAboveInactive(graph);
});
