import Typography from '@mui/material/Typography';
import type { MotionValue } from 'motion/react';
import type { ReactElement } from 'react';
import { SiCursor, SiJetbrains } from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

import {
  ideIllustrationClasses,
  IdeIllustrationStyles,
} from './ide-illustration.styles';
import { Orbit } from '../orbit';

interface IdeIllustrationProps {
  orbitAngle: MotionValue<number>;
}

/**
 * Shows the editors planned for Codegena's integrated UI.
 */
export function IdeIllustration({
  orbitAngle,
}: IdeIllustrationProps): ReactElement {
  return (
    <IdeIllustrationStyles
      aria-label="IDE plugin preview"
      role="group"
    >
      <div className={ideIllustrationClasses.canvas}>
        <Orbit
          angle={orbitAngle}
          phrase="Soon!"
          repetitions={12}
          tone="warning"
        />
        <div
          aria-label="Visual Studio Code"
          className={ideIllustrationClasses.editor}
          data-editor="vscode"
          role="img"
        >
          <VscVscode aria-hidden />
          <Typography component="span">VS Code</Typography>
        </div>
        <div
          aria-label="JetBrains IDEs"
          className={ideIllustrationClasses.editor}
          data-editor="jetbrains"
          role="img"
        >
          <SiJetbrains aria-hidden />
          <Typography component="span">JetBrains</Typography>
        </div>
        <div
          aria-label="Cursor"
          className={ideIllustrationClasses.editor}
          data-editor="cursor"
          role="img"
        >
          <SiCursor aria-hidden />
          <Typography component="span">Cursor</Typography>
        </div>
      </div>
    </IdeIllustrationStyles>
  );
}
