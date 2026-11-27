const cweIdRegex = /^CWE-[0-9]+$/;
const cweBaseUrl = 'https://cwe.mitre.org/data/definitions';
const ghsaBaseUrl = 'https://github.com/advisories';
const ghsaIdRegex = /^GHSA(-[a-z0-9]{4}){3}$/;

export {
  cweIdRegex,
  cweBaseUrl,
  ghsaBaseUrl,
  ghsaIdRegex,
};
