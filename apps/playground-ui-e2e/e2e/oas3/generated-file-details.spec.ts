import { expect, test, type Locator } from '@playwright/test';

const storyUrl = '/iframe.html?id=codegena-playground--'
  + 'one-password-connect-with-persistence&viewMode=story';

async function expectCenteredDeclaration(
  graphView: Locator,
  fileId: string,
  declarationId: string,
): Promise<void> {
  const file = graphView.locator(`.react-flow__node[data-id="${fileId}"]`);
  const declaration = graphView.locator(
    `.react-flow__node[data-id="${declarationId}"]`,
  );

  await expect(file).toBeVisible();
  await expect(file).toHaveClass(/(?:^|\s)implicitly-selected(?:\s|$)/);
  await expect(file).not.toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect(declaration).toBeVisible();
  await expect(declaration).toHaveClass(/(?:^|\s)selected(?:\s|$)/);
  await expect.poll(async () => {
    const [declarationBounds, graphBounds] = await Promise.all([
      declaration.boundingBox(),
      graphView.boundingBox(),
    ]);

    if (!declarationBounds || !graphBounds) {
      return Number.POSITIVE_INFINITY;
    }

    const declarationCenterX = declarationBounds.x + declarationBounds.width / 2;
    const declarationCenterY = declarationBounds.y + declarationBounds.height / 2;
    const graphCenterX = graphBounds.x + graphBounds.width / 2;
    const graphCenterY = graphBounds.y + graphBounds.height / 2;

    return Math.hypot(
      declarationCenterX - graphCenterX,
      declarationCenterY - graphCenterY,
    );
  }).toBeLessThan(40);
}

async function getPendingGeneratedEditorUris(details: Locator): Promise<string[]> {
  return details.evaluate((element) => (
    [...element.querySelectorAll<HTMLElement>('.monaco-editor[data-uri]')]
      .filter((editor) => Boolean(editor.querySelector('.view-lines')
        ?.textContent?.trim()))
      .filter((editor) => editor.closest('[aria-busy]')
        ?.getAttribute('aria-busy') === 'true')
      .flatMap((editor) => editor.dataset['uri'] ?? [])
  ));
}

test('generated glyphs reveal source and center graph declarations', async ({
  page,
}) => {
  await page.goto(storyUrl);

  const showDetails = page.getByRole('button', { name: 'Show details' });

  await expect(showDetails).toBeVisible();
  await showDetails.click();

  const showAll = page.getByRole('button', { name: 'Show all' });

  await expect(showAll).toBeVisible();

  await showAll.click();
  await expect(showAll).toHaveAttribute('aria-pressed', 'true');

  const graphMode = page.getByRole('button', { name: 'Graph', exact: true });

  await expect(graphMode).toBeVisible();

  await expect(graphMode).toHaveAttribute('aria-pressed', 'true');

  const graphView = page.locator('.react-flow');
  const sourceEditor = page.locator('.Playground__source .monaco-editor');
  const details = page.locator('.GeneratedFileDetails__root');
  const errorResponseCard = details.locator('.GeneratedFileDetailsFile__root')
    .filter({
      has: page.getByText('_common/error-response.ts', { exact: true }),
    });

  const errorResponseGlyph = errorResponseCard.getByRole('button', {
    name: 'Reveal ErrorResponse in source schema at line 1420',
  });

  await expect(errorResponseGlyph.getByRole('img', { name: 'Interface' }))
    .toBeVisible();
  await errorResponseGlyph.click();

  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('1420');
  await expect(sourceEditor.locator('.view-line').filter({
    hasText: '"ErrorResponse"',
  })).toBeVisible();
  await expectCenteredDeclaration(
    graphView,
    '_common/error-response.ts',
    '_common/error-response.ts::ErrorResponse',
  );

  await details.evaluate((element) => {
    element.scrollTop = element.scrollHeight * 0.75;
  });

  const patchCard = details.locator('.GeneratedFileDetailsFile__root')
    .filter({
      has: page.getByText('items/update-subset-attributes/patch.ts', {
        exact: true,
      }),
    });

  const patchGlyph = patchCard.getByRole('button', {
    name: 'Reveal Patch in source schema at line 1862',
  });

  await expect(patchGlyph.getByRole('img', { name: 'Array' })).toBeVisible();
  await patchGlyph.click();

  await expect(sourceEditor.locator('.line-numbers.active-line-number'))
    .toHaveText('1862');
  await expect(sourceEditor.locator('.view-line').filter({
    hasText: '"Patch"',
  })).toBeVisible();
  await expectCenteredDeclaration(
    graphView,
    'items/update-subset-attributes/patch.ts',
    'items/update-subset-attributes/patch.ts::Patch',
  );
  await expect(showAll).toHaveAttribute('aria-pressed', 'true');
});

test('generated editors keep colors through scrolling', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(storyUrl);
  await page.getByRole('button', { name: 'Show details' }).click();
  await page.getByRole('button', { name: 'Show all' }).click();

  const details = page.getByRole('region', { name: 'Generated file details' });

  await expect(details.locator('.monaco-editor .view-line').first())
    .toBeVisible();

  const initialUris = await details.evaluate((element) => (
    [...element.querySelectorAll<HTMLElement>('.monaco-editor[data-uri]')]
      .flatMap((editor) => editor.dataset['uri'] ?? [])
  ));

  await details.evaluate((element) => {
    const ready = new Set<string>();
    const releasedBeforeColor = new Set<string>();
    const uncolored = new Set<string>();
    const pendingAgain = new Set<string>();

    const inspect = (): void => {
      element.querySelectorAll<HTMLElement>('.monaco-editor[data-uri]')
        .forEach((editor) => {
          const uri = editor.dataset['uri'];
          const hasText = Boolean(editor.querySelector('.view-lines')
            ?.textContent?.trim());

          if (!uri || !hasText) {
            return;
          }

          const isPending = editor.closest('[aria-busy]')
            ?.getAttribute('aria-busy') === 'true';
          const hasSyntaxColor = Boolean(editor.querySelector(
            '.view-line span[class*="mtk"]:not(.mtk1)',
          ));

          if (isPending && ready.has(uri)) {
            pendingAgain.add(uri);
          }

          if (!isPending && !hasSyntaxColor) {
            releasedBeforeColor.add(uri);
          }

          if (!isPending && hasSyntaxColor) {
            if (releasedBeforeColor.has(uri)) {
              uncolored.add(uri);
            }

            ready.add(uri);
          }
        });
    };

    const observer = new MutationObserver(inspect);

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['aria-busy', 'class'],
      childList: true,
      subtree: true,
    });
    inspect();

    Object.assign(window, {
      generatedEditorColorCheck: {
        observer,
        pendingAgain,
        ready,
        uncolored,
      },
    });
  });

  const [pointerX, pointerY] = await details.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return [
      bounds.x + 6,
      bounds.y + bounds.height / 2,
    ];
  });

  await page.mouse.move(pointerX, pointerY);

  for (const offset of [200, 400, 600, 800, 1000, 1200]) {
    const previousScrollTop = await details.evaluate((element) => element.scrollTop);

    await page.mouse.wheel(0, offset);
    await expect.poll(async () => details.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(previousScrollTop);
    await expect.poll(() => getPendingGeneratedEditorUris(details)).toEqual([]);
  }

  const finalUris = await details.evaluate((element) => (
    [...element.querySelectorAll<HTMLElement>('.monaco-editor[data-uri]')]
      .flatMap((editor) => editor.dataset['uri'] ?? [])
  ));

  const result = await page.evaluate(() => {
    const check = Reflect.get(window, 'generatedEditorColorCheck') as {
      observer: MutationObserver;
      pendingAgain: Set<string>;
      ready: Set<string>;
      uncolored: Set<string>;
    };

    check.observer.disconnect();

    return {
      pendingAgain: [...check.pendingAgain],
      uncolored: [...check.uncolored],
    };
  });

  expect(finalUris.some((uri) => !initialUris.includes(uri))).toBe(true);
  expect(result.uncolored).toEqual([]);
  expect(result.pendingAgain).toEqual([]);
});
