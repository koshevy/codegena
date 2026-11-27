import { CodegenaWordmark, SiteFooter } from '@codegena/ui-unified/branding';
import Link from '@docusaurus/core/lib/client/exports/Link';
import MuiLink from '@mui/material/Link';
import type { ReactElement } from 'react';

import { useHostLink } from '../navigation';

const navigation = [
  { href: '/roadmap-and-status', label: 'Roadmap and status' },
  { href: '/', label: 'Get started' },
  { href: '/core-features', label: 'Core features' },
  { href: '/extend', label: 'Extend' },
  { href: '/contribute', label: 'Contribute' },
  { href: '/faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contacts', label: 'Contacts' },
];

const policies = [
  { href: '/security', label: 'Security' },
  { href: '/personal-data-privacy', label: 'Personal data privacy' },
];

export default function Footer(): ReactElement {
  const handleHomeClick = useHostLink('/');

  const renderedBrand = (
    <MuiLink
      aria-label="Codegena home"
      href="/"
      onClick={handleHomeClick}
    >
      <CodegenaWordmark />
    </MuiLink>
  );

  return (
    <SiteFooter
      brand={renderedBrand}
      linkComponent={Link}
      navigation={navigation}
      policies={policies}
    />
  );
}
