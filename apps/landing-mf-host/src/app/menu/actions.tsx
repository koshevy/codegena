import { GitHubLink } from '@codegena/ui-unified/branding';
import type { ReactElement } from 'react';

import { ActionsStyles } from './actions.styles';
import { GetStarted } from './get-started';
import { ThemeSwitcher } from './theme-switcher';

export function Actions(): ReactElement {
  return (
    <ActionsStyles>
      <ThemeSwitcher />
      <GitHubLink href="https://github.com/koshevy/codegena" />
      <GetStarted />
    </ActionsStyles>
  );
}
