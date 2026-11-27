import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';

import { IdeIllustration } from './ide-illustration';
import { useOrbitAngle } from '../orbit';

function IdeIllustrationStory(): ReactElement {
  const orbitAngle = useOrbitAngle();

  return <IdeIllustration orbitAngle={orbitAngle} />;
}

const meta: Meta<typeof IdeIllustration> = {
  component: IdeIllustration,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/IDE plugins illustration',
};

export default meta;

export const ThreeEditors: StoryObj<typeof IdeIllustration> = {
  render: () => <IdeIllustrationStory />,
};
