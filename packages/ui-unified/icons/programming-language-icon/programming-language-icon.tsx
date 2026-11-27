import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { FileCode2 } from 'lucide-react';
import type { ReactElement } from 'react';
import {
  SiGo,
  SiJavascript,
  SiJson,
  SiOpenjdk,
  SiPython,
  SiRust,
  SiTypescript,
} from 'react-icons/si';

import { ProgrammingLanguage } from './programming-language';
import type { ProgrammingLanguageIconProps } from './programming-language-icon.props';
import { ProgrammingLanguageIconStyles } from './programming-language-icon.styles';

function renderLanguageIcon(language: ProgrammingLanguage): ReactElement {
  switch (language) {
    case ProgrammingLanguage.Go:
      return <SiGo />;
    case ProgrammingLanguage.Java:
      return <SiOpenjdk />;
    case ProgrammingLanguage.JavaScript:
      return <SiJavascript />;
    case ProgrammingLanguage.JSON:
      return <SiJson />;
    case ProgrammingLanguage.Python:
      return <SiPython />;
    case ProgrammingLanguage.Rust:
      return <SiRust />;
    case ProgrammingLanguage.TypeScript:
      return <SiTypescript />;
    case ProgrammingLanguage.Unknown:
      return <FileCode2 />;
  }
}

export function ProgrammingLanguageIcon({
  language,
  showTooltip = true,
  size = '1rem',
}: ProgrammingLanguageIconProps): ReactElement {
  const theme = useTheme();

  return (
    <Tooltip title={showTooltip ? language : ''}>
      <ProgrammingLanguageIconStyles
        aria-label={language}
        role="img"
        sx={{
          color: theme.palette.primary.main,
          fontSize: size,
        }}
      >
        {renderLanguageIcon(language)}
      </ProgrammingLanguageIconStyles>
    </Tooltip>
  );
}
