import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Braces,
  FileCodeCorner,
  Files,
  GitBranch,
  ListTree,
} from 'lucide-react';

import { PanelHeader } from './panel-header';
import { PanelHeaderToolbar } from '../panel-header-toolbar';
import { PanelToggle } from '../panel-toggle';

const iconProps = {
  'aria-hidden': true,
  'size': '1.1rem',
  'strokeWidth': 1.5,
} as const;

const meta: Meta<typeof PanelHeader> = {
  args: {
    icon: (
      <Braces
        aria-hidden
        size={18}
      />
    ),
    title: 'Source schema',
  },
  component: PanelHeader,
  title: 'Codegena/Unified UI/Panels/Panel Header',
};

export default meta;

function doNothing(): void {
  // Visual story only.
}

export const SourceSchema: StoryObj<typeof PanelHeader> = {
  args: { actions: <Button size="small">Hide source</Button> },
};

export const GeneratedOutput: StoryObj<typeof PanelHeader> = {
  args: {
    actions: <Button size="small">Show details</Button>,
    afterTitle: (
      <Chip
        label="Import"
        size="small"
        variant="outlined"
      />
    ),
    hideHeading: true,
    leading: <Button size="small">Show source</Button>,
    title: 'Generated output',
  },
};

export const FileDetails: StoryObj<typeof PanelHeader> = {
  args: {
    icon: (
      <FileCodeCorner
        aria-hidden
        size={18}
      />
    ),
    title: 'Generated file details',
  },
};

export const NarrowWithControls: StoryObj<typeof PanelHeader> = {
  args: {
    actions: (
      <>
        <PanelHeaderToolbar
          ariaLabel="Generated output view"
          onChange={doNothing}
          options={[
            { icon: <ListTree {...iconProps} />, title: 'List', value: 'list' },
            { icon: <GitBranch {...iconProps} />, title: 'Graph', value: 'graph' },
          ]}
          value="graph"
        />
        <PanelToggle
          isOpen={false}
          isVisible
          onToggle={doNothing}
          position="right"
          title="details"
        />
      </>
    ),
    afterTitle: (
      <Chip
        label="Import and reference edges"
        size="small"
      />
    ),
    icon: (
      <Files
        aria-hidden
        size={18}
      />
    ),
    leading: (
      <PanelToggle
        isOpen={false}
        isVisible
        onToggle={doNothing}
        position="left"
        title="source schema"
      />
    ),
    title: 'Generated output with a long title',
  },
  render: (args) => (
    <Box sx={{ width: 380 }}>
      <PanelHeader {...args} />
    </Box>
  ),
};
