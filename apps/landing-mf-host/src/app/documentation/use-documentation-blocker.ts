import type { DocumentationNavigation } from 'documentation-mf-remote/App';
import { useCallback, useEffect, useRef } from 'react';
import { type BlockerFunction, useBlocker } from 'react-router-dom';

/**
 * Lets the documentation's mobile menu consume Back before the host leaves a page.
 */
export function useDocumentationBlocker(): DocumentationNavigation['block'] {
  const handlerRef = useRef<Parameters<DocumentationNavigation['block']>[0] | undefined>(
    undefined,
  );

  const shouldBlock = useCallback<BlockerFunction>(({ historyAction, nextLocation }) => (
    handlerRef.current?.(nextLocation, historyAction) === false
  ), []);

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  const handleBlock = useCallback<DocumentationNavigation['block']>((handler) => {
    handlerRef.current = handler;

    return () => {
      if (handlerRef.current === handler) {
        handlerRef.current = undefined;
      }
    };
  }, []);

  return handleBlock;
}
