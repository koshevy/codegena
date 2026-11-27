import { useCallback, useState } from 'react';

interface SearchState {
  handleClose: () => void;
  handleOpen: () => void;
  isOpen: boolean;
}

export function useSearch(): SearchState {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback((): void => {
    setIsOpen(false);
  }, []);

  return { handleClose, handleOpen, isOpen };
}
