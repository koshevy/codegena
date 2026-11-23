import type { RefObject, TouchEvent } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface TouchPosition {
  x: number;
  y: number;
}

interface PeelDrawerState {
  handleClose: () => void;
  handleDrawerContentRef: (element: HTMLDivElement | null) => void;
  handleOpen: () => void;
  handleTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
  handleTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  isOpen: boolean;
  portalHost: HTMLDivElement;
  previewRef: RefObject<HTMLDivElement | null>;
}

function movePortalHost(
  portalHost: HTMLDivElement,
  destination: HTMLDivElement | null,
): void {
  if (!destination) {
    return;
  }

  const focusedElement = document.activeElement;

  const hasToRestoreFocus = focusedElement instanceof HTMLElement
    && portalHost.contains(focusedElement);

  destination.append(portalHost);

  if (hasToRestoreFocus) {
    focusedElement.focus({ preventScroll: true });
  }
}

/**
 * Keeps a mobile illustration mounted while it moves into its drawer.
 */
export function usePeelDrawer(): PeelDrawerState {
  const [isOpen, setIsOpen] = useState(false);
  const [portalHost] = useState(() => document.createElement('div'));
  const isRestoringFocusRef = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<TouchPosition | null>(null);

  useLayoutEffect(() => {
    if (isOpen) {
      return;
    }

    isRestoringFocusRef.current = true;
    movePortalHost(portalHost, previewRef.current);
    returnFocusRef.current?.focus({ preventScroll: true });
    isRestoringFocusRef.current = false;
    returnFocusRef.current = null;
  }, [
    isOpen,
    portalHost,
  ]);

  const handleOpen = useCallback((): void => {
    if (isRestoringFocusRef.current) {
      return;
    }

    const focusedElement = document.activeElement;

    returnFocusRef.current = focusedElement instanceof HTMLElement
      && portalHost.contains(focusedElement)
      ? focusedElement
      : null;

    setIsOpen(true);
  }, [portalHost]);

  const handleClose = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const handleDrawerContentRef = useCallback((
    element: HTMLDivElement | null,
  ): void => {
    movePortalHost(portalHost, element);
  }, [portalHost]);

  const handleTouchStart = useCallback((
    event: TouchEvent<HTMLDivElement>,
  ): void => {
    const touch = event.touches.item(0);

    touchStartRef.current = touch
      ? { x: touch.clientX, y: touch.clientY }
      : null;
  }, []);

  const handleTouchEnd = useCallback((
    event: TouchEvent<HTMLDivElement>,
  ): void => {
    const start = touchStartRef.current;
    const touch = event.changedTouches.item(0);

    touchStartRef.current = null;

    if (!start || !touch) {
      return;
    }

    const upwardDistance = start.y - touch.clientY;
    const sidewaysDistance = Math.abs(start.x - touch.clientX);

    if (upwardDistance > 48 && upwardDistance > sidewaysDistance) {
      handleOpen();
    }
  }, [handleOpen]);

  useEffect(() => {
    const narrowScreen = window.matchMedia('(max-width: 700px)');

    narrowScreen.addEventListener('change', handleClose);

    return () => {
      narrowScreen.removeEventListener('change', handleClose);
    };
  }, [handleClose]);

  return {
    handleClose,
    handleDrawerContentRef,
    handleOpen,
    handleTouchEnd,
    handleTouchStart,
    isOpen,
    portalHost,
    previewRef,
  };
}
