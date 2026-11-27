import {
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { useCallback, useRef, useState } from 'react';

const scrollDirectories: readonly string[] = [
  '_common',
  'vaults',
  'vaults/_common',
];

function getExpandedDirectoryCount(progress: number): number {
  if (progress >= 0.45) {
    return 3;
  }

  if (progress >= 0.3) {
    return 2;
  }

  return progress >= 0.15 ? 1 : 0;
}

interface ScrollExpansionState {
  expandedFileIds: string[];
  onExpandedFileIdsChange: (ids: string[]) => void;
  slideProgress: MotionValue<number>;
}

/**
 * Advances the folder hierarchy and code slide with the section's scroll.
 */
export function useScrollExpansion(
  scrollProgress?: MotionValue<number>,
): ScrollExpansionState {
  const staticProgress = useMotionValue(0);
  const progress = scrollProgress ?? staticProgress;
  const initialExpandedCount = getExpandedDirectoryCount(progress.get());

  const [expandedFileIds, setExpandedFileIds] = useState<string[]>(
    () => scrollDirectories.slice(0, initialExpandedCount),
  );

  const previousExpandedCount = useRef(initialExpandedCount);

  const handleExpandedFileIdsChange = useCallback((ids: string[]): void => {
    setExpandedFileIds((current) => {
      const hasSameDirectories = current.length === ids.length
        && current.every((id) => ids.includes(id));

      return hasSameDirectories ? current : ids;
    });
  }, []);

  const slideProgress = useTransform(progress, (value): number => (
    value >= 0.6 ? 1 : 0
  ));

  const handleProgressChange = useCallback((value: number): void => {
    const nextCount = getExpandedDirectoryCount(value);
    const previousCount = previousExpandedCount.current;

    if (nextCount === previousCount) {
      return;
    }

    previousExpandedCount.current = nextCount;

    if (nextCount > previousCount) {
      const opened = scrollDirectories.slice(0, nextCount);

      setExpandedFileIds((current) => [
        ...current,
        ...opened.filter((id) => !current.includes(id)),
      ]);

      return;
    }

    const closed = scrollDirectories.slice(nextCount, previousCount);

    setExpandedFileIds((current) => current.filter((id) => !closed.includes(id)));
  }, []);

  useMotionValueEvent(progress, 'change', handleProgressChange);

  return {
    expandedFileIds,
    onExpandedFileIdsChange: handleExpandedFileIdsChange,
    slideProgress,
  };
}
