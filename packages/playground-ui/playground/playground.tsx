import { useGraphSearch } from '@codegena/graph-search-core/react';
import { GraphSearch } from '@codegena/graph-search-ui';
import { usePlaygroundAppearance } from '@codegena/playground-ui/appearance';
import { usePlaygroundNavigation } from '@codegena/playground-ui/navigation';
import {
  defaultPlaygroundPersistenceKey,
  usePlaygroundPreferences,
} from '@codegena/playground-ui/preferences';
import { usePlaygroundGraphSearchSelection } from '@codegena/playground-ui/search';
import { ContextMenu } from '@codegena/ui-unified/menus';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { usePlaygroundContextMenu } from './context-menu';
import { PlaygroundGeneratedFileDetails } from './file-details';
import { PlaygroundGeneratedOutput } from './generated-output';
import { PlaygroundProviders } from './playground-providers';
import { PlaygroundTopbar } from './playground-topbar';
import type { PlaygroundProps } from './playground.props';
import { playgroundClasses, PlaygroundStyles } from './playground.styles';
import { PlaygroundSourceSchema } from './source-schema';
import {
  usePlaygroundDetailsDirectorySelection,
} from './use-playground-details-directory-selection';
import {
  usePlaygroundDetailsFileSelection,
} from './use-playground-details-file-selection';
import { usePlaygroundDetailsScope } from './use-playground-details-scope';
import {
  usePlaygroundGeneratedOutputActions,
} from './use-playground-generated-output-actions';
import { usePlaygroundPanelLayout } from './use-playground-panel-layout';

export function Playground({
  defaultGeneratedView = 'graph',
  defaultSourceOpen = true,
  defaultThemeMode = 'system',
  graph,
  notificationProvider: NotificationProvider,
  onSandwichButtonClick,
  persistenceKey = defaultPlaygroundPersistenceKey,
  sourceSchemaText,
}: PlaygroundProps): ReactElement {
  const graphSearch = useGraphSearch(graph, sourceSchemaText);

  const {
    handleLayoutChanged,
    initial,
    preferences,
    setDetailsScope,
    setGeneratedView,
    setSortMode,
    setThemeMode,
  } = usePlaygroundPreferences(
    persistenceKey,
    defaultSourceOpen,
    defaultGeneratedView,
    defaultThemeMode,
  );

  const appearance = usePlaygroundAppearance(
    preferences.themeMode,
    setThemeMode,
  );
  const handleModeChange = appearance.onModeChange;

  const {
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
  } = usePlaygroundPanelLayout(initial.preferences);

  const {
    explicitSelectedNodeIds,
    focusRevision,
    focusedWarning,
    focusedFileId,
    handleNavigateToSource,
    handleRevealNode,
    handleRevealWarning,
    handleSelectChange,
    handleShowWarnings,
    highlightFocusedWarning,
    implicitSelectedNodeIds,
    navigationTarget,
    selectedGeneratedLine,
    selectedNodeIds,
  } = usePlaygroundNavigation({
    graph,
    hasRestoredLayout: initial.restored,
    onLogVisited: graphSearch.onLogVisited,
    onNodeVisited: graphSearch.onNodeVisited,
    showBothPanels,
    showDetailsPanel,
    showSourcePanel,
    sortMode: preferences.sortMode,
    sourceOpen,
  });

  const handleGeneratedSelectionChange = usePlaygroundDetailsScope(
    handleSelectChange,
    preferences.detailsScope,
  );

  const handleGraphSearchSelect = usePlaygroundGraphSearchSelection({
    graph,
    onNavigateToSource: handleNavigateToSource,
    onRevealWarning: handleRevealWarning,
    onSelectChange: handleSelectChange,
    setDetailsScope,
    showBothPanels,
  });

  const {
    handleGeneratedWarningClick,
    revealDeclarationFromGlyph,
    revealDetails,
    revealInSpecification,
  } = usePlaygroundGeneratedOutputActions({
    graph,
    onNavigateToSource: handleNavigateToSource,
    onSelectChange: handleSelectChange,
    onShowWarnings: handleShowWarnings,
    setDetailsScope,
    showBothPanels,
    showDetailsPanel,
  });

  const handleSelectDirectory = usePlaygroundDetailsDirectorySelection(
    graph,
    handleSelectChange,
    setDetailsScope,
  );

  const contextMenu = usePlaygroundContextMenu({
    detailsOpen,
    generatedView: preferences.generatedView,
    onToggleDetails: toggleDetailsPanel,
    onGeneratedViewChange: setGeneratedView,
    onToggleSource: toggleSourcePanel,
    sourceOpen,
  });

  const handleSelectFileFromDetails = usePlaygroundDetailsFileSelection({
    explicitSelectedNodeIds,
    graph,
    onSelectChange: handleGeneratedSelectionChange,
  });

  const sourceClassName = clsx({
    [playgroundClasses.source]: true,
    [playgroundClasses.sourceHidden]: !sourceOpen,
  });
  const detailsClassName = clsx({
    [playgroundClasses.details]: true,
    [playgroundClasses.detailsHidden]: !detailsOpen,
  });

  const renderedLeft = (
    <Box className={sourceClassName}>
      <PlaygroundSourceSchema
        graph={graph}
        navigationTarget={navigationTarget}
        onHide={hideSourcePanel}
        onRevealNode={handleRevealNode}
        onRevealWarning={handleRevealWarning}
        sourceSchemaText={sourceSchemaText}
        visible={sourceOpen}
      />
    </Box>
  );

  const renderedCenter = (
    <Box className={playgroundClasses.generated}>
      <PlaygroundGeneratedOutput
        detailsOpen={detailsOpen}
        generatedView={preferences.generatedView}
        graph={graph}
        implicitSelectedNodeIds={implicitSelectedNodeIds}
        onGeneratedViewChange={setGeneratedView}
        onDeclarationGlyphClick={revealDeclarationFromGlyph}
        onSelectChange={handleGeneratedSelectionChange}
        onShowSource={showSourcePanel}
        onShowInDetails={revealDetails}
        onRevealInSpecification={revealInSpecification}
        onToggleDetails={toggleDetailsPanel}
        onWarningClick={handleGeneratedWarningClick}
        selectedNodeIds={explicitSelectedNodeIds}
        detailsScope={preferences.detailsScope}
        onSortModeChange={setSortMode}
        sortMode={preferences.sortMode}
        sourceOpen={sourceOpen}
      />
    </Box>
  );

  const renderedRight = (
    <Box className={detailsClassName}>
      <PlaygroundGeneratedFileDetails
        explicitSelectedNodeIds={explicitSelectedNodeIds}
        focusRevision={focusRevision}
        detailsOpen={detailsOpen}
        focusedWarning={focusedWarning}
        focusedFileId={focusedFileId}
        highlightFocusedWarning={highlightFocusedWarning}
        graph={graph}
        onNavigateToSource={handleNavigateToSource}
        onSelectDirectory={handleSelectDirectory}
        onSelectFile={handleSelectFileFromDetails}
        onHide={toggleDetailsPanel}
        onScopeChange={setDetailsScope}
        scope={preferences.detailsScope}
        selectedGeneratedLine={selectedGeneratedLine}
        selectedNodeIds={selectedNodeIds}
        sourceSchemaText={sourceSchemaText}
      />
    </Box>
  );

  const renderedPlaygroundContent = (
    <PlaygroundStyles
      className={playgroundClasses.root}
      onContextMenu={contextMenu.handleContextMenu}
    >
      <GraphSearch onAutocompleteSelect={handleGraphSearchSelect} />
      <PlaygroundTopbar
        colorMode={appearance.mode}
        onChangeColorMode={handleModeChange}
        onSandwichButtonClick={onSandwichButtonClick}
      />
      <Group
        className={playgroundClasses.body}
        defaultLayout={initial.preferences.layout}
        groupRef={layoutRef}
        onLayoutChanged={handleLayoutChanged}
        orientation="horizontal"
      >
        <Panel
          collapsible
          id="source"
          minSize="10%"
          onResize={handleSourceResize}
        >
          {renderedLeft}
        </Panel>
        <Separator
          aria-label="Resize source and generated panels"
          className={playgroundClasses.separator}
        />
        <Panel
          id="generated"
          minSize="10%"
        >
          {renderedCenter}
        </Panel>
        <Separator
          aria-label="Resize generated and details panels"
          className={playgroundClasses.separator}
        />
        <Panel
          collapsible
          id="details"
          minSize="10%"
          onResize={handleDetailsResize}
        >
          {renderedRight}
        </Panel>
      </Group>
      <ContextMenu
        ariaLabel="Playground actions"
        items={contextMenu.items}
        onClose={contextMenu.handleClose}
        position={contextMenu.position}
      />
    </PlaygroundStyles>
  );

  return (
    <PlaygroundProviders
      notificationProvider={NotificationProvider}
      searchGetVersion={graphSearch.getVersion}
      searchSource={graphSearch.source}
      searchSubscribe={graphSearch.subscribe}
      theme={appearance.theme}
    >
      {renderedPlaygroundContent}
    </PlaygroundProviders>
  );
}
