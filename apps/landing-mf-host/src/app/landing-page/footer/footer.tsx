import { CodegenaWordmark, SiteFooter } from '@codegena/ui-unified/branding';
import type { ReactElement } from 'react';

import { menuAction, menuItems, policyItems } from '../../menu';
import { HostLink } from '../../navigation';
import { SectionProgress } from '../section-indicator';

const navigation = [
  ...menuItems.filter(({ label }) => label !== 'Playground'),
  menuAction,
  ...menuItems.filter(({ label }) => label === 'Playground'),
];

export function Footer(): ReactElement {
  const renderedProgress = (
    <SectionProgress
      current={8}
      hasScrollCue
    />
  );

  const renderedBrand = (
    <HostLink
      aria-label="Codegena home"
      href="/"
    >
      <CodegenaWordmark />
    </HostLink>
  );

  return (
    <SiteFooter
      brand={renderedBrand}
      linkComponent={HostLink}
      navigation={navigation}
      policies={policyItems}
      trailing={renderedProgress}
    />
  );
}
