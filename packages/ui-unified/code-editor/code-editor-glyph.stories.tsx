import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { EditorGlyphExample } from './story-utils';

const meta: Meta<typeof EditorGlyphExample> = {
  args: {
    onGlyphClick: fn(),
    variant: 'editable',
  },
  component: EditorGlyphExample,
  parameters: { useMonaco: true },
  title: 'Codegena/Unified UI/Monaco/Editor Glyph',
};

export default meta;

export const Editable: StoryObj<typeof EditorGlyphExample> = {};

export const Generated: StoryObj<typeof EditorGlyphExample> = {
  args: { variant: 'generated' },
};

export const Dark: StoryObj<typeof EditorGlyphExample> = {
  parameters: { codegenaTheme: 'dark' },
};
