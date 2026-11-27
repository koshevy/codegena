import type { Meta, StoryObj } from '@storybook/react';

import { CodeEditor } from './code-editor';

const meta: Meta<typeof CodeEditor> = {
  args: {
    ariaLabel: 'Example JSON editor',
    defaultValue: '{\n  "name": "Codegena",\n  "enabled": true\n}',
    height: 260,
    language: 'json',
  },
  component: CodeEditor,
  parameters: { useMonaco: true },
  title: 'Codegena/Unified UI/Monaco/Code Editor',
};

export default meta;

export const EditableJSON: StoryObj<typeof CodeEditor> = {};

export const Minimal: StoryObj<typeof CodeEditor> = {
  args: { mode: 'minimal' },
  parameters: { useMonaco: false },
};

export const MinimalDark: StoryObj<typeof CodeEditor> = {
  args: { mode: 'minimal' },
  parameters: { codegenaTheme: 'dark', useMonaco: false },
};

export const PendingSyntax: StoryObj<typeof CodeEditor> = {
  args: { syntaxReady: false },
};

export const ReadOnly: StoryObj<typeof CodeEditor> = {
  args: { readOnly: true },
};

export const Dark: StoryObj<typeof CodeEditor> = {
  parameters: { codegenaTheme: 'dark' },
};
