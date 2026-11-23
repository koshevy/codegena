import type { ReactElement, ReactNode } from 'react';

import { IllustrationCaptionStyles } from './illustration-caption.styles';

interface IllustrationCaptionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function IllustrationCaption({
  children,
  className,
  id,
}: IllustrationCaptionProps): ReactElement {
  return (
    <IllustrationCaptionStyles
      className={className}
      id={id}
      variant="body2"
    >
      {children}
    </IllustrationCaptionStyles>
  );
}
