import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test, type Locator } from '@playwright/test';

import { expectActiveEdgesAboveInactive } from '../expect-active-edges-above-inactive';
import { getGraphViewportZoom } from '../get-graph-viewport-zoom';

const explicitSelectionClass = /(?:^|\s)selected(?:\s|$)/;
const implicitSelectionClass = /(?:^|\s)implicitly-selected(?:\s|$)/;

test('shows only relations present in the comprehensive graph legend', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive-with-persistence'));

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  const legendItems = page.getByRole('list', {
    name: 'Visible edge types',
  }).getByRole('listitem');

  await expect(legendItems).toHaveText(['Import', 'Reference']);
});

function getGraphNode(graphView: Locator, id: string): Locator {
  return graphView.locator(`.react-flow__node[data-id="${id}"]`);
}

function getGraphEdge(graphView: Locator, id: string): Locator {
  return graphView.locator(`.react-flow__edge[data-id="${id}"]`);
}

async function getCenterDistance(node: Locator, graphView: Locator): Promise<number> {
  const [nodeBounds, graphBounds] = await Promise.all([
    node.boundingBox(),
    graphView.boundingBox(),
  ]);

  if (!nodeBounds || !graphBounds) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.hypot(
    nodeBounds.x + nodeBounds.width / 2 - graphBounds.x - graphBounds.width / 2,
    nodeBounds.y + nodeBounds.height / 2 - graphBounds.y - graphBounds.height / 2,
  );
}

async function expectActiveEdge(edge: Locator): Promise<void> {
  await expect(edge).toHaveClass(/(?:^|\s)animated(?:\s|$)/);
  await expect(edge.locator('.react-flow__edge-path'))
    .toHaveCSS('stroke-dasharray', '8px');
}

test('keeps the file list near zero-level.ts after a source reveal', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const header = page.getByRole('group', { name: 'Generated output header' });

  await expect(header).toBeVisible();
  await expect(header.getByText('Generated output', { exact: true }))
    .toHaveCount(0);

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const sourceScroll = page.locator(
    '.monaco-editor .monaco-scrollable-element.editor-scrollable',
  ).first();

  await sourceScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await page.locator(
    'button[aria-label="Reveal generated declarations for line 967"]',
  ).click();

  const fileList = page.locator('.GeneratedFilesList__root');
  const lastFile = fileList.getByRole('treeitem', { name: /zero-level\.ts/ });

  await fileList.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const scrollTopBeforeSelection = await fileList.evaluate(
    (element) => element.scrollTop,
  );

  expect(scrollTopBeforeSelection).toBeGreaterThan(0);

  await lastFile.click();

  await expect(lastFile).toHaveAttribute('aria-checked', 'true');
  await expect(lastFile).toHaveAttribute('aria-expanded', 'true');

  const scrollTopAfterSelection = await fileList.evaluate((element) => element.scrollTop);

  expect(scrollTopAfterSelection).toBeGreaterThan(scrollTopBeforeSelection / 2);
});

test('keeps the small muted count for multiple file declarations', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const tree = page.getByRole('tree', { name: 'Generated files' });
  const file = tree.locator('[data-node-id="first-level.ts"]');
  const count = file.getByText('(7 data types)');

  await expect(count).toBeVisible();
  await expect(count).toHaveCSS('font-size', '11px');
  await expect(count).toHaveCSS('flex-shrink', '0');
});

test('uses list actions in blank space and keeps a menu row highlighted', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive-with-persistence'));
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const list = page.locator('.GeneratedFilesList__root');
  const file = list.locator('[data-node-id="first-level.ts"]');

  await file.click();
  await expect(file).toHaveAttribute('aria-checked', 'true');

  await list.click({
    button: 'right',
    position: { x: 3, y: 20 },
  });
  await expect(page.getByRole('menuitem', { name: 'Collapse all files' }))
    .toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Expand all files' }))
    .toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Clear selection' }))
    .toBeEnabled();

  await page.keyboard.press('Escape');
  await list.click({ position: { x: 3, y: 20 } });
  await expect(file).toHaveAttribute('aria-checked', 'false');

  const row = file.locator(':scope > .MuiTreeItem-content');

  await row.hover();

  const hoverColor = await row.evaluate((element) => (
    getComputedStyle(element).backgroundColor
  ));

  expect(hoverColor).not.toBe('rgba(0, 0, 0, 0)');

  await row.click({ button: 'right' });
  await page.mouse.move(0, 0);
  await expect(page.getByRole('menu', { name: 'Generated output actions' }))
    .toBeVisible();
  await expect(row).toHaveCSS('background-color', hoverColor);
});

test('reveals and refocuses a declaration from the source editor', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive-with-persistence'));

  const graphView = page.locator('.react-flow');
  const viewport = graphView.locator('.react-flow__viewport');
  const targetNode = getGraphNode(
    graphView,
    'array-min-max-with-refs.ts::ArrayMinMaxWithRefs',
  );

  await expect(targetNode).toBeVisible();

  const initialTransform = await viewport.evaluate((element) => (
    element.style.transform
  ));

  const sourceScroll = page.locator(
    '.Playground__source .monaco-scrollable-element.editor-scrollable',
  );

  await sourceScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await page.getByRole('button', {
    name: 'Reveal generated declarations for line 967',
  }).click();

  await expect(targetNode).toHaveClass(explicitSelectionClass);
  await expect.poll(() => viewport.evaluate((element) => (
    element.style.transform
  ))).not.toBe(initialTransform);
  await expect(targetNode).toBeInViewport();

  const centeredZoom = await getGraphViewportZoom(viewport);

  await graphView.getByRole('button', { name: 'Zoom Out' }).click();
  await expect.poll(() => getGraphViewportZoom(viewport))
    .toBeLessThan(centeredZoom);

  await page.getByRole('button', {
    name: 'Reveal generated declarations for line 967',
  }).click();

  await expect.poll(() => getGraphViewportZoom(viewport))
    .toBeCloseTo(centeredZoom, 2);
  await expect.poll(() => getCenterDistance(targetNode, graphView))
    .toBeLessThan(40);
});

test('keeps a selected file visible after list scrolling', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive-with-persistence'));

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const fileList = page.locator('.GeneratedFilesList__root');
  const firstFile = fileList.locator('[data-node-id="first-level.ts"]');
  const laterFile = fileList.locator('[data-node-id="simple-object-with-properties.ts"]');

  await firstFile.click();
  await expect(firstFile).toHaveAttribute('aria-expanded', 'true');

  await fileList.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await laterFile.click();
  await expect(laterFile).toHaveAttribute('aria-checked', 'true');
  await expect(laterFile).toHaveAttribute('aria-expanded', 'true');
  await expect(laterFile.locator(':scope > .MuiTreeItem-content')).toBeInViewport();
});

test('sorts generated files and declarations by source or name', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const sortBySource = page.getByRole('button', { name: 'By source' });
  const sortByFilename = page.getByRole('button', { name: 'By filename' });

  await expect(sortBySource).toHaveCount(0);
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const fileList = page.getByRole('tree', { name: 'Generated files' });
  const files = fileList.locator('[role="treeitem"][data-node-id$=".ts"]');
  const firstLevelFile = fileList.locator('[data-node-id="first-level.ts"]');
  const firstLevelDeclarations = firstLevelFile.locator(
    '[role="treeitem"][data-node-id^="first-level.ts::"]',
  );

  await expect(sortByFilename).toHaveAttribute('aria-pressed', 'true');
  await expect(files.first()).toHaveAttribute(
    'data-node-id',
    'another-simple-object-with-properties.ts',
  );

  await fileList.getByRole('button', { name: 'Expand first-level.ts' }).click();
  await expect(firstLevelDeclarations.first()).toHaveAttribute(
    'data-node-id',
    'first-level.ts::FifthLevel',
  );

  await sortBySource.click();

  await expect(sortBySource).toHaveAttribute('aria-pressed', 'true');
  await expect(files.first()).toHaveAttribute('data-node-id', 'comprehensive-schema.ts');
  await expect(firstLevelDeclarations.first()).toHaveAttribute(
    'data-node-id',
    'first-level.ts::FirstLevel',
  );

  await page.getByRole('button', { name: 'Graph', exact: true }).click();
  await expect(sortBySource).toHaveCount(0);

  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(sortBySource).toHaveAttribute('aria-pressed', 'true');
});

test('reveals the same declaration again after scrolling away', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  await expect(page.getByRole('group', { name: 'Generated output header' }))
    .toBeVisible();

  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const sourceScroll = page.locator(
    '.monaco-editor .monaco-scrollable-element.editor-scrollable',
  ).first();

  await sourceScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const revealButton = page.locator(
    'button[aria-label="Reveal generated declarations for line 967"]',
  );

  await revealButton.click();

  const fileList = page.locator('.GeneratedFilesList__root');
  const selectedDeclaration = fileList.locator(
    '[data-node-id*="::"][aria-checked="true"]',
  );

  await expect(selectedDeclaration).toHaveCount(1);

  await fileList.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await expect(selectedDeclaration).not.toBeInViewport();

  await revealButton.click();

  await expect(selectedDeclaration).toBeInViewport();
});

test('preserves graph and list state across view switches', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const graphView = page.locator('.PlaygroundGeneratedOutputView__view').first();
  const listView = page.locator('.PlaygroundGeneratedOutputView__view').last();
  const viewport = graphView.locator('.react-flow__viewport');

  await expect(graphView.getByRole('button', { name: 'Zoom In' })).toBeVisible();

  const originalTransform = await viewport.getAttribute('style');

  await graphView.getByRole('button', { name: 'Zoom In' }).click();
  await expect.poll(() => viewport.getAttribute('style')).not.toBe(originalTransform);

  const zoomedTransform = await viewport.evaluate(async (element) => {
    const waitForStableTransform = async (
      previousTransform: string,
      stableFrames: number,
    ): Promise<string> => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const currentTransform = element.style.transform;
      const nextStableFrames = currentTransform === previousTransform
        ? stableFrames + 1
        : 0;

      if (nextStableFrames >= 5) {
        return currentTransform;
      }

      return waitForStableTransform(currentTransform, nextStableFrames);
    };

    return waitForStableTransform(element.style.transform, 0);
  });

  await page.getByRole('button', { name: 'List', exact: true }).click();

  await expect(graphView).toHaveAttribute('aria-hidden', 'true');
  await expect(graphView).toHaveCSS('visibility', 'hidden');
  await expect(listView).toHaveAttribute('aria-hidden', 'false');

  const fileList = listView.locator('.GeneratedFilesList__root');
  const firstLevelFile = fileList.locator('[data-node-id="first-level.ts"]');

  await fileList.getByRole('button', { name: 'Expand first-level.ts' }).click();
  await expect(firstLevelFile).toHaveAttribute('aria-expanded', 'true');
  await expect(firstLevelFile.locator('.MuiCollapse-root')).toHaveClass(
    /MuiCollapse-entered/,
  );

  await fileList.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  const listScrollTop = await fileList.evaluate((element) => element.scrollTop);

  expect(listScrollTop).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  await expect(graphView).toHaveAttribute('aria-hidden', 'false');
  await expect(listView).toHaveCSS('visibility', 'hidden');
  await expect.poll(() => viewport.evaluate(
    (element) => element.style.transform,
  )).toBe(zoomedTransform);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  await expect(firstLevelFile).toHaveAttribute('aria-expanded', 'true');
  expect(await fileList.evaluate((element) => element.scrollTop)).toBe(listScrollTop);
});

test('collapses and expands files from the generated output header', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));
  await page.getByRole('button', { name: 'List', exact: true }).click();

  const header = page.getByRole('group', { name: 'Generated output header' });
  const file = page.locator('[data-node-id="first-level.ts"]');

  await header.click({ button: 'right' });
  await expect(page.getByRole('menuitem', {
    name: 'Expand all directories',
  })).toHaveCount(0);
  await expect(page.getByRole('menuitem', { name: 'Collapse all files' }))
    .toBeDisabled();
  await page.getByRole('menuitem', { name: 'Expand all files' }).click();
  await expect(file).toHaveAttribute('aria-expanded', 'true');

  await header.click({ button: 'right' });
  await page.getByRole('menuitem', { name: 'Collapse all files' }).click();
  await expect(file).toHaveAttribute('aria-expanded', 'false');
});

test('syncs single and Shift-multiple selections across views', async ({ page }) => {
  await page.goto(getStoryUrl('codegena-playground--light'));

  const graphView = page.locator('.PlaygroundGeneratedOutputView__view').first();
  const listView = page.locator('.PlaygroundGeneratedOutputView__view').last();
  const accountGraphNode = graphView.getByRole('group', {
    name: 'account.ts generated file',
  });

  const statusGraphNode = graphView.getByRole('group', {
    name: 'status.ts generated file',
  });

  await accountGraphNode.focus();
  await page.keyboard.press('Enter');
  await expect(accountGraphNode).toHaveClass(/selected/);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  const accountTreeItem = listView.getByRole('treeitem', { name: /account\.ts/ });
  const statusTreeItem = listView.getByRole('treeitem', { name: /status\.ts/ });

  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'true');

  await statusTreeItem.click({ modifiers: ['Shift'] });

  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'true');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  await expect(accountGraphNode).toHaveClass(/selected/);
  await expect(statusGraphNode).toHaveClass(/selected/);

  await graphView.locator('.react-flow__pane').click({ position: { x: 10, y: 10 } });

  await expect(accountGraphNode).not.toHaveClass(/selected/);
  await expect(statusGraphNode).not.toHaveClass(/selected/);

  await page.getByRole('button', { name: 'List', exact: true }).click();

  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'false');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'false');

  await accountTreeItem.click();
  await statusTreeItem.click({ modifiers: ['Shift'] });
  await statusTreeItem.click();
  await statusTreeItem.click();

  await expect(accountTreeItem).toHaveAttribute('aria-checked', 'false');
  await expect(statusTreeItem).toHaveAttribute('aria-checked', 'false');

  await page.getByRole('button', { name: 'Graph', exact: true }).click();

  await expect(accountGraphNode).not.toHaveClass(/selected/);
  await expect(statusGraphNode).not.toHaveClass(/selected/);
});

test('keeps unselected graph edges solid and disables Clear selection', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const graphView = page.locator('.PlaygroundGeneratedOutputView__view').first();
  const importPath = getGraphEdge(
    graphView,
    'comprehensive-schema.ts->first-level.ts',
  ).locator('.react-flow__edge-path');

  const referencePath = getGraphEdge(
    graphView,
    'comprehensive-schema.ts::ComprehensiveSchema->first-level.ts::FirstLevel',
  ).locator('.react-flow__edge-path');

  await expect(importPath).toHaveCSS('stroke-dasharray', 'none');
  await expect(referencePath).toHaveCSS('stroke-dasharray', 'none');
  await expect(graphView.locator('.react-flow__edge.animated')).toHaveCount(0);

  const importColor = await importPath.evaluate((element) => (
    getComputedStyle(element).stroke
  ));

  const referenceColor = await referencePath.evaluate((element) => (
    getComputedStyle(element).stroke
  ));

  expect(importColor).not.toBe(referenceColor);

  await graphView.locator('.react-flow__pane').click({
    button: 'right',
    position: { x: 10, y: 10 },
  });

  await expect(page.getByRole('menuitem', { name: 'Clear selection' }))
    .toBeDisabled();
});

test('centers the comprehensive file among the generated file groups', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const graphView = page.locator('.PlaygroundGeneratedOutputView__view').first();
  const root = getGraphNode(graphView, 'comprehensive-schema.ts');

  await expect(root).toBeVisible();

  const filePositions = await graphView.locator(
    '.react-flow__node[data-id$=".ts"]',
  ).evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect();

    return {
      top: bounds.top,
      bottom: bounds.bottom,
    };
  }));

  const rootPosition = await root.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return { top: bounds.top, bottom: bounds.bottom };
  });

  const top = Math.min(...filePositions.map(({ top: position }) => position));
  const bottom = Math.max(...filePositions.map(({ bottom: position }) => position));

  const rootCenter = (rootPosition.top + rootPosition.bottom) / 2;
  const graphCenter = (top + bottom) / 2;

  expect(Math.abs(rootCenter - graphCenter)).toBeLessThan((bottom - top) * 0.15);
});

test('activates comprehensive edges from either node and restores them on clear', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const graphView = page.locator('.PlaygroundGeneratedOutputView__view').first();
  const file = graphView.getByRole('group', {
    name: 'comprehensive-schema.ts generated file',
  });

  const declaration = graphView.getByRole('group', {
    name: 'ComprehensiveSchema declaration',
  });

  const importEdge = getGraphEdge(graphView, 'comprehensive-schema.ts->first-level.ts');
  const referenceEdge = getGraphEdge(
    graphView,
    'comprehensive-schema.ts::ComprehensiveSchema->first-level.ts::FirstLevel',
  );

  const pane = graphView.locator('.react-flow__pane');
  const clearSelection = page.getByRole('menuitem', { name: 'Clear selection' });

  await file.locator('.FileNode__header').click();

  await expect(file).toHaveClass(explicitSelectionClass);
  await expect(declaration).toHaveClass(implicitSelectionClass);
  await expect(declaration).not.toHaveClass(explicitSelectionClass);
  await expectActiveEdge(importEdge);
  await expectActiveEdge(referenceEdge);

  await pane.click({ button: 'right', position: { x: 10, y: 10 } });
  await expect(clearSelection).toBeEnabled();
  await clearSelection.click();

  await expect(file).not.toHaveClass(explicitSelectionClass);
  await expect(declaration).not.toHaveClass(implicitSelectionClass);
  await expect(importEdge.locator('.react-flow__edge-path'))
    .toHaveCSS('stroke-dasharray', 'none');
  await expect(referenceEdge.locator('.react-flow__edge-path'))
    .toHaveCSS('stroke-dasharray', 'none');
  await expect(graphView.locator('.react-flow__edge.animated')).toHaveCount(0);

  await declaration.click();

  await expect(declaration).toHaveClass(explicitSelectionClass);
  await expect(file).toHaveClass(implicitSelectionClass);
  await expect(file).not.toHaveClass(explicitSelectionClass);
  await expectActiveEdge(importEdge);
  await expectActiveEdge(referenceEdge);

  await pane.click({ button: 'right', position: { x: 10, y: 10 } });
  await clearSelection.click();

  await expect(declaration).not.toHaveClass(explicitSelectionClass);
  await expect(file).not.toHaveClass(implicitSelectionClass);
  await expect(graphView.locator('.react-flow__edge.animated')).toHaveCount(0);
});

test('layers active import and reference edges above inactive edges', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const graphView = page.locator('.react-flow');
  const file = graphView.getByRole('group', {
    name: 'comprehensive-schema.ts generated file',
  });

  await file.locator('.FileNode__header').click();

  await expect(graphView.getByRole('img', {
    name: 'import edge from comprehensive-schema.ts to first-level.ts',
  })).toHaveClass(/animated/);

  await expect(graphView.getByRole('img', {
    name: /^reference edge from comprehensive-schema\.ts::ComprehensiveSchema to /,
  }).first()).toHaveClass(/animated/);

  await expectActiveEdgesAboveInactive(graphView);
});

test('activates every edge on the directed path to Shift-selected ZeroLevel', async ({
  page,
}) => {
  await page.goto(getStoryUrl('codegena-playground--comprehensive'));

  const graphView = page.locator('.PlaygroundGeneratedOutputView__view').first();
  const comprehensiveFile = graphView.getByRole('group', {
    name: 'comprehensive-schema.ts generated file',
  });

  const zeroLevel = graphView.getByRole('group', {
    name: 'ZeroLevel declaration',
  });

  await comprehensiveFile.locator('.FileNode__header').click();
  await page.getByRole('button', { name: 'Hide details' }).click();
  await zeroLevel.click({ modifiers: ['Shift'] });

  await expect(comprehensiveFile).toHaveClass(explicitSelectionClass);
  await expect(zeroLevel).toHaveClass(explicitSelectionClass);

  const implicitNodeIds = [
    'comprehensive-schema.ts::ComprehensiveSchema',
    'first-level.ts',
    'first-level.ts::FirstLevel',
    'first-level.ts::SecondLevel',
    'first-level.ts::ThirdLevel',
    'first-level.ts::FourthLevel',
    'first-level.ts::FifthLevel',
    'first-level.ts::SixthLevel',
    'first-level.ts::SeventhLevel',
    'eighth-level.ts',
    'eighth-level.ts::EighthLevel',
    'ninth-level.ts',
    'ninth-level.ts::NinthLevel',
    'zero-level.ts',
  ];

  await Promise.all(implicitNodeIds.map(async (id) => {
    const node = getGraphNode(graphView, id);

    await expect(node).toHaveClass(implicitSelectionClass);
    await expect(node).not.toHaveClass(explicitSelectionClass);
  }));

  const pathEdgeIds = [
    'comprehensive-schema.ts->first-level.ts',
    'comprehensive-schema.ts::ComprehensiveSchema->first-level.ts::FirstLevel',
    'first-level.ts->zero-level.ts',
    'first-level.ts->eighth-level.ts',
    'eighth-level.ts->ninth-level.ts',
    'ninth-level.ts->zero-level.ts',
    'first-level.ts::SeventhLevel->eighth-level.ts::EighthLevel',
  ];

  await Promise.all(pathEdgeIds.map((id) => (
    expectActiveEdge(getGraphEdge(graphView, id))
  )));

  const activeNodeIds = new Set(await graphView.locator(
    '.react-flow__node.selected, .react-flow__node.implicitly-selected',
  ).evaluateAll((nodes) => nodes.map((node) => node.dataset['id'])));

  const connectingEdges = await graphView.locator(
    '.react-flow__edge[data-id]',
  ).evaluateAll((edges) => edges.map((edge) => ({
    id: edge.dataset['id'] ?? '',
    isActive: edge.classList.contains('animated'),
  })));

  const inactiveConnections = connectingEdges.filter(({ id, isActive }) => {
    const [source, target] = id.split('->');

    return activeNodeIds.has(source) && activeNodeIds.has(target) && !isActive;
  });

  expect(inactiveConnections).toEqual([]);
});
