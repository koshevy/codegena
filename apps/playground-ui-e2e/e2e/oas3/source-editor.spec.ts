import { expect, test } from '@playwright/test';

test('colors the large GitHub specification after graph conversion', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.clock.install();

  await page.goto(
    '/iframe.html?id=codegena-playground--git-hub-rest-api-with-persistence'
    + '&viewMode=story',
  );
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  const sourceFrame = page.locator('.Playground__source [aria-busy]');

  await expect(sourceFrame).toHaveAttribute('aria-busy', 'false', {
    timeout: 20_000,
  });

  await page.evaluate(() => {
    const source = document.querySelector('.Playground__source');

    if (!source) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (source.querySelector('[aria-busy="true"]')) {
        document.documentElement.dataset['sourceReturnedToPending'] = 'true';
      }
    });

    observer.observe(source, {
      attributeFilter: ['aria-busy'],
      attributes: true,
      childList: true,
      subtree: true,
    });
  });

  // Exercise delayed editor work without relying on a wall-clock sleep.
  await page.clock.runFor(20_000);

  await expect(sourceFrame).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-source-returned-to-pending',
    'true',
  );
  await expect(sourceFrame.locator(
    '.view-line span[class*="mtk"]:not(.mtk1)',
  ).first()).toBeVisible();
});

test('blends JSON syntax in after reloading with both side panels open', async ({
  page,
}) => {
  await page.goto(
    '/iframe.html?id=codegena-playground--one-password-connect-with-persistence'
    + '&viewMode=story',
  );
  await expect(page.getByRole('group', { name: 'Generated output header' }))
    .toBeVisible();

  const showDetails = page.getByRole('button', { name: 'Show details' });

  await expect(page.getByRole('button', { name: 'Hide source schema' }))
    .toBeVisible();
  await showDetails.click();
  await expect(page.getByRole('button', { name: 'Hide details' }))
    .toBeVisible();

  await page.addInitScript(() => {
    const inspect = (): void => {
      const frame = document.querySelector('.Playground__source [aria-busy]');
      const hasCode = Boolean(frame?.querySelector('.view-lines')
        ?.textContent?.trim());
      const hasColoredTokens = Boolean(frame?.querySelector(
        '.view-line span[class*="mtk"]:not(.mtk1)',
      ));

      if (frame?.getAttribute('aria-busy') === 'true') {
        document.documentElement.dataset['sourceSawPending'] = 'true';
      }

      if (hasCode
        && !hasColoredTokens
        && frame?.getAttribute('aria-busy') === 'false'
      ) {
        document.documentElement.dataset['sourceReleasedBeforeColor'] = 'true';
      }
    };

    const observer = new MutationObserver(inspect);

    observer.observe(document, {
      attributeFilter: ['aria-busy', 'class'],
      attributes: true,
      childList: true,
      subtree: true,
    });

    document.addEventListener('transitionrun', (event) => {
      if (event instanceof TransitionEvent
        && event.propertyName === '-webkit-text-fill-color'
        && event.target instanceof Element
        && event.target.closest('.Playground__source')
      ) {
        document.documentElement.dataset['sourceSyntaxBlendStarted'] = 'true';
      }
    });
  });

  await page.reload();

  const sourceFrame = page.locator('.Playground__source [aria-busy]');

  await expect(page.getByRole('button', { name: 'Hide source schema' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide details' }))
    .toBeVisible();
  await expect(sourceFrame).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-source-saw-pending', 'true');
  await expect(page.locator('html')).toHaveAttribute(
    'data-source-syntax-blend-started',
    'true',
  );
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-source-released-before-color',
    'true',
  );
});
