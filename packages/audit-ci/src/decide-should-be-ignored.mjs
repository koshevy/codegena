import { reset, y, yb } from './ansi-colors.mjs';
import { ghsaBaseUrl, cweBaseUrl } from './config.mjs';

/**
 * Decides whether vulnerability should be ignored or no.
 * Makes decision based on list of CWEs and ID of GHSA.
 *
 * @param {number[]} cwe
 * @param {string} dependency
 * @param {string} ghsaId
 * @param {string} ghsaTitle
 * @param {ParsedVulnerabilitiesIgnoreInfo} ignoreRules
 * @param {string} versionRange
 * @return {{ shouldBeIgnored: boolean, reason?: 'string' }}
 */
function decideShouldBeIgnored({
  cwe,
  dependency,
  ghsaId,
  ghsaTitle,
  ignoreRules,
  versionRange,
}) {
  if (cwe?.length) {
    const filteredCwe = cwe.filter((cweId) => {
      const ignoreRule = Object.hasOwn(ignoreRules.cwe, cweId)
        ? ignoreRules.cwe[cweId]
        : undefined;

      // if no ignore rule for this cwe, it is active
      if (!ignoreRule) {
        return true;
      }

      const { expires } = ignoreRule;

      // if it expires, it is already active
      return expires < new Date();
    });

    // Considering ignored because all related CWE are ignored
    if (!filteredCwe.length) {
      const reason = [
        `${yb}${ghsaId} is ignored because all related CWEs are ignored.\u{1B}[0m`,
        `${yb}Dependency:${reset} ${y}${dependency} (${versionRange})${reset}\n`,
        `${yb}Title:${reset} ${y}${ghsaTitle}${reset}`,
        `${yb}More info at GHSA-database:${reset} ${y}${ghsaBaseUrl}/${ghsaId}${reset}`,
        `${yb}Ignored CWEs:${reset}\n`,
        ...cwe.map((cweId) => {
          const ignoreRule = ignoreRules.cwe[cweId];

          if (!ignoreRule) {
            return null;
          }

          const isoDate = ignoreRule.expires.toISOString();
          const description = ignoreRule.description ?? 'NO COMMENT ATTACHED';

          return [
            `${yb}${cweId}${reset}`,
            `${y} is ignored till ${reset}${yb}${isoDate}${reset}`,
            `${y} with comment:\n${description}${reset}\n`,
            `${yb}More info about ${cweId}:${reset} ${y}${ignoreRule.url}${reset}`,
            `\n`,
          ].join('');
        }),
      ]
        .filter(Boolean)
        .join(`\n`);

      return {
        shouldBeIgnored: true,
        reason,
      };
    }
  }

  // Considering ignored by GHSA directly
  if (ghsaId) {
    const ignoreRule = ignoreRules.ghsa[ghsaId];

    if (!ignoreRule || (ignoreRule.expires < new Date())) {
      return { shouldBeIgnored: false };
    }

    const isoDate = ignoreRule.expires.toISOString();
    const description = ignoreRule.description ?? 'NO COMMENT ATTACHED';

    const reason = [
      `${yb}${ghsaId}${reset}`,
      `${y} is ignored till ${reset}${yb}${isoDate}${reset}`,
      `${y} with comment:\n${description}${reset}\n`,
      `${yb}Dependency:${reset} ${y}${dependency} (${versionRange})${reset}\n`,
      `${yb}Title:${reset} ${y}${ghsaTitle}${reset}\n`,
      `${yb}More info about ${ghsaId}:${reset} ${y}${ignoreRule.url}${reset}\n`,
      `${yb}CWEs:${reset}\n`,
      ...cwe.map((cweId) => (
        `${y}- ${cweBaseUrl}/${cweId.replace('CWE-', '')}${reset}\n`
      )),
    ].join('');

    return {
      description: ignoreRule.description,
      reason,
      shouldBeIgnored: true,
    };
  }

  throw new Error('Unexpected error: expected to get `cwe` or `ghsaId` params.');
}

export {
  decideShouldBeIgnored,
};
