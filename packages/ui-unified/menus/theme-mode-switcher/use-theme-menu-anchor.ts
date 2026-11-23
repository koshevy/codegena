import { type MouseEvent, useCallback, useState } from 'react';

export function useThemeMenuAnchor(): {
  anchor: HTMLButtonElement | null;
  handleClose: () => void;
  handleOpen: (event: MouseEvent<HTMLButtonElement>) => void;
} {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    setAnchor(event.currentTarget);
  }, []);

  const handleClose = useCallback((): void => {
    setAnchor(null);
  }, []);

  return { anchor, handleClose, handleOpen };
}
