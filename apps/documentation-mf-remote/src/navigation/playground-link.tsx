import Link from '@mui/material/Link';
import type { MouseEvent, ReactElement } from 'react';

import { useHostLink } from './use-host-link';

interface PlaygroundLinkProps {
  mobile?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function PlaygroundLink({ mobile, onClick }: PlaygroundLinkProps): ReactElement {
  const handleClick = useHostLink('/playground', onClick);
  const className = mobile ? 'menu__link' : 'navbar__item navbar__link';

  const renderedLink = (
    <Link
      className={className}
      href="/playground"
      onClick={handleClick}
    >
      Playground
    </Link>
  );

  const renderedItem = mobile
    ? <li className="menu__list-item">{renderedLink}</li>
    : renderedLink;

  return renderedItem;
}
