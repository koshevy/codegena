import { ghsaBaseUrl, ghsaIdRegex } from './config.mjs';
import { decideShouldBeIgnored } from './decide-should-be-ignored.mjs';
import { parseVulnerabilitiesIgnore } from './parse-vulnerabilities-ignore.mjs';

function mapAdvisoryToSummary(info, dependency, nodes, ignoreRules) {
  const { cwe, range, severity, title, url } = info ?? {};

  const isValidAdvisory = typeof url === 'string'
    && url.startsWith(`${ghsaBaseUrl}/`)
    && typeof title === 'string'
    && typeof range === 'string'
    && typeof severity === 'string'
    && Array.isArray(cwe)
    && cwe.every((id) => typeof id === 'string');

  if (!isValidAdvisory) {
    throw new Error(`Invalid advisory data for ${dependency}.`);
  }

  const ghsaId = url.slice(ghsaBaseUrl.length + 1);

  if (!ghsaIdRegex.test(ghsaId)) {
    throw new Error(`Invalid advisory URL for ${dependency}.`);
  }

  const { shouldBeIgnored, reason } = decideShouldBeIgnored({
    cwe,
    dependency,
    ghsaId,
    ghsaTitle: title,
    ignoreRules,
    versionRange: range,
  });

  return {
    cwe,
    dependency,
    id: ghsaId,
    ignoreReason: reason,
    nodes: nodes ?? [],
    range,
    severity,
    shouldBeIgnored,
    title,
    url,
  };
}

function mapDependencyAdvisories([dependency, { nodes, via }], ignoreRules) {
  if (!via || typeof via === 'string') {
    return [];
  }

  return via.filter((info) => typeof info !== 'string').map((info) => (
    mapAdvisoryToSummary(info, dependency, nodes, ignoreRules)
  ));
}

export async function handleAuditResult(auditResult, cwd = process.cwd()) {
  if (!auditResult) {
    throw new Error('No audit result passed. Try npm audit.');
  }

  const { auditReportVersion, metadata, vulnerabilities } = auditResult;

  if (auditReportVersion !== 2) {
    throw new Error(`Only auditReportVersion=2 is supported. Got ${auditReportVersion}.`);
  }

  const ignoreRules = parseVulnerabilitiesIgnore(cwd);
  const totalVulnerabilities = metadata.vulnerabilities.total;

  const allVulnerabilities = Object.entries(vulnerabilities).flatMap((entry) => (
    mapDependencyAdvisories(entry, ignoreRules)
  ));

  const hasMissingAdvisories = totalVulnerabilities > 0
    && allVulnerabilities.length === 0;

  if (hasMissingAdvisories) {
    throw new Error('npm reported vulnerabilities without advisory details.');
  }

  return { totalVulnerabilities, allVulnerabilities };
}
