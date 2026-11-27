import { useContext, type ReactElement } from 'react';
import { useLoaderData } from 'react-router-dom';

import { SpecificationPlayground } from './specification-playground';
import type { ConvertedSpecification } from '../../services/specification';
import { PlaygroundHostContext } from '../host-navigation';

export function PlaygroundRoute(): ReactElement {
  const onSandwichButtonClick = useContext(PlaygroundHostContext);
  const specification = useLoaderData<ConvertedSpecification>();

  return (
    <SpecificationPlayground
      onSandwichButtonClick={onSandwichButtonClick}
      specification={specification}
    />
  );
}
