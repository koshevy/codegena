import { expect, test } from '../fixtures';
import { observeLandingDiagnostics } from './landing-journey';

const dialogName = 'Site under construction';

test.use({
  hasAcknowledgedConstructionNotice: false,
  storageState: { cookies: [], origins: [] },
});

test('CONSTRUCTION-01 — acknowledge the first-visit notice before cookies', async ({
  context,
  page,
}) => {
  const expectNoDiagnostics = observeLandingDiagnostics(page);

  await page.goto('/?testingMode=true');

  const notice = page.getByRole('alertdialog', { name: dialogName });
  const cookies = page.getByRole('region', { name: 'Cookies and privacy' });

  await expect(notice).toBeVisible();
  await expect(notice).toHaveAccessibleDescription(/December\s15/);
  await expect(page.locator('.MuiBackdrop-root')).toHaveCSS(
    'backdrop-filter',
    'blur(16px)',
  );
  await expect(page.getByText('Cookies and privacy', { exact: true })).toHaveCount(0);
  await notice.getByRole('button', { name: 'Got it' }).click();
  await expect(notice).toBeHidden();
  await expect(cookies).toBeVisible();

  await page.reload();
  await expect(cookies).toBeVisible();
  await expect(notice).toBeHidden();

  await page.goto('/docs');
  await expect(cookies).toBeVisible();
  await expect(notice).toBeHidden();
  expectNoDiagnostics();

  const newTab = await context.newPage();

  await newTab.goto('/?testingMode=true');
  await expect(newTab.getByRole('alertdialog', { name: dialogName })).toBeVisible();
});

for (const path of ['/docs/core-features', '/playground?testingMode=true']) {
  test(`CONSTRUCTION-02 — show the notice when opening ${path} directly`, async ({
    page,
  }) => {
    await page.goto(path);

    const notice = page.getByRole('alertdialog', { name: dialogName });

    await expect(notice).toBeVisible();
    await notice.getByRole('button', { name: 'Got it' }).click();
    await expect(notice).toBeHidden();
  });
}
