import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { type DemoOption, getPlaygroundPath } from '../../playground-examples';

export function usePlaygroundNavigation(): {
  handleCloseMenu: () => void;
  handleOpenMenu: () => void;
  handleReturn: () => void;
  handleSelectExample: (choice: DemoOption) => void;
  isMenuOpen: boolean;
} {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenMenu = useCallback((): void => {
    setIsMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback((): void => {
    setIsMenuOpen(false);
  }, []);

  const handleSelectExample = useCallback((choice: DemoOption): void => {
    setIsMenuOpen(false);
    void navigate(`${getPlaygroundPath(choice.specUrl)}${search}`);
  }, [
    navigate,
    search,
  ]);

  const handleReturn = useCallback((): void => {
    void navigate(`/${search}`);
  }, [
    navigate,
    search,
  ]);

  return {
    handleCloseMenu,
    handleOpenMenu,
    handleReturn,
    handleSelectExample,
    isMenuOpen,
  };
}
