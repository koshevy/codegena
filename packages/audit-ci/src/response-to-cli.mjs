import {
  cb,
  r,
  rb,
  reset,
} from './ansi-colors.mjs';
import { cweBaseUrl } from './config.mjs';

/**
 * @param {SummarizedAuditInfo} summarizedAuditInfo
 */
function responseToCli(summarizedAuditInfo) {
  const nonIgnoredVulnerabilityCount = summarizedAuditInfo.allVulnerabilities
    .filter((info) => !info.shouldBeIgnored).length;

  summarizedAuditInfo.allVulnerabilities.forEach((info) => {
    if (info.shouldBeIgnored) {
      console.warn(info.ignoreReason);
    }
    else {
      console.error([
        `${rb}${info.id}:${reset} ${r}${info.title}${reset}`,
        `${rb}Record at GHSA-database:${reset} ${r}${info.url}${reset}`,
        `${rb}Severity:${reset} ${r}${info.severity}${reset}`,
        `${rb}Dependency:${reset} ${r}${info.dependency}${reset}`,
        `${rb}Version range:${reset} ${r}${info.range}${reset}`,
        `${rb}Related CWEs:${reset}`,
        ...info.cwe.map((cweId) => (
          `${r}- ${cweBaseUrl}/${cweId.replace('CWE-', '')}${reset}`
        )),
        '',
      ].join('\n'));
    }
  });

  if (nonIgnoredVulnerabilityCount) {
    console.error([
      `${rb}Found unhandled vulnerabilities (${nonIgnoredVulnerabilityCount})${reset}`,
      `${r}See detailed info above${reset}`,
      `${r}Please, use${reset} ${rb}npm audit${reset}${r} to get complete info!${reset}`,
    ].join('\n'));

    throw new Error('Found unhandled vulnerabilities. See above.');
  }

  const totalVulnerabilities = summarizedAuditInfo.allVulnerabilities.length;

  process.stdout.write(
    `${cb}Unhandled vulnerabilities not found (total: ${totalVulnerabilities})${reset}\n`,
  );
}

export {
  responseToCli,
};
