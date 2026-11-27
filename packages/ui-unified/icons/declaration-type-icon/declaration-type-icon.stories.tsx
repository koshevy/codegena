import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { DeclarationTypeIcon } from './declaration-type-icon';
import type { DeclarationGlyphKind } from './declaration-type-icon.props';

const declarationKinds: DeclarationGlyphKind[] = [
  'Interface',
  'Namespace',
  'Union',
  'Intersection',
  'Array',
  'Record',
  'Literal',
  'Scalar',
  'Alias',
];

const meta: Meta<typeof DeclarationTypeIcon> = {
  args: {
    declarationType: 'Interface',
    onClick: fn(),
  },
  component: DeclarationTypeIcon,
  title: 'Codegena/Unified UI/Icons/Declaration Type Icon',
};

export default meta;

export const Default: StoryObj<typeof DeclarationTypeIcon> = {};

export const AllKinds: StoryObj<typeof DeclarationTypeIcon> = {
  render: (args) => (
    <Stack
      direction="row"
      spacing={1}
    >
      {declarationKinds.map((declarationType) => (
        <DeclarationTypeIcon
          key={declarationType}
          {...args}
          declarationType={declarationType}
        />
      ))}
    </Stack>
  ),
};

export const MenuIcon: StoryObj<typeof DeclarationTypeIcon> = {
  args: {
    asButton: false,
    noHoverStyles: true,
    onClick: undefined,
    title: null,
  },
};

export const Disabled: StoryObj<typeof DeclarationTypeIcon> = {
  args: { disabled: true },
};

export const Dark: StoryObj<typeof DeclarationTypeIcon> = {
  parameters: { codegenaTheme: 'dark' },
};
