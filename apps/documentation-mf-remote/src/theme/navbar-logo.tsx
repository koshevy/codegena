import { CodegenaWordmark } from '@codegena/ui-unified/branding';
import Link from '@mui/material/Link';
import type { ReactElement } from 'react';

import { useHostLink } from '../navigation';

export default function NavbarLogo(): ReactElement {
  const handleClick = useHostLink('/');

  return (
    <Link
      aria-label="Codegena home"
      className="navbar__brand"
      href="/"
      onClick={handleClick}
    >
      <CodegenaWordmark />
    </Link>
  );
}
