import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  cweIdRegex,
  cweBaseUrl,
  ghsaBaseUrl,
  ghsaIdRegex,
} from './config.mjs';
import {
  WrongCollectionError,
  WrongPropertyInCollectionError,
} from './errors/index.mjs';
/**
 * @return {VulnerabilitiesIgnoreContent}
 */
function readVulnerabilitiesIgnoreFile(cwd = process.cwd()) {
  const ignoreFilePath = join(cwd, '.vulnerabilities-ignore.json');

  try {
    return JSON.parse(readFileSync(ignoreFilePath, 'utf8'));
  }
  catch (error) {
    throw new Error([
      `Failed to read required ${ignoreFilePath} file!`,
      `Original error: ${String(error)}`,
    ].join('\n'), { cause: error });
  }
}

/**
 * @return {ParsedVulnerabilitiesIgnoreInfo}
 */
function parseVulnerabilitiesIgnore(cwd = process.cwd()) {
  /**
   * @type {VulnerabilitiesIgnoreContent}
   */
  const ignoredVulnerabilities = readVulnerabilitiesIgnoreFile(cwd);

  if (!ignoredVulnerabilities.cwe || !Array.isArray(ignoredVulnerabilities.cwe)) {
    throw new WrongCollectionError('CWE', { value: ignoredVulnerabilities });
  }

  const result = { cwe: {}, ghsa: {} };

  ignoredVulnerabilities.cwe.forEach((cwe, index) => {
    if (typeof cwe !== 'object' || !cwe) {
      throw new WrongCollectionError('CWE', { index, value: cwe });
    }

    const { description, expires, id } = cwe;

    if (typeof id !== 'string' || !cweIdRegex.test(id)) {
      throw new WrongPropertyInCollectionError('CWE', {
        index, propertyName: 'id', value: id,
      });
    }

    if (typeof expires !== 'string' || !expires) {
      throw new WrongPropertyInCollectionError('CWE', {
        index, propertyName: 'expires', value: expires,
      });
    }

    const expiresParsed = new Date(expires);

    if (expiresParsed.toString() === 'Invalid Date') {
      throw new WrongPropertyInCollectionError('CWE', {
        index, propertyName: 'expires', value: expires,
      });
    }

    Object.defineProperty(result.cwe, id, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {
        expires: expiresParsed,
        url: `${cweBaseUrl}/${id.replace('CWE-', '')}`,
        ...(description && { description }),
      },
    });
  });

  if (!ignoredVulnerabilities.ghsa || !Array.isArray(ignoredVulnerabilities.ghsa)) {
    throw new WrongCollectionError('GHSA', { value: ignoredVulnerabilities });
  }

  ignoredVulnerabilities.ghsa.forEach((ghsa, index) => {
    if (typeof ghsa !== 'object' || !ghsa) {
      throw new WrongCollectionError('GHSA', { index, value: ghsa });
    }

    const { description, id, expires, url } = ghsa;

    const expiresParsed = new Date(expires);

    if (expiresParsed.toString() === 'Invalid Date') {
      throw new WrongPropertyInCollectionError('GHSA', {
        index, propertyName: 'expires', value: expires,
      });
    }

    if (!!id && !!url) {
      throw new WrongPropertyInCollectionError('GHSA', {
        index,
        propertyName: 'url',
        value: url,
        additionalMessage: 'Both properties: url and id cannot be passed!',
      });
    }

    if (!id && !url) {
      throw new WrongPropertyInCollectionError('GHSA', {
        index,
        propertyName: 'id',
        value: id,
        additionalMessage: 'id or url MUST be passed!',
      });
    }

    if (id && (typeof id !== 'string' || !ghsaIdRegex.test(id))) {
      throw new WrongPropertyInCollectionError('GHSA', {
        index, propertyName: 'id', value: id,
      });
    }

    if (id) {
      Object.defineProperty(result.ghsa, id, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: {
          expires: expiresParsed,
          url: `${ghsaBaseUrl}/${id}`,
          ...(description && { description }),
        },
      });

      return;
    }

    if (typeof url !== 'string' || !url.startsWith(ghsaBaseUrl)) {
      throw new WrongPropertyInCollectionError('GHSA', {
        index, propertyName: 'url', value: url,
      });
    }

    const inferredId = url.replace(`${ghsaBaseUrl}/`, '');

    if (!ghsaIdRegex.test(inferredId)) {
      throw new WrongPropertyInCollectionError('GHSA', {
        index,
        propertyName: 'url',
        value: url,
        additionalMessage: 'URL of GHSA has wrong ID!',
      });
    }

    Object.defineProperty(result.ghsa, inferredId, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {
        expires: expiresParsed,
        url,
        ...(description && { description }),
      },
    });
  });

  return result;
}

export {
  parseVulnerabilitiesIgnore,
  readVulnerabilitiesIgnoreFile,
};
