import type { Meta, StoryObj } from '@storybook/react';

import { GeneratedCodeEditor } from './generated-code-editor';
import type { GeneratedCodeEditorProps } from './generated-code-editor.props';
import {
  GeneratedCodeEditorTransitionStory,
} from './story-utils';

type FullEditorProps = Extract<GeneratedCodeEditorProps, { mode?: 'full' }>;

const meta: Meta<FullEditorProps> = {
  args: {
    ariaLabel: 'Example generated TypeScript',
    height: 240,
    syntaxReady: true,
    value: 'export interface Example {\n  id: string;\n  enabled: boolean;\n}\n',
  },
  component: GeneratedCodeEditor,
  parameters: { useMonaco: true },
  title: 'Codegena/Unified UI/Monaco/Generated Code Editor',
};

export default meta;

export const Ready: StoryObj<typeof meta> = {};

export const HiddenOverviewCursor: StoryObj<typeof meta> = {
  args: { isOverviewCursorHidden: true },
};

export const PlainIdentifier: StoryObj<typeof meta> = {
  args: { value: 'identifier\n' },
};

export const PendingSyntax: StoryObj<typeof meta> = {
  args: { syntaxReady: false },
};

export const DarkPendingSyntax: StoryObj<typeof meta> = {
  args: { syntaxReady: false },
  parameters: { codegenaTheme: 'dark' },
};

export const SyntaxReveal: StoryObj<typeof meta> = {
  args: { syntaxReady: false },
  render: (args) => <GeneratedCodeEditorTransitionStory {...args} />,
};

export const SelectedLine: StoryObj<typeof meta> = {
  args: { selectedLine: 2 },
};
