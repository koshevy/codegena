import { ReactElement, ReactNode } from 'react';

import {
  TokenGridLayout,
  TokenGridStyles,
  TokenGroupBlock,
  TokenGroupDescription,
  TokenGroupTitle,
} from './token-group.styles';

export interface TokenGroupProps {
  children: ReactNode;
  description?: string;
  layout?: TokenGridLayout;
  title: string;
}

/**
 * @internal
 */
export function TokenGroup({
  children,
  description,
  layout = 'compact',
  title,
}: TokenGroupProps): ReactElement {
  const renderedDescription = description && (
    <TokenGroupDescription
      color="text.secondary"
      variant="caption"
    >
      {description}
    </TokenGroupDescription>
  );

  return (
    <TokenGroupBlock>
      <TokenGroupTitle variant="subtitle1">{title}</TokenGroupTitle>
      {renderedDescription}
      <TokenGridStyles layout={layout}>{children}</TokenGridStyles>
    </TokenGroupBlock>
  );
}
