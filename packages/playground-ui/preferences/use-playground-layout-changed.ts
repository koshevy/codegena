import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Layout, LayoutChangedMeta } from 'react-resizable-panels';

import type { PlaygroundPreferences } from './playground-preferences';
import { parsePlaygroundPanelWidths } from './playground-preferences-storage';

export function usePlaygroundLayoutChanged(
  setPreferences: Dispatch<SetStateAction<PlaygroundPreferences>>,
): (layout: Layout, meta: LayoutChangedMeta) => void {
  return useCallback((layout, meta): void => {
    const panelWidths = parsePlaygroundPanelWidths(meta.requestedLayout ?? layout);

    if (!panelWidths) {
      return;
    }

    const { source, generated, details } = panelWidths;

    setPreferences((current) => {
      const sourceOpenWidth = source > 0 ? source : current.sourceOpenWidth;
      const detailsOpenWidth = details > 0 ? details : current.detailsOpenWidth;

      if (
        current.layout.source === source
        && current.layout.generated === generated
        && current.layout.details === details
        && current.sourceOpenWidth === sourceOpenWidth
        && current.detailsOpenWidth === detailsOpenWidth
      ) {
        return current;
      }

      return {
        ...current,
        detailsOpenWidth,
        layout: { source, generated, details },
        sourceOpenWidth,
      };
    });
  }, [
    setPreferences,
  ]);
}
