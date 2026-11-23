import clsx from 'clsx';
import { type ComponentType, type MouseEvent, type ReactElement, useCallback }
  from 'react';

import {
  overlayLinkClasses,
  OverlayLinkStyles,
} from './overlay-link.styles';

interface OverlayLinkProps {
  href: string;
  icon: ComponentType;
  isAction?: boolean;
  label: string;
  onClick: () => void;
}

export function OverlayLink({
  href,
  icon: Icon,
  isAction = false,
  label,
  onClick,
}: OverlayLinkProps): ReactElement {
  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>): void => {
    if (href === '#') {
      event.preventDefault();
    }

    onClick();
  }, [
    href,
    onClick,
  ]);

  return (
    <OverlayLinkStyles
      className={clsx({ [overlayLinkClasses.action]: isAction })}
      href={href}
      onClick={handleClick}
    >
      <span
        aria-hidden
        className={overlayLinkClasses.icon}
      >
        <Icon />
      </span>
      {label}
    </OverlayLinkStyles>
  );
}
