import useMediaQuery from '@mui/material/useMediaQuery';
import { type ReactElement, useMemo } from 'react';

import { OverlayLink } from './overlay-link';
import type { OverlayNavigationProps } from './overlay-navigation.props';
import {
  overlayNavigationClasses,
  OverlayNavigationStyles,
} from './overlay-navigation.styles';

export function OverlayNavigation({
  action,
  choices,
  id,
  items,
  onClose,
}: OverlayNavigationProps): ReactElement {
  const isNarrow = useMediaQuery('(max-width: 900px)');

  const primaryItems = useMemo(() => (
    items.filter(({ label }) => label !== 'Playground')
  ), [items]);

  const actionItems = useMemo(() => [
    action,
    ...items.filter(({ label }) => label === 'Playground'),
  ], [
    action,
    items,
  ]);

  const renderedLinks = primaryItems.map((item) => (
    <OverlayLink
      href={item.href}
      icon={item.icon}
      key={item.label}
      label={item.label}
      onClick={item.onSelect ?? onClose}
    />
  ));

  const renderedActionLinks = actionItems.map((item) => (
    <OverlayLink
      href={item.href}
      icon={item.icon}
      isAction={item === action}
      key={item.label}
      label={item.label}
      onClick={item.onSelect ?? onClose}
    />
  ));

  const renderedMobileActions = isNarrow ? renderedActionLinks : null;

  const renderedDesktopActions = !isNarrow && (
    <div className={overlayNavigationClasses.actions}>
      {renderedActionLinks}
    </div>
  );

  return (
    <OverlayNavigationStyles
      actionItemCount={actionItems.length}
      aria-label="Navigation drawer"
      component="nav"
      id={id}
      primaryItemCount={primaryItems.length}
    >
      <div className={overlayNavigationClasses.primary}>
        {renderedLinks}
        {renderedMobileActions}
      </div>
      <div className={overlayNavigationClasses.right}>
        <div className={overlayNavigationClasses.choices}>
          {choices}
        </div>
        {renderedDesktopActions}
      </div>
    </OverlayNavigationStyles>
  );
}
