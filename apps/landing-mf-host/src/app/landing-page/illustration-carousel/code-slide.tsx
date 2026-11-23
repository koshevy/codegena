import { GeneratedCodeEditor } from '@codegena/ui-unified/code-editor-minimal';
import type { ReactElement } from 'react';

import type { IllustrationCodeSlide } from './illustration-slide';

interface CodeSlideProps {
  height: string;
  slide: IllustrationCodeSlide;
}

export function CodeSlide({ height, slide }: CodeSlideProps): ReactElement {
  const ariaLabel = `Generated code editor for ${slide.fileName}`;

  return (
    <GeneratedCodeEditor
      ariaLabel={ariaLabel}
      height={height}
      value={slide.source}
    />
  );
}
