import Link from '@mui/material/Link';
import type { ReactElement } from 'react';

import { CodegenaContact } from '../contact';
import { CodegenaWordmark } from '../wordmark';
import type { SiteFooterProps } from './site-footer.props';
import { footerClasses, FooterStyles } from './site-footer.styles';

export function SiteFooter({
  brand,
  linkComponent = 'a',
  navigation,
  policies,
  trailing,
}: SiteFooterProps): ReactElement {
  const renderedBrand = brand ?? <CodegenaWordmark />;

  const renderedNavigation = navigation.map(({ href, label }) => (
    <Link
      component={linkComponent}
      href={href}
      key={label}
    >
      {label}
    </Link>
  ));

  const renderedPolicies = policies.map(({ href, label }) => (
    <Link
      component={linkComponent}
      href={href}
      key={label}
    >
      {label}
    </Link>
  ));

  return (
    <FooterStyles
      aria-label="Site footer"
      component="footer"
    >
      <div className={footerClasses.top}>
        <nav
          aria-label="Footer navigation"
          className={footerClasses.navigation}
        >
          {renderedNavigation}
        </nav>
        <CodegenaContact className={footerClasses.contact} />
      </div>
      <div className={footerClasses.bottom}>
        {renderedBrand}
        <nav
          aria-label="Policies"
          className={footerClasses.policies}
        >
          {renderedPolicies}
        </nav>
        {trailing}
      </div>
    </FooterStyles>
  );
}
