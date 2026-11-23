import { execAudit } from './exec-npm-audit.mjs';
import { handleAuditResult } from './handle-audit-result.mjs';
import { responseToCli } from './response-to-cli.mjs';

async function run({
  cwd = process.cwd(),
  timeout = 120000,
} = {}) {
  const npmAuditResult = await execAudit({ cwd, timeout });
  const auditSummary = await handleAuditResult(npmAuditResult, cwd);

  responseToCli(auditSummary);
}

export {
  run,
};
