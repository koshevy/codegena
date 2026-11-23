import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from 'react';

export function useExpandedDirectoryIds(
  controlledIds?: ReadonlySet<string>,
  onChange?: (ids: Set<string>) => void,
): [ReadonlySet<string>, Dispatch<SetStateAction<Set<string>>>] {
  const [localIds, setLocalIds] = useState<Set<string>>(
    () => new Set(['.']),
  );

  const setIds = useCallback((update: SetStateAction<Set<string>>): void => {
    if (controlledIds) {
      const next = typeof update === 'function'
        ? update(new Set(controlledIds))
        : update;

      onChange?.(next);
      return;
    }

    setLocalIds(update);
  }, [
    controlledIds,
    onChange,
  ]);

  return [controlledIds ?? localIds, setIds];
}
