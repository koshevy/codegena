import { PlaygroundConvertingPlaceholder }
  from '@codegena/playground-ui/converting-placeholder';
import { useContext, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';

import { PlaygroundHostContext } from '../host-navigation';
import { ApplicationLayoutStyles } from './application-layout.styles';
import { SpecificationExampleLink } from './specification-example-link';
import { specificationExamples } from './specification-examples';

export function ApplicationLayout(): ReactElement {
  const navigation = useNavigation();
  const isEmbedded = !!useContext(PlaygroundHostContext);

  const renderedExamples = useMemo(() => specificationExamples.map((example) => (
    <SpecificationExampleLink
      key={example.path}
      {...example}
    />
  )), []);

  const renderedNavigation = !isEmbedded && (
    <nav aria-label="Example specifications">{renderedExamples}</nav>
  );

  const renderedContent = navigation.state === 'loading'
    ? <PlaygroundConvertingPlaceholder />
    : <Outlet />;

  return (
    <ApplicationLayoutStyles>
      {renderedNavigation}
      <main aria-label="Specification playground">{renderedContent}</main>
    </ApplicationLayoutStyles>
  );
}
