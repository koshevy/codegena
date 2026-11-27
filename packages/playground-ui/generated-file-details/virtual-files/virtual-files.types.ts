import type { VirtualItem } from '@tanstack/react-virtual';

export interface VirtualFilesScrollSnapshot {
  directoryIds?: string[];
  fileIds: string[];
  measurements: VirtualItem[];
  scrollOffset: number;
}

export interface VirtualFilesHandle {
  scrollToWarnings: () => void;
}
