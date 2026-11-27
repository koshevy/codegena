import clsx from 'clsx';
import type { ReactElement, Ref } from 'react';

import {
  toggleClasses,
  ToggleStyles,
} from './toggle.styles';
import { useHydrationSnapshot } from '../hydration';

interface ToggleProps {
  buttonRef?: Ref<HTMLButtonElement>;
  isDetached?: boolean;
  isOpen: boolean;
  navigationId: string;
  onClick: () => void;
}

/**
 * The same three strokes open the menu and form its close mark.
 */
export function Toggle({
  buttonRef,
  isDetached = false,
  isOpen,
  navigationId,
  onClick,
}: ToggleProps): ReactElement {
  const isHydrated = useHydrationSnapshot(() => true, () => false);

  const renderedIcon = (
    <span
      aria-hidden
      className={toggleClasses.icon}
    >
      <span />
      <span />
      <span />
    </span>
  );

  return (
    <ToggleStyles
      aria-controls={navigationId}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      className={clsx({
        [toggleClasses.detached]: isDetached,
        [toggleClasses.open]: isOpen,
      })}
      disabled={!isHydrated}
      onClick={onClick}
      ref={buttonRef}
    >
      {renderedIcon}
    </ToggleStyles>
  );
}
