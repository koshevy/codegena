import type { ReactVirtualizer } from '@tanstack/react-virtual';

export type VirtualFilesVirtualizer
  = ReactVirtualizer<HTMLDivElement, HTMLDivElement>
    | ReactVirtualizer<Window, HTMLDivElement>;
