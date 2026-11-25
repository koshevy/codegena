import { expect, type Locator, type Page, test } from '@playwright/test';

import {
  freezeSvgAnimation,
  observeLandingDiagnostics,
  scrollLandingTo,
  waitForGeneratedCodeIllustration,
  waitForWelcomeEntrance,
} from './landing-journey';

const openingHeading = 'Code generation on steroids you\'ve always dreamed of.';
const finalHeading = 'You don\'t need expensive models. You need deterministic tools.';
const navigationLabels = [
  'Docs',
  'Roadmap and status',
  'Ideology',
  'Blog',
  'About',
  'Contacts',
  'GitHub',
  'Get started',
  'Playground',
] as const;

async function expectMenuActionPlacement(
  navigation: Locator,
  isNarrow: boolean,
): Promise<void> {
  // Sample one animation frame so the entering drawer cannot shift between reads.
  const [
    docs,
    roadmap,
    started,
    playground,
  ] = await navigation.getByRole('link')
    .filter({ hasText: /^(Docs|Roadmap and status|Get started|Playground)$/ })
    .evaluateAll((links) => links.map((link) => {
      const { x, y, width } = link.getBoundingClientRect();

      return { x, y, width };
    }));

  if (!docs || !started || !playground || !roadmap) {
    throw new Error('The menu links must be visible to check their columns.');
  }

  expect(started.x).toBeCloseTo(playground.x, 0);

  if (isNarrow) {
    expect(started.x).toBeCloseTo(docs.x, 0);
    return;
  }

  expect(started.x).toBeGreaterThan(docs.x + docs.width);
  expect(playground.y - started.y).toBeCloseTo(roadmap.y - docs.y, 0);
}

async function revealLandingNavigation(page: Page): Promise<Locator> {
  const menuToggle = page.getByRole('button', {
    name: 'Open navigation menu',
  });

  if (await menuToggle.isVisible()) {
    await menuToggle.click();

    return page.getByRole('navigation', { name: 'Navigation drawer' });
  }

  return page.getByRole('banner', { name: 'Landing navigation' });
}

async function expectSecondScreenPeelClearance(
  page: Page,
  hasProgressLine: boolean,
): Promise<void> {
  const stageTop = await page.getByRole('region', {
    name: 'Landing feature sections',
  }).evaluate((section) => (
    section.firstElementChild?.getBoundingClientRect().top ?? Infinity
  ));
  const buttonBounds = await page.getByRole('button', {
    name: 'Playground',
  }).boundingBox();
  const footerBounds = await page.getByRole('region', {
    name: 'Welcome',
  }).getByText('SCROLL TO DISCOVER').boundingBox();
  const viewportHeight = await page.evaluate(() => window.innerHeight);

  if (!buttonBounds) {
    throw new Error('Hero actions must be visible beside the second-screen peel.');
  }

  const hasMissingProgressLine = hasProgressLine && !footerBounds;

  if (hasMissingProgressLine) {
    throw new Error('The progress line must stay visible on wide screens.');
  }

  expect(viewportHeight - stageTop).toBeGreaterThanOrEqual(20);
  expect(stageTop - buttonBounds.y - buttonBounds.height)
    .toBeGreaterThanOrEqual(32);
  if (footerBounds) {
    expect(stageTop - footerBounds.y - footerBounds.height)
      .toBeGreaterThanOrEqual(0);
  }
}

test('01.01 — welcome screen opens with the brand and primary actions', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);
  await freezeSvgAnimation(page.getByRole('img', { name: 'Codegena logo' }));

  await expect(page).toHaveTitle('Codegena — OpenAPI to TypeScript');
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('heading', {
    level: 1,
    name: openingHeading,
  })).toBeVisible();
  await expect(page.getByRole('paragraph').filter({
    hasText: 'AI-friendly, deterministic code generation from OpenAPI',
  })).toBeVisible();
  await expect(page.getByRole('img', {
    name: 'Codegena logo',
  })).toBeVisible();
  await expect(page.getByRole('button', {
    name: 'Playground',
  })).toBeVisible();
  await expect(page.getByRole('button', {
    name: 'How it works',
  })).toBeVisible();
  await expect(page.getByRole('status', {
    includeHidden: true,
    name: 'Landing section 1 of 8',
  })).toBeVisible({ visible: !isMobile });

  await expect(page).toHaveScreenshot('01-01-welcome.png');
  expectNoDiagnostics();
});

test('01.02 — scrolling transforms the welcome into the next screen', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);
  await freezeSvgAnimation(page.getByRole('img', { name: 'Codegena logo' }));

  await scrollLandingTo(page, 75);
  await expect(page.getByRole('heading', {
    level: 1,
    name: openingHeading,
  })).toBeVisible();
  await expect(page.getByRole('paragraph').filter({
    hasText: 'AI-friendly, deterministic code generation from OpenAPI',
  })).toBeVisible();
  await expect.soft(page).toHaveScreenshot('01-02-title-starts-moving.png');
  expectNoDiagnostics();

  await scrollLandingTo(page, 220);
  await expect(page.getByRole('paragraph').filter({
    hasText: 'The main idea is to stop spending tokens',
  })).toBeVisible();
  await expect.soft(page).toHaveScreenshot('01-03-intro-starts-changing.png');
  expectNoDiagnostics();

  await scrollLandingTo(page, 450);
  await expect(page.getByRole('paragraph').filter({
    hasText: 'The main idea is to stop spending tokens',
  })).toBeVisible();
  await expect.soft(page).toHaveScreenshot('01-04-idea-replaces-intro.png');
  expectNoDiagnostics();

  await scrollLandingTo(page, 550);
  await expect(page.getByText('npm i @codegena/oapi3ts@4')).toBeVisible();
  await expect.soft(page).toHaveScreenshot('01-05-install-and-prompt-enter.png');
  expectNoDiagnostics();

  await scrollLandingTo(page, 790);
  await expect(page.getByRole('heading', {
    name: 'Prompt for your AI assistant',
  })).toBeVisible();
  await expect(page.getByRole('textbox', {
    name: 'Prompt to copy into your AI assistant',
  })).toHaveValue(/Fetch and apply skills/);
  await expect(page.getByRole('button', {
    name: 'See more',
  })).toBeVisible();

  const title = page.getByRole('heading', { level: 1 });
  const titleColor = await title.evaluate((heading) => getComputedStyle(heading).color);
  const closingLine = title.getByText('You need deterministic tools.', { exact: true });

  await expect(closingLine).not.toHaveCSS('color', titleColor);
  await expect.soft(page).toHaveScreenshot('01-06-prompt-ready.png');
  expectNoDiagnostics();

  await scrollLandingTo(page, 900);
  await expect(page.getByRole('heading', {
    level: 1,
    name: finalHeading,
  })).toBeVisible();
  await expect(closingLine).toHaveCSS('color', titleColor);
  await expect.soft(page).toHaveScreenshot('01-07-final-headline.png');
  expectNoDiagnostics();

  await scrollLandingTo(page, 1900);
  await waitForGeneratedCodeIllustration(page);
  await expect(page.getByRole('region', {
    name: 'Landing feature sections',
  })).toBeVisible();
  await expect(page.getByRole('heading', {
    name: 'Most detailed JSON Schema support',
  })).toBeVisible();
  await expect.soft(page).toHaveScreenshot('01-08-second-screen.png');
  expectNoDiagnostics();
});

test('01.05 — hero actions lead to the prompt, feature story, and playground', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);

  const howItWorks = page.getByRole('button', { name: 'How it works' });
  const initialActionWidth = await howItWorks.evaluate((element) => (
    element.getBoundingClientRect().width
  ));

  await howItWorks.click();
  await expect(page.getByRole('heading', {
    name: 'Prompt for your AI assistant',
  })).toBeVisible();
  await expect(page.getByRole('heading', {
    level: 1,
    name: finalHeading,
  })).toBeVisible();
  await expect(page.getByRole('button', { name: 'See more' })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.scrollY))
    .toBe(900);

  const nextActionWidth = await page.getByRole('button', {
    name: 'See more',
  }).evaluate((element) => element.getBoundingClientRect().width);

  expect(nextActionWidth).toBe(initialActionWidth);
  await expectSecondScreenPeelClearance(page, !isMobile);

  await scrollLandingTo(page, 790);
  await expectSecondScreenPeelClearance(page, !isMobile);

  await page.getByRole('button', { name: 'See more' }).click();
  await expect(page.getByRole('heading', {
    name: 'Most detailed JSON Schema support',
  })).toBeVisible();

  await page.reload();
  await waitForWelcomeEntrance(page);
  await page.getByRole('button', { name: 'Playground' }).click();
  await expect(page.getByRole('heading', {
    name: 'Try the playground right here',
  })).toBeVisible();
  await expect(page.getByRole('status', {
    includeHidden: true,
    name: 'Landing section 7 of 8',
  })).toBeVisible({ visible: !isMobile });
  expectNoDiagnostics();
});

test('01.07 — the code illustration finishes entering before visual capture', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);
  await scrollLandingTo(page, 1900);
  await waitForGeneratedCodeIllustration(page);

  const illustration = page.getByRole('group', {
    name: 'Feature illustration',
  });

  // A second wait here would conceal an early readiness signal from the helper.
  const transform = await illustration.evaluate((element) => (
    getComputedStyle(element).transform
  ));

  expect(transform).toBe('none');
  await expect(page.getByRole('region', {
    name: 'Generated TypeScript examples',
  })).toBeVisible();
  expectNoDiagnostics();
});

test('01.06 — navigation presents the same links at wide and narrow widths', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const topNavigation = page.getByRole('navigation', {
    name: 'Main navigation',
  });

  const drawerToggle = page.getByRole('button', {
    name: 'Open navigation menu',
  });

  await expect(topNavigation).toBeVisible({ visible: !isMobile });
  await expect(drawerToggle).toBeVisible({ visible: !!isMobile });

  const navigation = await revealLandingNavigation(page);

  for (const name of navigationLabels) {
    await expect(navigation.getByRole('link', { name })).toBeVisible();
  }

  await expect(navigation.getByRole('link', { name: 'Ideology' }))
    .toHaveAttribute('href', '#ideology');

  const drawerNavigation = page.getByRole('navigation', {
    name: 'Navigation drawer',
  });

  await page.keyboard.press('Escape');
  await expect(drawerNavigation).toBeHidden();

  await scrollLandingTo(page, 120);
  await expect(drawerToggle).toBeVisible();

  const scrollBeforeMenu = await page.evaluate(() => window.scrollY);

  await drawerToggle.click();
  await expect(drawerNavigation).toBeVisible();
  await expect(drawerNavigation.getByRole('link')).toHaveText(navigationLabels);
  await expectMenuActionPlacement(drawerNavigation, isMobile);
  await expect(page.getByRole('region', { name: 'Navigation overlay' })
    .getByRole('img', { name: 'Codegena wordmark' })).toBeVisible();

  for (const name of navigationLabels) {
    await expect(drawerNavigation.getByRole('link', { name })).toBeVisible();
  }

  const overlayContact = page.getByRole('group', {
    name: 'Navigation contact',
  });
  const socialLinks = overlayContact.getByRole('navigation', {
    name: 'Social links',
  });
  const policies = overlayContact.getByRole('navigation', {
    name: 'Policies',
  });

  for (const name of ['Security', 'Personal data privacy']) {
    await expect(policies.getByRole('link', { name })).toBeVisible();
  }

  for (const name of ['X', 'GitHub', 'LinkedIn']) {
    await expect(socialLinks.getByRole('link', { name })).toBeVisible();
  }

  await expect(overlayContact.getByText('Alexander Koshevoy · 2018–2026'))
    .toBeVisible();

  const emailLink = overlayContact.getByRole('link', {
    name: 'koshevy@gmail.com',
  });

  await expect(emailLink).toBeVisible();

  await expect.poll(async () => {
    const socialRight = await socialLinks.evaluate(
      (element) => element.getBoundingClientRect().right,
    );
    const emailRight = await emailLink.evaluate(
      (element) => element.getBoundingClientRect().right,
    );

    return Math.abs(socialRight - emailRight);
  }).toBeLessThan(2);
  await page.keyboard.press('Shift+Tab');
  await expect(emailLink).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(drawerNavigation).toBeHidden();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBeforeMenu);

  await drawerToggle.click();
  await expect(drawerNavigation).toBeVisible();

  await page.getByRole('button', { name: 'Close navigation menu' }).click();
  await expect(drawerNavigation).toBeHidden();

  await drawerToggle.click();
  await expect(drawerNavigation).toBeVisible();

  await drawerNavigation.getByRole('link', { name: 'Docs' }).click();
  await expect(drawerNavigation).toBeHidden();

  expectNoDiagnostics();
});

test('01.03 — copy the complete prompt for an AI assistant', async ({
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?testingMode=true');
  await scrollLandingTo(page, 790);

  const prompt = page.getByRole('textbox', {
    name: 'Prompt to copy into your AI assistant',
  });
  const copyButton = page.getByRole('button', {
    name: 'Copy prompt to clipboard',
  });

  await expect(copyButton).toBeVisible();

  await prompt.click();
  await page.keyboard.press('Tab');
  await expect(copyButton).toBeFocused();
  await expect(page.getByRole('tooltip', {
    name: 'Copy prompt to clipboard',
  })).toBeVisible();

  await copyButton.click();

  const expectedPrompt = await prompt.inputValue();

  await expect.poll(async () => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(expectedPrompt);
  expectNoDiagnostics();
});

async function waitForBackdropIllustration(
  page: Page,
  isMobile: boolean,
): Promise<void> {
  // The code illustration is below the entrance trigger on a narrow viewport.
  if (!isMobile) {
    await waitForGeneratedCodeIllustration(page);
  }
}

test('01.04 — the hero backdrop continues beside the entering playground', async ({
  isMobile,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');
  await waitForWelcomeEntrance(page);

  const playground = page.getByRole('region', {
    name: 'Landing feature sections',
  });
  const overlapScrollPoint = await playground.evaluate((element) => (
    window.scrollY + element.getBoundingClientRect().top - window.innerHeight / 2
  ));

  await scrollLandingTo(page, overlapScrollPoint);
  await expect(page.getByRole('region', {
    name: 'Welcome',
  }).getByRole('status', {
    includeHidden: true,
    name: 'Landing section 1 of 8',
  })).toBeVisible({ visible: !isMobile });
  await expect(page.getByRole('heading', {
    name: 'Most detailed JSON Schema support',
  })).toBeVisible();
  await waitForBackdropIllustration(page, isMobile);
  await expect(page).toHaveScreenshot('01-09-hero-backdrop-entrance.png');
  expectNoDiagnostics();
});
