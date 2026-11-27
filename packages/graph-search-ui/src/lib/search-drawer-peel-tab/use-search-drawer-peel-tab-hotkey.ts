import { useEffect } from 'react';

const doubleShiftWindowMs = 450;

export function useSearchDrawerPeelTabHotkey(onClick: () => void): void {
  useEffect(() => {
    let lastShiftReleaseAt: number | undefined;
    let hasShiftChord = false;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Shift'
        && !event.altKey
        && !event.ctrlKey
        && !event.metaKey
        && !event.defaultPrevented
      ) {
        return;
      }

      lastShiftReleaseAt = undefined;
      hasShiftChord = event.shiftKey;
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key !== 'Shift' || event.shiftKey) {
        return;
      }

      if (hasShiftChord || event.altKey || event.ctrlKey || event.metaKey) {
        lastShiftReleaseAt = undefined;
        hasShiftChord = false;
        return;
      }

      const isDoubleShift = lastShiftReleaseAt !== undefined
        && event.timeStamp - lastShiftReleaseAt <= doubleShiftWindowMs;

      lastShiftReleaseAt = isDoubleShift ? undefined : event.timeStamp;

      if (isDoubleShift) {
        onClick();
      }
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (!event.shiftKey) {
        return;
      }

      lastShiftReleaseAt = undefined;
      hasShiftChord = true;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [
    onClick,
  ]);
}
