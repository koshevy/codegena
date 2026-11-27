import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';

import type { VirtualFilesScrollSnapshot } from './virtual-files';

export interface GeneratedFileDetailsProps {
  detailsOpen?: boolean;
  explicitSelectedNodeIds?: string[];
  focusRevision?: number;
  focusedWarning?: GraphPayloadLog;
  focusedFileId?: string;
  graph: GraphPayload;
  highlightFocusedWarning?: boolean;
  initialScrollSnapshot?: VirtualFilesScrollSnapshot;
  onNavigateToSource?: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
  onSelectFile?: (fileId: string, isShiftSelection: boolean) => void;
  onSelectDirectory?: (directoryId: string) => void;
  onScrollSnapshotChange?: (snapshot: VirtualFilesScrollSnapshot) => void;
  onShowAllFiles?: () => void;
  scrollAnchor?: 'start' | 'end';
  selectedGeneratedLine?: number;
  selectedNodeIds: string[];
  showAllFiles?: boolean;
  scrollMode?: 'element' | 'window';
  sourceSchemaText: string;
}
