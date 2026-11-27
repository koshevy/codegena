import { GradientButton } from '@codegena/ui-unified/buttons';
import Link from '@docusaurus/core/lib/client/exports/Link';
import type OriginalLink from '@docusaurus/theme-classic/lib/theme/PaginatorNavLink';
import { clsx } from 'clsx';
import type { ReactElement } from 'react';

export default function PaginatorNavLink({
  isNext,
  permalink,
  title,
}: Parameters<typeof OriginalLink>[0]): ReactElement {
  return (
    <GradientButton
      className={clsx('pagination-nav__link', {
        'pagination-nav__link--next': isNext,
        'pagination-nav__link--prev': !isNext,
      })}
      component={Link}
      to={permalink}
      variant="outlined"
    >
      <span className="pagination-nav__label">{title}</span>
    </GradientButton>
  );
}
