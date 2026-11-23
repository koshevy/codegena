import type { ReactElement } from 'react';

import {
  infographicsItemClasses,
  InfographicsItemStyles,
} from './infographics-item.styles';

interface InfographicsItemProps {
  description: string;
  number: string;
  title: string;
}

/**
 * One principle in the landing page's ideology list.
 */
export function InfographicsItem({
  description,
  number,
  title,
}: InfographicsItemProps): ReactElement {
  return (
    <InfographicsItemStyles component="li">
      <span className={infographicsItemClasses.number}>
        {number}
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </InfographicsItemStyles>
  );
}
