import { expect, type Page, test } from '@playwright/test';

import {
  observeLandingDiagnostics,
  scrollSecondScreenTo,
  waitForPlaygroundIllustration,
} from './landing-journey';

async function openFolderingStory(page: Page): Promise<void> {
  await page.goto('/?testingMode=true');

  await scrollFolderingTo(page, 0.05);
  await waitForPlaygroundIllustration(page);
}

async function scrollFolderingTo(page: Page, progress: number): Promise<void> {
  await scrollSecondScreenTo(page, (8 + 3 * progress) / 17);
}

test('02.03 — scroll opens folders, switches examples, and reverses each step', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await openFolderingStory(page);

  const carousel = page.getByRole('region', {
    name: 'OnePassword generated file hierarchy',
  });
  const tree = page.getByRole('tree', { name: 'Generated files' });
  const folderBullet = carousel.getByRole('button', {
    name: 'Show foldering example 1: oas3-onepassword-connect.json',
  });
  const codeBullet = carousel.getByRole('button', {
    name: 'Show foldering example 2: items/update-subset-attributes/index.ts',
  });

  await expect(tree.getByRole('button', { name: 'Expand ./_common' })).toBeVisible();
  await expect(folderBullet).toHaveAttribute('aria-current', 'true');

  await scrollFolderingTo(page, 0.16);
  await expect(tree.getByRole('button', { name: 'Collapse ./_common' })).toBeVisible();

  await scrollFolderingTo(page, 0.31);

  const collapseVaults = tree.getByRole('button', {
    exact: true,
    name: 'Collapse ./vaults',
  });

  await expect(collapseVaults).toBeVisible();
  await collapseVaults.click();
  await expect(tree.getByRole('button', { name: 'Expand ./vaults' })).toBeVisible();

  await scrollFolderingTo(page, 0.46);
  await expect(tree.getByRole('button', {
    exact: true,
    name: 'Collapse ./vaults',
  })).toBeVisible();
  await expect(tree.getByRole('button', {
    name: 'Collapse ./vaults/_common',
  })).toBeVisible();

  await scrollFolderingTo(page, 0.61);
  await expect(codeBullet).toHaveAttribute('aria-current', 'true');
  await expect(carousel.getByRole('group', {
    name: 'Example 2/2: items/update-subset-attributes/index.ts',
  })).toBeVisible();

  await scrollFolderingTo(page, 0.59);
  await expect(folderBullet).toHaveAttribute('aria-current', 'true');
  await expect(tree.getByRole('button', {
    name: 'Collapse ./vaults/_common',
  })).toBeVisible();

  await scrollFolderingTo(page, 0.44);
  await expect(tree.getByRole('button', {
    name: 'Expand ./vaults/_common',
  })).toBeVisible();

  await scrollFolderingTo(page, 0.29);
  await expect(tree.getByRole('button', { name: 'Expand ./vaults' })).toBeVisible();

  await scrollFolderingTo(page, 0.14);
  await expect(tree.getByRole('button', { name: 'Expand ./_common' })).toBeVisible();
  expectNoDiagnostics();
});

test('02.03 — mobile folder drawer lets you expand the generated tree', {
  tag: '@mobile-peel',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await openFolderingStory(page);

  const fileName = 'oas3-onepassword-connect.json';

  await page.getByRole('button', {
    name: `Expand foldering example ${fileName}`,
  }).tap();

  const drawer = page.getByRole('dialog', { name: `foldering example: ${fileName}` });
  const tree = drawer.getByRole('tree', { name: 'Generated files' });

  await expect(drawer).toBeVisible();
  await tree.getByRole('button', { name: 'Expand ./items', exact: true }).tap();
  await expect(tree.getByRole('button', { name: 'Collapse ./items', exact: true }))
    .toBeVisible();
  await drawer.getByRole('button', {
    name: `Collapse foldering example ${fileName}`,
  }).tap();
  await expect(drawer).toBeHidden();
  expectNoDiagnostics();
});

test('02.03 — OnePassword files reveal shared types in domain folders', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await openFolderingStory(page);

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  const illustration = playground.getByRole('region', {
    name: 'OnePassword generated file hierarchy',
  });
  const tree = illustration.getByRole('tree', { name: 'Generated files' });

  await expect(playground.getByText('03 / FOLDERING')).toBeVisible();
  await expect(playground.getByRole('heading', {
    name: 'Files organised by domain',
  })).toBeVisible();
  await expect(illustration).toContainText('widely reused types');
  await expect(tree).toBeVisible();
  await expect(tree.getByRole('button', {
    name: 'Expand ./_common',
  })).toBeVisible();

  await tree.getByRole('button', { name: 'Expand ./items' }).click();
  await expect(tree.getByRole('button', {
    name: 'Expand ./items/_common',
  })).toBeVisible();
  await tree.getByRole('button', { name: 'Expand ./items/_common' }).click();

  const generatedFile = tree.getByRole('treeitem', {
    name: /generator-recipe\.ts/,
  });

  await generatedFile.scrollIntoViewIfNeeded();

  await expect(generatedFile).toBeInViewport();

  await expect(page).toHaveScreenshot('02-03-onepassword-foldering.png');
  expectNoDiagnostics();
});

test('02.03 — foldering carousel shows its domain namespace example', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await openFolderingStory(page);

  const carousel = page.getByRole('region', {
    name: 'OnePassword generated file hierarchy',
  });
  const fileName = 'items/update-subset-attributes/index.ts';
  const bullet = carousel.getByRole('button', {
    name: `Show foldering example 2: ${fileName}`,
  });

  await bullet.click();

  await expect(bullet).toHaveAttribute('aria-current', 'true');
  await expect(carousel.getByRole('group', {
    name: `Example 2/2: ${fileName}`,
  })).toContainText('__Patch');
  await expect(page.getByRole('group', {
    name: `Details header for ${fileName}`,
  })).toBeVisible();
  await expect(page.getByRole('region', {
    name: `Generated code editor for ${fileName}`,
  })).toBeAttached();
  await expect(carousel).toContainText('without collisions');
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip', {
    name: 'Domain namespace with local type exports',
  })).toBeHidden();
  // Capture the carousel after the document scrollbar auto-hides.
  await expect(page.locator('.os-scrollbar-vertical.os-theme-codegena-window'))
    .toHaveCSS('opacity', '0');
  await expect(page).toHaveScreenshot('02-03-domain-namespace.png');
  expectNoDiagnostics();
});

test('02.03 — mobile namespace code opens as a peel drawer', {
  tag: '@mobile-peel',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await openFolderingStory(page);

  const fileName = 'items/update-subset-attributes/index.ts';
  const carousel = page.getByRole('region', {
    name: 'OnePassword generated file hierarchy',
  });

  await carousel.getByRole('button', {
    name: `Show foldering example 2: ${fileName}`,
  }).click();
  await page.getByRole('button', {
    name: `Expand foldering example ${fileName}`,
  }).click();

  const drawer = page.getByRole('dialog', {
    name: `foldering example: ${fileName}`,
  });

  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('PathParametersItemsUpdateSubsetAttributes');
  expectNoDiagnostics();
});

test('02.03 — touchpad scroll moves the folder list', {
  tag: '@desktop-touchpad',
}, async ({ page }) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await openFolderingStory(page);

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });

  const folders = playground.getByRole('region', {
    name: 'Generated OnePassword folders',
  });
  const tree = folders.getByRole('tree', { name: 'Generated files' });

  await tree.getByRole('button', { name: 'Expand ./items' }).click();
  await tree.getByRole('button', { name: 'Expand ./items/_common' }).click();
  await folders.hover();

  const folderScrollBeforeWheel = await tree.evaluate((element) => (
    element.parentElement?.scrollTop ?? 0
  ));
  const pageScrollBeforeWheel = await page.evaluate(() => window.scrollY);

  await page.mouse.wheel(0, 240);

  await expect.poll(() => tree.evaluate((element) => (
    element.parentElement?.scrollTop ?? 0
  ))).toBeGreaterThan(folderScrollBeforeWheel);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBeforeWheel);
  expectNoDiagnostics();
});
