import type {
  GraphPayloadGroupNode,
  GraphPayloadDirectoryNode,
  GraphPayloadItemNode,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';

import type { VirtualFilesScrollSnapshot } from './virtual-files.types';

export interface VirtualFilesProps {
  declarationsByFileId: ReadonlyMap<string, GraphPayloadItemNode[]>;
  detailsOpen: boolean;
  directories: GraphPayloadDirectoryNode[];
  focusRevision: number;
  editorHeights: ReadonlyMap<string, number>;
  files: GraphPayloadGroupNode[];
  focusedWarning?: GraphPayloadLog;
  focusedFileId?: string;
  highlightFocusedWarning: boolean;
  initialScrollSnapshot?: VirtualFilesScrollSnapshot;
  logs: GraphPayloadLog[];
  onNavigateToSource?: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
  onSelectFile?: (fileId: string, isShiftSelection: boolean) => void;
  onSelectDirectory?: (directoryId: string) => void;
  onScrollSnapshotChange?: (snapshot: VirtualFilesScrollSnapshot) => void;
  onWarningVisibilityChange: (isVisible: boolean) => void;
  selectedFileIds: ReadonlySet<string>;
  scrollAnchor: 'start' | 'end';
  scrollBehavior: ScrollBehavior;
  scrollElement: HTMLDivElement | null;
  scrollMode: 'element' | 'window';
  selectedLineByFileId: ReadonlyMap<string, number>;
  showAllFiles: boolean;
  sourceSchemaText: string;
}
