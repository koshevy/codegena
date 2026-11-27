import { useCallback, type KeyboardEvent } from 'react';

/**
 * Portaled dialogs may use another MUI instance in the remote. Their Escape
 * events must close their own popup without also closing this overlay.
 */
export function usePlaygroundKeyboard(
  onClose: () => void,
): (event: KeyboardEvent<HTMLDivElement>) => void {
  return useCallback((event: KeyboardEvent<HTMLDivElement>): void => {
    const target = event.target;
    const isOwnedTarget = target instanceof Node && event.currentTarget.contains(target);
    const hasToClose = event.key === 'Escape' && isOwnedTarget;

    if (hasToClose) {
      event.stopPropagation();
      onClose();
    }
  }, [onClose]);
}
