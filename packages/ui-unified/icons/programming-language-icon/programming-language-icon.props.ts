import type { ProgrammingLanguage } from './programming-language';

export interface ProgrammingLanguageIconProps {
  language: ProgrammingLanguage;
  showTooltip?: boolean;
  size?: number | string;
}
