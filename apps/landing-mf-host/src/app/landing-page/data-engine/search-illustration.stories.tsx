import type { Meta, StoryFn } from '@storybook/react';
import type { ReactElement } from 'react';

import { SearchIllustration } from './search-illustration';
import { useGithubSearchSource } from '../demo-search';
import { useOrbitAngle } from '../orbit';

function SearchIllustrationStory({
  appBuildId,
}: { appBuildId: string }): ReactElement {
  const orbitAngle = useOrbitAngle();
  const searchSource = useGithubSearchSource(appBuildId);

  return (
    <SearchIllustration
      orbitAngle={orbitAngle}
      searchSource={searchSource}
    />
  );
}

const meta: Meta<typeof SearchIllustrationStory> = {
  component: SearchIllustrationStory,
  parameters: { codegenaTheme: 'dark' },
  title: 'Codegena/Landing/Graph search illustration',
};

export default meta;

export const GitHubApiSearch: StoryFn<typeof SearchIllustrationStory> = (
  SearchIllustrationStory
);
