import Link from '@mui/material/Link';
import type { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';

import { getSpecificationPath } from './specification-examples';

interface SpecificationExampleLinkProps {
  name: string;
  path: string;
}

export function SpecificationExampleLink({
  name,
  path,
}: SpecificationExampleLinkProps): ReactElement {
  return (
    <Link
      component={NavLink}
      to={getSpecificationPath(path)}
    >
      {name}
    </Link>
  );
}
