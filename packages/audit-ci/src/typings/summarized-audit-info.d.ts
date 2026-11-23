export declare interface VulnerabilitiesSummary {
  /**
   * @example ['CWE-400']
   */
  cwe: string[];
  /**
   * @example 'ajv'
   */
  dependency: string;
  /**
   * @example 'GHSA-2g4f-4pwh-qvx6'
   */
  id: `GHSA-${string}`;
  /**
   * Explanation why this vulnerability has to be ignored
   */
  ignoreReason?: string;
  /**
   * @example
   * ```
   * [
   *   "node_modules/@eslint/eslintrc/node_modules/ajv",
   *   "node_modules/eslint/node_modules/ajv",
   *   "node_modules/file-loader/node_modules/ajv"
   * ]
   * ```
   */
  nodes: string[];
  range: string;
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  shouldBeIgnored: boolean;
  title: string;
  /**
   * @example 'https://github.com/advisories/GHSA-2g4f-4pwh-qvx6'
   */
  url: `https://github.com/advisories/GHSA-${string}`;
}

export declare interface SummarizedAuditInfo {
  totalVulnerabilities: number;
  allVulnerabilities: VulnerabilitiesSummary[];
}
