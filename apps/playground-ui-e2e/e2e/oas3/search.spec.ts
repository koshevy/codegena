import { expect, type Locator, test } from '@playwright/test';

import {
  expectGeneratedLine,
  expectSourceLine,
  getFileCard,
} from './file-details-navigation';

const storyUrl = '/iframe.html?id=codegena-playground--'
  + 'one-password-connect-with-persistence&viewMode=story';
const searchName = [
  'Search generated files, directories, declarations,',
  'specification, and warnings',
].join(' ');

async function scrollToSuggestion(
  listbox: Locator,
  name: RegExp,
): Promise<void> {
  const suggestion = listbox.getByRole('option', { name }).first();

  await suggestion.scrollIntoViewIfNeeded();
  await expect(suggestion).toBeInViewport();
}

test.use({ viewport: { height: 720, width: 1280 } });

test('keeps search available without console errors after reloading the story', async ({
  page,
}) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      errors.push(message.text());
    }
  });

  await page.goto(storyUrl);
  await page.getByRole('button', { name: 'Search in files and directories' }).click();
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.getByRole('combobox', { name: searchName }).press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'Search in files and directories' }).click();
  await expect(page.getByRole('option').first()).toBeVisible();

  const searchResponse = page.waitForResponse((response) => {
    const request = response.request();

    return response.url().endsWith('/api/graph-search')
      && request.method() === 'POST'
      && request.postDataJSON()?.action === 'search'
      && request.postDataJSON()?.query === 'ApiRequest';
  });

  await page.getByRole('combobox', { name: searchName }).fill('ApiRequest');

  const result = await searchResponse;

  expect(result.status()).toBe(200);
  await expect(page.getByRole('option', { name: /^ApiRequest\b/ })).toBeVisible();

  expect(errors).toEqual([]);
});

test('shows compact default suggestions without scrolling', async ({ page }) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const warning = page.getByRole('option', {
    name: /^Warning: Property "maximum"/,
  });

  await expect(warning).toBeInViewport({ ratio: 1 });
});

async function expectToStayMountedWhile(
  element: Locator,
  action: () => Promise<void>,
): Promise<void> {
  const monitor = await element.evaluateHandle((current) => {
    const state = { wasRemoved: false };
    const observer = new MutationObserver(() => {
      if (!current.isConnected) {
        state.wasRemoved = true;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return { observer, state };
  });

  await action();

  const wasRemoved = await monitor.evaluate(({ observer, state }) => {
    observer.disconnect();

    return state.wasRemoved;
  });

  await monitor.dispose();
  await expect(element).toBeVisible();
  expect(wasRemoved).toBe(false);
}

test('search reveals a declaration across the generated and source views', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const drawer = page.getByRole('dialog', {
    name: 'Search generated files and directories',
  });
  const centerOffset = await drawer.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return Math.abs(bounds.left + bounds.width / 2 - window.innerWidth / 2);
  });

  expect(centerOffset).toBeLessThan(2);

  const searchResponse = page.waitForResponse((response) => {
    const request = response.request();

    return response.url().endsWith('/api/graph-search')
      && request.method() === 'POST'
      && request.postDataJSON()?.action === 'search'
      && request.postDataJSON()?.query === 'ApiRequest';
  });

  await page.getByRole('combobox', {
    name: searchName,
  }).fill('ApiRequest');

  const searchResult = await searchResponse;

  expect(searchResult.status()).toBe(200);

  const result: unknown = await searchResult.json();

  const declaration = expect.objectContaining({
    kind: 'declaration', title: 'ApiRequest',
  });

  expect(result).toMatchObject({
    isTruncated: false,
    suggestions: expect.arrayContaining([declaration]),
  });

  await page.getByRole('option', { name: /^ApiRequest\b/ }).click();

  await expect(drawer).toBeHidden();
  await expect(page.getByRole('button', { name: 'Hide source schema' }))
    .toBeVisible();
  await expect(page.getByRole('button', { name: 'Hide details' }))
    .toBeVisible();
  await expect(page.getByRole('group', {
    name: 'ApiRequest declaration',
  })).toHaveClass(/\bselected\b/);

  const card = getFileCard(page, 'activity/api-request.ts');

  await expect(card).toBeInViewport();
  await expectGeneratedLine(card, 5, 'interface ApiRequest');
  await expectSourceLine(page, 1775, '"APIRequest"');
});

test('search excerpt and generated editor reveal the same TCode line', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();
  await page.getByRole('combobox', { name: searchName }).fill('TCode');

  const result = page.getByRole('option').filter({
    has: page.getByRole('list', { name: 'Matching code excerpt' }).getByText(
      'TCode',
      { exact: true },
    ),
  }).first();

  await expect(result).toBeVisible();

  const excerptLines = result.getByRole('list', {
    name: 'Matching code excerpt',
  }).getByRole('listitem');

  expect(await excerptLines.count()).toBeGreaterThan(1);

  const matchingLine = excerptLines.filter({ hasText: 'TCode extends' }).first();
  const matchingLineText = await matchingLine.innerText();
  const matchingLineNumber = Number(
    matchingLineText.match(/^\s*(\d+)/)?.[1],
  );

  expect(matchingLineNumber).toBeGreaterThan(0);

  await result.click();

  const card = getFileCard(
    page,
    'files/get-file-details/response-files-get-file-details.ts',
  );

  await expect(card).toBeVisible();
  await expectGeneratedLine(card, matchingLineNumber, 'TCode extends');
});

test('double Shift opens search from the page', async ({ page }) => {
  await page.goto(storyUrl);
  await page.getByRole('button', { name: 'Appearance preferences' }).focus();

  const drawer = page.getByRole('dialog', {
    name: 'Search generated files and directories',
  });

  await page.keyboard.press('Shift');
  await expect(drawer).toBeHidden();

  await page.keyboard.press('a');
  await page.keyboard.press('Shift');
  await page.keyboard.press('Shift');
  await expect(drawer).toBeVisible();
  await expect(page.getByRole('combobox', { name: searchName })).toBeFocused();
});

test('search explains an unmatched query and closes with Escape', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', {
    name: searchName,
  });

  await search.fill('no-such-generated-symbol');
  await expect(page.getByRole('status', {
    name: 'No search results',
  })).toBeVisible();
  await expect(search).toHaveAttribute('aria-expanded', 'false');
  await search.press('Escape');
  await expect(page.getByRole('dialog', {
    name: 'Search generated files and directories',
  })).toBeHidden();
});

test('search keeps matching suggestions open while typing', async ({ page }) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', { name: searchName });
  const listbox = page.getByRole('listbox');

  await expect(listbox).toBeVisible();
  await expectToStayMountedWhile(listbox, () => (
    search.pressSequentially('Represents a req', { delay: 150 })
  ));

  await search.pressSequentially('q', { delay: 150 });

  const emptyState = page.getByRole('status', { name: 'No search results' });

  await expect(emptyState).toBeVisible();
  await expectToStayMountedWhile(emptyState, () => (
    search.pressSequentially('q', { delay: 150 })
  ));
});

test('search keeps a matching suggestion enabled while typing', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', { name: searchName });

  await search.fill('Request item ap');

  const suggestion = page.getByRole('option', {
    name: /^ApiRequest\b/,
  });

  await expect(suggestion).toBeVisible();
  await expect(suggestion).toHaveAttribute('aria-disabled', 'false');

  const monitor = await suggestion.evaluateHandle((element) => {
    const state = { wasDisabled: false, wasRemoved: false };
    const observer = new MutationObserver(() => {
      state.wasDisabled ||= element.getAttribute('aria-disabled') === 'true';
      state.wasRemoved ||= !element.isConnected;
    });

    observer.observe(element, {
      attributeFilter: ['aria-disabled'],
      attributes: true,
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return { observer, state };
  });

  await search.pressSequentially('i', { delay: 150 });

  const observedState = await monitor.evaluate(({ observer, state }) => {
    observer.disconnect();

    return state;
  });

  await monitor.dispose();
  await expect(suggestion).toBeVisible();
  expect(observedState.wasDisabled).toBe(false);
  expect(observedState.wasRemoved).toBe(false);
});

test('search offers warnings collected from the generated graph', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  await page.getByRole('combobox', {
    name: searchName,
  }).fill('Property "maximum"');

  const warning = page.getByRole('option', {
    name: /^Warning: .*Property "maximum"/,
  }).first();

  await expect(warning).toBeVisible();
  await warning.click();

  await expect(page.getByRole('dialog', {
    name: 'Search generated files and directories',
  })).toBeHidden();
  await expect(page.getByRole('button', {
    name: 'Hide source schema',
  })).toBeVisible();
  await expectSourceLine(page, 1526, '"length": {');
  await expect(page.getByRole('region', {
    name: 'Generated file details',
  }).getByRole('article', {
    name: /^Warning: oas3-onepassword-connect\.json:/,
  }).first()).toBeInViewport();
});

test('search shows file paths once and names each declaration file', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', {
    name: searchName,
  });

  await search.fill('error-response.ts');

  const file = page.getByRole('option', {
    name: /_common\/error-response\.ts/,
  });

  await expect(file).toContainText('_common/error-response.ts');

  const fileText = await file.innerText();

  expect(fileText.split('error-response.ts')).toHaveLength(2);

  await search.fill('ApiRequest');

  const declaration = page.getByRole('option', {
    name: /^ApiRequest\b/,
  });

  await expect(declaration.getByText('api-request.ts', {
    exact: true,
  })).toBeVisible();
});

test('search remembers a visited declaration after a page reload', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', { name: searchName });

  await search.fill('ApiRequest');
  await page.getByRole('option', { name: /^ApiRequest\b/ }).click();
  await page.reload();
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  await expect(page.getByRole('option').first()).toContainText('ApiRequest');
});

test('search navigates to matched source specification text', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();
  await page.getByRole('combobox', {
    name: searchName,
  }).fill('WaitingForAPIRequest');
  await page.getByRole('option', {
    name: /oas3-onepassword-connect\.json/,
  }).click();

  await expectSourceLine(page, 1358, '"WaitingForAPIRequest": {');
  await expect(page.getByRole('combobox', { name: searchName })).toBeHidden();
});

test('search remembers a declaration selected in the graph', async ({
  page,
}) => {
  await page.goto(storyUrl);
  await page.getByRole('group', {
    name: 'Api1PasswordConnect declaration',
  }).click();
  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  await expect(page.getByRole('option').first()).toContainText(
    'Api1PasswordConnect',
  );
});

test('search synchronizes recent visits between open tabs', async ({
  context,
  page,
}) => {
  await page.goto(storyUrl);

  const secondPage = await context.newPage();

  await secondPage.goto(storyUrl);
  await secondPage.getByRole('button', {
    name: 'Search in files and directories',
  }).click();
  await expect(secondPage.getByRole('option').first()).toBeVisible();

  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();
  await page.getByRole('combobox', { name: searchName }).fill('ApiRequest');
  await page.getByRole('option', { name: /^ApiRequest\b/ }).click();

  await expect(secondPage.getByRole('option').first()).toContainText(
    'ApiRequest',
  );
});

test('keeps files and declarations in broad GitHub search results', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(
    '/iframe.html?id=codegena-playground--git-hub-rest-api-with-persistence'
    + '&viewMode=story',
  );
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', { name: searchName });

  await search.fill('copilot');

  const listbox = page.getByRole('listbox');

  await expect(listbox.getByRole('option', {
    name: /^\.\/copilot\b/,
  }).first()).toBeVisible();

  await scrollToSuggestion(listbox, /^Copilot[A-Z].*\.ts/);
  await expect(listbox.getByRole('option', {
    name: /^Copilot[A-Z].*\.ts/,
  }).first()).toBeVisible();

  await scrollToSuggestion(listbox, /^TypeScript .*copilot/i);
  await expect(listbox.getByRole('option', {
    name: /^TypeScript .*copilot/i,
  }).first()).toBeVisible();
  await expect(page.getByRole('status', {
    name: 'Only part of found items are shown. Continue typing to refine result.',
  })).toBeVisible();

  await search.fill('CopilotSeatDetails');

  await expect(listbox.getByRole('option', {
    name: /^CopilotSeatDetails\b/,
  })).toBeVisible();
  await scrollToSuggestion(
    listbox,
    /^TypeScript copilot\/_common\/copilot-seat-details\.ts/,
  );
  await expect(listbox.getByRole('option', {
    name: /^TypeScript copilot\/_common\/copilot-seat-details\.ts/,
  })).toBeVisible();
  await expect(page.getByRole('status', {
    name: 'Only part of found items are shown. Continue typing to refine result.',
  })).toBeHidden();
});

test('keeps keyboard navigation usable across the large suggestion list', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(
    '/iframe.html?id=codegena-playground--git-hub-rest-api-with-persistence'
    + '&viewMode=story',
  );
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', { name: searchName });

  await search.fill('User');
  await search.press('End');

  await expect(search).toHaveAttribute('aria-activedescendant', /\S/);

  const activeOptionId = await search.getAttribute('aria-activedescendant');

  const activeOption = page.locator(`[id="${activeOptionId}"]`);

  await expect(activeOption).toBeInViewport();

  await search.press('Enter');
  await expect(page.getByRole('dialog', {
    name: 'Search generated files and directories',
  })).toBeHidden();
});

test('prioritizes matching-case declaration titles and file excerpts', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(
    '/iframe.html?id=codegena-playground--git-hub-rest-api-with-persistence'
    + '&viewMode=story',
  );
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();

  const search = page.getByRole('combobox', { name: searchName });
  const firstOption = page.getByRole('listbox').getByRole('option').first();

  await search.fill('User');
  await expect(firstOption).toHaveAccessibleName(/^User/);

  await search.fill('user');
  await expect(firstOption).toHaveAccessibleName(/^\.\/users/);
});

test('reveals the same-case Users match in the specification excerpt', async ({
  page,
}) => {
  test.setTimeout(120_000);

  await page.goto(
    '/iframe.html?id=codegena-playground--git-hub-rest-api-with-persistence'
    + '&viewMode=story',
  );
  await expect(page.getByRole('status', {
    name: '5257 generated files in this specification',
  })).toBeVisible({ timeout: 90_000 });

  await page.getByRole('button', {
    name: 'Search in files and directories',
  }).click();
  await page.getByRole('combobox', { name: searchName }).fill('Users');

  const listbox = page.getByRole('listbox');
  const specificationGroup = listbox.getByText('Specification', {
    exact: true,
  });

  await scrollToSuggestion(listbox, /oas3-api-github-com\.json/);
  await expect(specificationGroup).toBeVisible();

  const specification = listbox.getByRole('option', {
    name: /oas3-api-github-com\.json/,
  });
  const excerpt = specification.getByRole('list', {
    name: 'Matching code excerpt',
  });

  await expect(excerpt.getByText('Users', { exact: true }))
    .toBeInViewport({ ratio: 1 });

  const scrollState = await excerpt.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollLeft: element.scrollLeft,
    scrollWidth: element.scrollWidth,
  }));

  expect(scrollState.scrollWidth).toBeGreaterThan(scrollState.clientWidth);
  expect(scrollState.scrollLeft).toBeGreaterThan(0);

  const matchedLine = excerpt.getByRole('listitem').filter({
    hasText: 'Users',
  }).first();
  const lineNumber = matchedLine.getByText(/^\d+$/).first();
  const gutterLeft = await lineNumber.evaluate((element) => (
    element.getBoundingClientRect().left
  ));

  await excerpt.hover();
  await page.mouse.wheel(-500, 0);

  const gutterLeftAfterScroll = await lineNumber.evaluate((element) => (
    element.getBoundingClientRect().left
  ));

  expect(Math.abs(gutterLeftAfterScroll - gutterLeft)).toBeLessThan(2);
  await expect(specification.locator('.os-scrollbar-horizontal.os-theme-codegena'))
    .toHaveCount(1);
});
