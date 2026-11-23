import type { PlaygroundPreferences } from '@codegena/playground-ui/preferences';
import { useCallback, useRef, useState } from 'react';
import { type PanelSize, useGroupRef } from 'react-resizable-panels';

interface PlaygroundPanelLayout {
  detailsOpen: boolean;
  handleDetailsResize: (size: PanelSize) => void;
  handleSourceResize: (size: PanelSize) => void;
  hideSourcePanel: () => void;
  layoutRef: ReturnType<typeof useGroupRef>;
  showBothPanels: () => void;
  showDetailsPanel: () => void;
  showSourcePanel: () => void;
  sourceOpen: boolean;
  toggleDetailsPanel: () => void;
  toggleSourcePanel: () => void;
}

interface PlaygroundPanelLayoutOptions {
  collapsedPanelWidth?: number;
  maximumOpenPanelsWidth?: number;
  totalLayoutWidth?: number;
}

export function usePlaygroundPanelLayout(
  initialPreferences: PlaygroundPreferences,
  {
    collapsedPanelWidth = 0,
    maximumOpenPanelsWidth = 90,
    totalLayoutWidth = 100,
  }: PlaygroundPanelLayoutOptions = {},
): PlaygroundPanelLayout {
  const [detailsOpen, setDetailsOpen] = useState(
    initialPreferences.layout.details > collapsedPanelWidth,
  );

  const [sourceOpen, setSourceOpen] = useState(
    initialPreferences.layout.source > collapsedPanelWidth,
  );

  const layoutRef = useGroupRef();
  // Warning clicks can request details before selection state rerenders.
  const sourceOpenRef = useRef(
    initialPreferences.layout.source > collapsedPanelWidth,
  );
  const sourceSizeRef = useRef(initialPreferences.sourceOpenWidth);
  const detailsSizeRef = useRef(initialPreferences.detailsOpenWidth);

  const setPanelWidths = useCallback((
    sourceSize: number,
    detailsSize: number,
  ): void => {
    const totalOpenWidth = sourceSize + detailsSize;
    const fitRatio = totalOpenWidth > maximumOpenPanelsWidth
      ? maximumOpenPanelsWidth / totalOpenWidth
      : undefined;

    const source = fitRatio === undefined
      ? sourceSize
      : sourceSize * fitRatio;

    const details = fitRatio === undefined
      ? detailsSize
      : detailsSize * fitRatio;

    layoutRef.current?.setLayout({
      source,
      generated: totalLayoutWidth - source - details,
      details,
    });
  }, [
    layoutRef,
    maximumOpenPanelsWidth,
    totalLayoutWidth,
  ]);

  const setSourceVisibility = useCallback((isOpen: boolean): void => {
    sourceOpenRef.current = isOpen;
    setSourceOpen(isOpen);
  }, []);

  const showBothPanels = useCallback((): void => {
    setPanelWidths(sourceSizeRef.current, detailsSizeRef.current);
    setDetailsOpen(true);
    setSourceVisibility(true);
  }, [
    setPanelWidths,
    setSourceVisibility,
  ]);

  const showDetailsPanel = useCallback((): void => {
    if (detailsOpen) {
      return;
    }

    setPanelWidths(
      sourceOpenRef.current ? sourceSizeRef.current : collapsedPanelWidth,
      detailsSizeRef.current,
    );
    setDetailsOpen(true);
  }, [
    collapsedPanelWidth,
    detailsOpen,
    setPanelWidths,
  ]);

  const toggleDetailsPanel = useCallback((): void => {
    const sourceSize = sourceOpen
      ? sourceSizeRef.current
      : collapsedPanelWidth;

    const detailsSize = detailsOpen
      ? collapsedPanelWidth
      : detailsSizeRef.current;

    setPanelWidths(sourceSize, detailsSize);
    setDetailsOpen(!detailsOpen);
  }, [
    collapsedPanelWidth,
    detailsOpen,
    setPanelWidths,
    sourceOpen,
  ]);

  const hideSourcePanel = useCallback((): void => {
    setPanelWidths(
      collapsedPanelWidth,
      detailsOpen ? detailsSizeRef.current : collapsedPanelWidth,
    );
    setSourceVisibility(false);
  }, [
    collapsedPanelWidth,
    detailsOpen,
    setPanelWidths,
    setSourceVisibility,
  ]);

  const showSourcePanel = useCallback((): void => {
    setPanelWidths(
      sourceSizeRef.current,
      detailsOpen ? detailsSizeRef.current : collapsedPanelWidth,
    );
    setSourceVisibility(true);
  }, [
    collapsedPanelWidth,
    detailsOpen,
    setPanelWidths,
    setSourceVisibility,
  ]);

  const toggleSourcePanel = useCallback((): void => {
    if (sourceOpen) {
      hideSourcePanel();
      return;
    }

    showSourcePanel();
  }, [
    hideSourcePanel,
    showSourcePanel,
    sourceOpen,
  ]);

  const handleSourceResize = useCallback((size: PanelSize): void => {
    if (size.asPercentage > collapsedPanelWidth) {
      sourceSizeRef.current = size.asPercentage;
    }

    setSourceVisibility(size.asPercentage > collapsedPanelWidth);
  }, [
    collapsedPanelWidth,
    setSourceVisibility,
  ]);

  const handleDetailsResize = useCallback((size: PanelSize): void => {
    if (size.asPercentage > collapsedPanelWidth) {
      detailsSizeRef.current = size.asPercentage;
    }

    setDetailsOpen(size.asPercentage > collapsedPanelWidth);
  }, [collapsedPanelWidth]);

  return {
    detailsOpen,
    handleDetailsResize,
    handleSourceResize,
    hideSourcePanel,
    layoutRef,
    showBothPanels,
    showDetailsPanel,
    showSourcePanel,
    sourceOpen,
    toggleDetailsPanel,
    toggleSourcePanel,
  };
}
