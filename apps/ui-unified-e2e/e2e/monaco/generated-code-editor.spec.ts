import { getStoryUrl } from '@codegena/util-e2e';
import { expect, test } from '@playwright/test';

test('shimmers pending generated code without changing its typography', async ({
  page,
}) => {
  const storyIdPrefix = 'codegena-unified-ui-monaco-generated-code-editor--';

  await page.goto(getStoryUrl(`${storyIdPrefix}pending-syntax`));

  const pendingLine = page.locator('.monaco-editor .view-line').first();
  const pendingText = pendingLine.locator(':scope > span');

  await expect(pendingText).toBeVisible();
  await expect(pendingText).toHaveCSS(
    'animation-name',
    'codegena-code-text-shimmer',
  );

  const pendingBackgroundImage = await pendingText.evaluate((element) => (
    getComputedStyle(element).backgroundImage
  ));
  const pendingStyles = await pendingLine.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
    };
  });

  expect(pendingBackgroundImage).toContain('rgb(119, 78, 145)');
  expect(pendingBackgroundImage).toContain('rgb(88, 138, 213)');
  expect(pendingBackgroundImage).toContain('rgb(124, 159, 27)');

  await page.goto(getStoryUrl(`${storyIdPrefix}ready`));

  const readyLine = page.locator('.monaco-editor .view-line').first();
  const readyText = readyLine.locator(':scope > span');

  await expect(readyText).toBeVisible();
  await expect(readyText).toHaveCSS('animation-name', 'none');

  const readyStyles = await readyLine.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
    };
  });

  expect(readyStyles).toEqual({
    fontFamily: pendingStyles.fontFamily,
    fontSize: pendingStyles.fontSize,
    fontWeight: pendingStyles.fontWeight,
    lineHeight: pendingStyles.lineHeight,
  });
});

test('uses dark theme colors for the pending shimmer', async ({ page }) => {
  await page.goto(
    getStoryUrl('codegena-unified-ui-monaco-generated-code-editor--dark-pending-syntax'),
  );

  const pendingLine = page.locator('.monaco-editor .view-line > span').first();

  await expect(pendingLine).toBeVisible();
  await expect(pendingLine).toHaveCSS(
    'animation-name',
    'codegena-code-text-shimmer',
  );

  const backgroundImage = await pendingLine.evaluate((element) => (
    getComputedStyle(element).backgroundImage
  ));

  expect(backgroundImage).toContain('rgb(155, 123, 181)');
  expect(backgroundImage).toContain('rgb(106, 158, 224)');
  expect(backgroundImage).toContain('rgb(150, 185, 58)');
});

test('finishes pending syntax for default-colored TypeScript', async ({
  page,
}) => {
  await page.goto(
    getStoryUrl('codegena-unified-ui-monaco-generated-code-editor--plain-identifier'),
  );

  const editor = page.getByRole('code');
  const line = editor.locator('.view-line').first();

  await expect(line).toHaveText('identifier');
  await expect(line.locator('span[class*="mtk"]:not(.mtk1)')).toHaveCount(0);
  await expect(line.locator(':scope > span')).toHaveCSS('animation-name', 'none');
});

test('blends pending text into syntax colors over 300 ms', async ({ page }) => {
  await page.goto(
    getStoryUrl('codegena-unified-ui-monaco-generated-code-editor--syntax-reveal'),
  );

  const line = page.locator('.monaco-editor .view-line').first();
  const text = line.locator(':scope > span');
  const editor = page.getByRole('code');

  await expect(text).toBeVisible();
  await expect(text).toHaveCSS(
    'animation-name',
    'codegena-code-text-shimmer',
  );

  await editor.evaluate((element) => {
    element.addEventListener('transitionrun', (event) => {
      if (event instanceof TransitionEvent
        && event.propertyName === '-webkit-text-fill-color'
        && element instanceof HTMLElement
      ) {
        element.dataset['syntaxTransitionStarted'] = 'true';
      }
    });
  });

  await page.getByRole('button', { name: 'Apply syntax colors' }).click();

  await expect(editor).toHaveAttribute('data-syntax-transition-started', 'true');
  await expect(text).toHaveCSS('transition-duration', '0.3s');
  await expect(text).toHaveCSS('animation-name', 'none');

  const syntaxToken = line.locator('span[class*="mtk"]:not(.mtk1)').first();

  await expect(syntaxToken).toBeVisible();
  await expect.poll(() => syntaxToken.evaluate((element) => {
    const styles = getComputedStyle(element);

    return styles.webkitTextFillColor === styles.color;
  })).toBe(true);
});

test('shows steady pending text when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(
    getStoryUrl('codegena-unified-ui-monaco-generated-code-editor--pending-syntax'),
  );

  const pendingLine = page.locator('.monaco-editor .view-line > span').first();

  await expect(pendingLine).toBeVisible();
  await expect(pendingLine).toHaveCSS('animation-name', 'none');
  await expect(pendingLine).toHaveCSS(
    '-webkit-text-fill-color',
    'rgb(119, 78, 145)',
  );
});
