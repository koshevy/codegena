/**
 * Browser storage choice made by the visitor. Analytics require explicit acceptance.
 */
export type CookieConsent = 'acceptAll' | 'disableAnalytics';

export interface WeUseCookiesProps {
  privacyPolicyHref: string;
  repoLink: string;
  /**
   * Destination for visitors who leave without saving a choice.
   */
  rickNRollLink?: string;
}
