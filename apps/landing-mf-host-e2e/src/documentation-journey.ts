import type { Page } from '@playwright/test';

export async function openDocumentationNavigation(
  page: Page,
  isMobile: boolean,
  hasArticleSidebar = true,
): Promise<void> {
  if (!isMobile) {
    return;
  }

  await page.getByRole('navigation', { name: 'Main', exact: true })
    .getByRole('button', { name: 'Toggle navigation bar' }).click();

  const primaryMenu = page.getByRole('button', { name: '← Back to main menu' });

  if (hasArticleSidebar) {
    await primaryMenu.click();
  }
}
