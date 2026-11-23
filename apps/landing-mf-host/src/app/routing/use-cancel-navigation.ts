import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Return to the still-current page, aborting its pending destination loader.
 */
export function useCancelNavigation(): () => void {
  const navigate = useNavigate();

  const {
    pathname,
    search,
    hash,
  } = useLocation();

  return useCallback((): void => {
    void navigate(`${pathname}${search}${hash}`, { replace: true });
  }, [
    hash,
    navigate,
    pathname,
    search,
  ]);
}
