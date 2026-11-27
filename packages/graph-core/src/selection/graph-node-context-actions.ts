import type { GraphPayloadLog } from '../graph-payload-log';

export interface GraphNodeContextActions {
  areSelected: (nodeIds: string[]) => boolean;
  directoryExpansion?: {
    isExpanded: boolean;
    toggle: () => void;
  };
  isSelected: boolean;
  revealWarning: (log: GraphPayloadLog) => void;
  select: (isAdditive: boolean) => void;
  selectMany: (nodeIds: string[], isAdditive: boolean) => void;
  unselect: (isAdditive: boolean) => void;
}
