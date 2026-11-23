export declare interface ExpirableRecord {
  description?: string;
  /**
   * When this ignore becomes outdated, the ISO-8601 date
   */
  expires: string;
}

/**
 * **CWE** means "Common Weakness Enumeration".
 * The `CweIgnoreRecord` allows you to describe a rule
 * how to ignore a group of vulnerabilities by
 * a weakness these vulnerabilities represents.
 *
 * Example of CWE explained: https://cwe.mitre.org/data/definitions/400.html
 *
 * @see https://cwe.mitre.org/data/index.html
 */
export declare interface CweIgnoreRecord extends ExpirableRecord {
  /**
   * @example 'CWE-400'
   */
  id: string;
}

/**
 * **GHSA** means "GitHub Security Advisories".
 * The `GhsaIgnoreRecord` allows you to describe a rule
 * how to ignore specified vulnerabilities by related record in
 * the [GitHub Advisory Database](https://github.com/advisories)
 *
 * Every `GhsaIgnoreRecord` MUST have `id` or `url`.
 */
export declare interface GhsaIgnoreRecord extends ExpirableRecord {
  /**
   * ID of an GHSA-record in the
   * [GitHub Advisory Database](https://github.com/advisories)
   *
   * @example 'GHSA-2g4f-4pwh-qvx6'
   */
  id?: `GHSA-${string}`;
  /**
   * @example 'https://github.com/advisories/GHSA-2g4f-4pwh-qvx6'
   */
  url?: `https://github.com/advisories/GHSA-${string}`;
}

export declare interface VulnerabilitiesIgnoreContent {
  cwe: CweIgnoreRecord[];
  ghsa: GhsaIgnoreRecord[];
}

export declare interface ParsedIgnoreRecord {
  description?: string;
  expires: Date;
  url: string;
}

export declare interface ParsedVulnerabilitiesIgnoreInfo {
  cwe: Record<string, ParsedIgnoreRecord>;
  ghsa: Record<string, ParsedIgnoreRecord>;
}
