export declare interface NpmAuditMetadata {
  vulnerabilities: {
    critical: number;
    high: number;
    info: number;
    low: number;
    moderate: number;
    total: number;
  };
  dependencies: {
    dev: number;
    optional: number;
    peer: number;
    peerOptional: number;
    prod: number;
    total: number;
  };
}

export declare interface NpmAuditVulnerabilityInfo {
  /**
   * IDs of weakness records from CWE.
   *
   * **CWE** means "Common Weakness Enumeration".
   * Example of CWE explained: https://cwe.mitre.org/data/definitions/400.html
   *
   * @see https://cwe.mitre.org/data/index.html
   * @example
   * ```json
   * ["CWE-400"]
   * ```
   */
  cwe: string[];
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  dependency: string;
  name: string;
  source: number;
  /**
   * Range of versions affected by this vulnerability
   * @example '<6.14.0'
   */
  range: string;
  /**
   * Official human-readable title of this vulnerability
   * @example 'ajv has ReDoS when using `$data` option'
   */
  title: string;
  /**
   * URL of the vulnerability explanation in the
   * [GitHub Advisory Database](https://github.com/advisories).
   *
   * @example 'https://github.com/advisories/GHSA-2g4f-4pwh-qvx6'
   */
  url: string;
}

export declare interface NpmAuditVulnerability {
  effects: string[];
  /**
   * Name of the vulnerable package
   * @example 'ajv'
   */
  name: string;
  /**
   * Path to affected packages
   * @example
   * ```json
   * [
   *  "node_modules/@eslint/eslintrc/node_modules/ajv",
   *  "node_modules/eslint/node_modules/ajv",
   *  "node_modules/file-loader/node_modules/ajv"
   * ]
   * ```
   */
  nodes: string[];
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  /**
   * Information about original vulnerabilities.
   * It usually represented as instances in the [GHSA](https://github.com/advisories).
   */
  via?: string | (string | NpmAuditVulnerabilityInfo)[];
}

export declare interface NpmAuditVulnerabilities {
  [packageName: string]: NpmAuditVulnerability;
}

/**
 * Result of executing ` npm audit --json`
 */
export declare interface NpmAuditResult {
  auditReportVersion: 2;
  metadata: NpmAuditMetadata;
  vulnerabilities: NpmAuditVulnerabilities;
}
