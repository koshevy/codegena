import Typography from '@mui/material/Typography';
import FocusTrap from '@mui/material/Unstable_TrapFocus';
import { type ReactElement, type RefObject, Suspense, useId } from 'react';

import { Actions } from './actions';
import { LazyOverlay } from './lazy-overlay';
import { Links } from './links';
import {
  menuClasses,
  MenuFocusLayerStyles,
  MenuStyles,
} from './menu.styles';
import { Toggle } from './toggle';
import { useHeaderVisibility } from './use-header-visibility';
import { useOpen } from './use-open';

interface MenuProps {
  cookieNoticeRef?: RefObject<HTMLElement | null>;
  pageContentRef: RefObject<HTMLElement | null>;
}

/**
 * Top navigation and a drawer control when the header leaves view.
 */
export function Menu({ cookieNoticeRef, pageContentRef }: MenuProps): ReactElement {
  const navigationId = useId();

  const {
    closeMenu,
    hasOpened,
    isOpen,
    lastLinkRef,
    toggleMenu,
    toggleRef,
  } = useOpen(pageContentRef, cookieNoticeRef);

  const {
    headerRef,
    isHeaderOutOfView,
  } = useHeaderVisibility();

  const isDetached = isHeaderOutOfView && !isOpen;

  const renderedDesktopNavigation = <Links />;

  const renderedMobileHint = (
    <Typography
      className={menuClasses.mobileHint}
      variant="caption"
    >
      OpenAPI / TypeScript
    </Typography>
  );

  const renderedDrawerToggle = (
    <Toggle
      buttonRef={toggleRef}
      isDetached={isDetached}
      isOpen={isOpen}
      navigationId={navigationId}
      onClick={toggleMenu}
    />
  );

  const renderedDrawerNavigation = hasOpened && (
    <Suspense fallback={null}>
      <LazyOverlay
        lastLinkRef={lastLinkRef}
        navigationId={navigationId}
        onClose={closeMenu}
        open={isOpen}
      />
    </Suspense>
  );

  return (
    <>
      <MenuStyles
        aria-label="Landing navigation"
        component="header"
        inert={isOpen}
        ref={headerRef}
      >
        {renderedMobileHint}
        {renderedDesktopNavigation}
        <Actions />
      </MenuStyles>
      <FocusTrap
        disableAutoFocus
        disableRestoreFocus
        open={isOpen}
      >
        <MenuFocusLayerStyles>
          {renderedDrawerToggle}
          {renderedDrawerNavigation}
        </MenuFocusLayerStyles>
      </FocusTrap>
    </>
  );
}
