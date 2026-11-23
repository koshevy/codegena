import { useLenis } from 'lenis/react';
import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';

interface OpenState {
  closeMenu: () => void;
  hasOpened: boolean;
  isOpen: boolean;
  lastLinkRef: RefObject<HTMLAnchorElement | null>;
  toggleRef: RefObject<HTMLButtonElement | null>;
  toggleMenu: () => void;
}

/**
 * Keeps page scrolling and Escape handling in sync with the menu layer.
 */
export function useOpen(pageContentRef: RefObject<HTMLElement | null>): OpenState {
  const lenis = useLenis();
  const [menuState, setMenuState] = useState<'unopened' | 'open' | 'closed'>('unopened');
  const lastLinkRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isOpen = menuState === 'open';

  const closeMenu = useCallback((): void => {
    setMenuState('closed');
    toggleRef.current?.focus({ preventScroll: true });
  }, []);

  const toggleMenu = useCallback((): void => {
    toggleRef.current?.focus({ preventScroll: true });
    setMenuState((current) => current === 'open' ? 'closed' : 'open');
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      closeMenu();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const wrappedTarget = event.shiftKey
      ? document.activeElement === toggleRef.current && lastLinkRef.current
      : document.activeElement === lastLinkRef.current && toggleRef.current;

    if (wrappedTarget) {
      event.preventDefault();
      wrappedTarget.focus({ preventScroll: true });
    }
  }, [closeMenu]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const viewportStyle = document.documentElement.style;
    const previousOverflowY = viewportStyle.overflowY;
    const pageContent = pageContentRef.current;
    const wasPageContentInert = pageContent?.inert;
    const wasLenisRunning = !!lenis && !lenis.isStopped;

    if (wasLenisRunning) {
      lenis.stop();
    }

    // Lock the viewport so the body does not become a sticky scroll container.
    viewportStyle.overflowY = 'hidden';

    if (pageContent) {
      pageContent.inert = true;
    }

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      viewportStyle.overflowY = previousOverflowY;
      document.removeEventListener('keydown', handleKeyDown, true);

      if (pageContent && wasPageContentInert !== undefined) {
        pageContent.inert = wasPageContentInert;
      }

      if (wasLenisRunning) {
        lenis.start();
      }
    };
  }, [
    handleKeyDown,
    isOpen,
    lenis,
    pageContentRef,
  ]);

  return {
    closeMenu,
    hasOpened: menuState !== 'unopened',
    isOpen,
    lastLinkRef,
    toggleMenu,
    toggleRef,
  };
}
