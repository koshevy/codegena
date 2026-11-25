import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { type ReactElement, useId } from 'react';

import { saveCookieConsent } from './cookie-consent-storage';
import { useCookieConsentSnapshot } from './use-saved-user-acception';
import type { WeUseCookiesProps } from './we-use-cookies.props';
import { cookieNoticeClasses, WeUseCookiesStyles } from './we-use-cookies.styles';
import { GradientButton } from '../buttons';

/**
 * Presents a browser storage notice until the visitor records a choice.
 */
export function WeUseCookies({
  privacyPolicyHref,
  repoLink,
  rickNRollLink = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
}: WeUseCookiesProps): ReactElement {
  const titleId = useId();
  const consent = useCookieConsentSnapshot();

  return (
    <WeUseCookiesStyles
      anchor="bottom"
      open={consent === null}
      PaperProps={{ 'aria-labelledby': titleId, 'role': 'region' }}
      SlideProps={{ mountOnEnter: true, unmountOnExit: true }}
      variant="persistent"
    >
      <Typography
        component="h2"
        id={titleId}
        variant="h6"
      >
        Cookies and privacy
      </Typography>
      <Typography variant="body2">
        We use cookies, local storage, and your browser’s database to remember your theme
        and Playground settings. With your permission, we may use Google Analytics
        and telemetry to understand how the site is used.
      </Typography>
      <Typography variant="body2">
        Read our <Link href={privacyPolicyHref}>Privacy policy</Link> or review the source
        in our public{' '}
        <Link
          href={repoLink}
          rel="noopener noreferrer"
          target="_blank"
        >
          repository
        </Link>
        .
      </Typography>
      <div className={cookieNoticeClasses.actions}>
        <GradientButton
          onClick={acceptAll}
          size="small"
          variant="contained"
        >
          Accept all
        </GradientButton>
        <GradientButton
          onClick={disableAnalytics}
          size="small"
          variant="contained"
        >
          Disable analytics
        </GradientButton>
        <GradientButton
          aria-description="Leave this site without saving a choice."
          href={rickNRollLink}
          size="small"
          variant="outlined"
        >
          I don&apos;t trust at all
        </GradientButton>
      </div>
    </WeUseCookiesStyles>
  );
}

function acceptAll(): void {
  saveCookieConsent('acceptAll');
}

function disableAnalytics(): void {
  saveCookieConsent('disableAnalytics');
}
