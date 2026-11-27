export type {
  NpmAuditMetadata,
  NpmAuditResult,
  NpmAuditVulnerabilities,
  NpmAuditVulnerability,
  NpmAuditVulnerabilityInfo,
} from './typings/npm-audit-result.js';
export type {
  SummarizedAuditInfo,
  VulnerabilitiesSummary,
} from './typings/summarized-audit-info.js';
export type {
  CweIgnoreRecord,
  ExpirableRecord,
  GhsaIgnoreRecord,
  ParsedIgnoreRecord,
  ParsedVulnerabilitiesIgnoreInfo,
  VulnerabilitiesIgnoreContent,
} from './typings/vulnerabilities-ignore-content.js';

export interface AuditOptions {
  cwd?: string;
  timeout?: number;
}

/**
 * Runs npm audit and rejects if any advisory lacks an active exception.
 * Reads .vulnerabilities-ignore.json from cwd, which defaults to the current directory.
 */
export declare function run(options?: AuditOptions): Promise<void>;
