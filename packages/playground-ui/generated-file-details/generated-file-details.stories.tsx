import type {
  GraphPayload,
  GraphPayloadGroupNode,
} from '@codegena/graph-core';
import { convertFixtureToGraph } from '@codegena/graph-core/testing-utils';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { Meta, StoryObj } from '@storybook/react';
import { type ReactElement, useCallback, useState } from 'react';
import { fn } from 'storybook/test';

import { GeneratedFileDetails } from './generated-file-details';
import type { VirtualFilesScrollSnapshot } from './virtual-files';
import { WarningRevealStory } from './warning-reveal-story';

interface FilesStoryProps {
  graph: GraphPayload;
  sourceSchemaText: string;
}

function SnapshotRestorationStory({
  graph,
  sourceSchemaText,
}: FilesStoryProps): ReactElement {
  const [mounted, setMounted] = useState(true);
  const [snapshot, setSnapshot] = useState<VirtualFilesScrollSnapshot>();

  const handleToggleMounted = useCallback((): void => {
    setMounted((current) => !current);
  }, []);

  const renderedDetails = mounted && (
    <GeneratedFileDetails
      graph={graph}
      initialScrollSnapshot={snapshot}
      onScrollSnapshotChange={setSnapshot}
      selectedNodeIds={[]}
      showAllFiles
      sourceSchemaText={sourceSchemaText}
    />
  );

  return (
    <Box>
      <Button onClick={handleToggleMounted}>
        {mounted ? 'Unmount file list' : 'Restore file list'}
      </Button>
      <Box sx={{ display: 'flex', height: 520 }}>
        {renderedDetails}
      </Box>
    </Box>
  );
}

function ChangingFilesStory({
  graph: initialGraph,
  scrollAnchor = 'start',
  sourceSchemaText,
}: FilesStoryProps & { scrollAnchor?: 'start' | 'end' }): ReactElement {
  const [graph, setGraph] = useState(initialGraph);
  const [addedFiles, setAddedFiles] = useState(0);

  const addFile = useCallback((position: 'start' | 'end'): void => {
    const exampleFile = initialGraph.nodes.find(
      (node): node is GraphPayloadGroupNode => node.data.kind === 'group',
    );

    if (!exampleFile) {
      return;
    }

    const fileName = position === 'start'
      ? `000-prepended-${addedFiles}.ts`
      : `zzz-streamed-${addedFiles}.ts`;

    setGraph((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        {
          ...exampleFile,
          data: {
            ...exampleFile.data,
            fileName,
            label: fileName,
            text: `export type Streamed${addedFiles} = string;`,
          },
          id: fileName,
        },
      ],
    }));
    setAddedFiles((current) => current + 1);
  }, [
    addedFiles,
    initialGraph,
  ]);

  const handlePrependFile = useCallback((): void => {
    addFile('start');
  }, [addFile]);

  const handleAppendFile = useCallback((): void => {
    addFile('end');
  }, [addFile]);

  return (
    <Box>
      <Button onClick={handlePrependFile}>Prepend file</Button>
      <Button onClick={handleAppendFile}>Stream file</Button>
      <Box sx={{ display: 'flex', height: 520 }}>
        <GeneratedFileDetails
          graph={graph}
          scrollAnchor={scrollAnchor}
          selectedNodeIds={[]}
          showAllFiles
          sourceSchemaText={sourceSchemaText}
        />
      </Box>
    </Box>
  );
}

const meta: Meta<typeof GeneratedFileDetails> = {
  args: { onShowAllFiles: fn(), selectedNodeIds: [] },
  component: GeneratedFileDetails,
  render: (args, { loaded }) => (
    <GeneratedFileDetails
      {...args}
      graph={loaded['graph']}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
  title: 'Codegena/Playground/Generated File Details',
};

export default meta;

export const Empty: StoryObj<typeof GeneratedFileDetails> = {
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const OneFile: StoryObj<typeof GeneratedFileDetails> = {
  args: { selectedNodeIds: ['account.ts::Account'] },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const MultipleFiles: StoryObj<typeof GeneratedFileDetails> = {
  args: { selectedNodeIds: ['account.ts', 'status.ts'] },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const DirectoryChildren: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    explicitSelectedNodeIds: ['items'],
    onSelectDirectory: fn(),
    selectedNodeIds: ['items', 'items/_common'],
  },
  loaders: () => convertFixtureToGraph('oas3-onepassword-connect.json'),
};

export const AllFiles: StoryObj<typeof GeneratedFileDetails> = {
  args: { showAllFiles: true },
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
};

export const AllFilesWithSelectedDeclaration: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    selectedNodeIds: ['account.ts::Account'],
    showAllFiles: true,
  },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const RevealedFile: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    detailsOpen: true,
    focusedFileId: 'status.ts',
    selectedNodeIds: ['status.ts', 'account.ts'],
  },
  loaders: () => convertFixtureToGraph('account.schema.jsonc'),
};

export const RevealedWarning: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    detailsOpen: true,
    highlightFocusedWarning: true,
    showAllFiles: true,
  },
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
  render: (args, { loaded }) => (
    <GeneratedFileDetails
      {...args}
      focusedWarning={loaded['graph'].logs[0]}
      graph={loaded['graph']}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};

export const InteractiveWarningReveal: StoryObj<typeof GeneratedFileDetails> = {
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
  render: (_args, { loaded }) => (
    <WarningRevealStory
      graph={loaded['graph']}
      log={loaded['graph'].logs[0]}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};

export const WarningFromGeneratedItem: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    detailsOpen: true,
    showAllFiles: true,
  },
  loaders: () => convertFixtureToGraph(
    'account-with-warning.schema.jsonc',
  ),
  render: (args, { loaded }) => (
    <GeneratedFileDetails
      {...args}
      focusedWarning={loaded['graph'].logs[0]}
      graph={loaded['graph']}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};

export const VirtualizedFiles: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    detailsOpen: true,
    focusedFileId: 'generated-070.ts',
    showAllFiles: true,
  },
  decorators: [(Story) => (
    <Box sx={{ display: 'flex', height: 520 }}><Story /></Box>
  )],
  loaders: () => convertFixtureToGraph('virtual-files.schema.jsonc'),
};

export const WindowScrolling: StoryObj<typeof GeneratedFileDetails> = {
  args: {
    scrollMode: 'window',
    showAllFiles: true,
  },
  loaders: () => convertFixtureToGraph('virtual-files.schema.jsonc'),
};

export const SnapshotRestoration: StoryObj<typeof GeneratedFileDetails> = {
  loaders: () => convertFixtureToGraph('virtual-files.schema.jsonc'),
  render: (_args, { loaded }) => (
    <SnapshotRestorationStory
      graph={loaded['graph']}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};

export const ChangingFiles: StoryObj<typeof GeneratedFileDetails> = {
  loaders: () => convertFixtureToGraph('virtual-files.schema.jsonc'),
  render: (_args, { loaded }) => (
    <ChangingFilesStory
      graph={loaded['graph']}
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};

export const StreamingAtEnd: StoryObj<typeof GeneratedFileDetails> = {
  loaders: () => convertFixtureToGraph('virtual-files.schema.jsonc'),
  render: (_args, { loaded }) => (
    <ChangingFilesStory
      graph={loaded['graph']}
      scrollAnchor="end"
      sourceSchemaText={loaded['sourceSchemaText']}
    />
  ),
};
