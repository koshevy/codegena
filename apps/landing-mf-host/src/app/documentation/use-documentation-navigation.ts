import type { DocumentationNavigation } from 'documentation-mf-remote/App';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

import { useDocumentationBlocker } from './use-documentation-blocker';

export function useDocumentationNavigation(): DocumentationNavigation {
  const navigate = useNavigate();
  const location = useLocation();
  const action = useNavigationType();
  const block = useDocumentationBlocker();

  const handleNavigate = useCallback((
    path: string,
    options?: { replace?: boolean; state?: unknown },
  ): void => {
    void navigate(path, options);
  }, [navigate]);

  const handleGo = useCallback((delta: number): void => {
    void navigate(delta);
  }, [navigate]);

  return useMemo(() => ({
    action,
    block,
    go: handleGo,
    location,
    navigate: handleNavigate,
  }), [
    action,
    block,
    handleGo,
    handleNavigate,
    location,
  ]);
}
