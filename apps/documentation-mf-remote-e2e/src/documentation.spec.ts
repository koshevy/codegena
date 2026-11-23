import { expect, test } from './fixtures';

const sections = [
  { path: '/roadmap-and-status', title: 'Roadmap and status' },
  { path: '/', title: 'Get started' },
  { path: '/core-features', title: 'Core features' },
  { path: '/extend', title: 'Extend' },
  { path: '/contribute', title: 'Contribute' },
  { path: '/security', title: 'Security' },
  { path: '/personal-data-privacy', title: 'Personal data privacy' },
  { path: '/faq', title: 'FAQ' },
  { path: '/blog', title: 'Blog' },
  { path: '/about', title: 'About' },
  { path: '/contacts', title: 'Contacts' },
];

sections.forEach(({ path, title }) => {
  test(`opens the ${title} partition directly`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', {
      name: title,
      exact: true,
      level: 1,
    })).toBeVisible();

    await expect(page.getByRole('contentinfo', {
      name: 'Site footer',
    })).toBeVisible();
  });
});
