import Link from '@mui/material/Link';
import type { ReactElement } from 'react';

import { LinksStyles } from './links.styles';
import { menuItems } from './menu-items';
import { HostLink } from '../navigation';

const headerItems = menuItems.filter(({ label }) => label !== 'GitHub');

export function Links(): ReactElement {
  const renderedLinks = headerItems.map(({ href, label }) => (
    <Link
      component={HostLink}
      href={href}
      key={label}
    >
      {label}
    </Link>
  ));

  return (
    <LinksStyles
      component="nav"
      aria-label="Main navigation"
    >
      {renderedLinks}
    </LinksStyles>
  );
}
