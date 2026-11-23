import { execFile } from 'node:child_process';

import { safeJsonParse } from './safe-json.mjs';

/**
 * Collect the complete npm audit JSON, including its normal vulnerability exit code.
 * A process failure, timeout, or incomplete report rejects the audit.
 */
export async function execAudit({ cwd = process.cwd(), timeout = 120000 } = {}) {
  const output = await new Promise((resolve, reject) => {
    execFile('npm', ['audit', '--registry=https://registry.npmjs.org/', '--json'], {
      cwd,
      timeout,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error && (error.code !== 1 || error.killed)) {
        reject(new Error(stderr || error.message, { cause: error }));

        return;
      }

      resolve(stdout);
    });
  });

  const result = safeJsonParse(output);

  if (!result || typeof result !== 'object' || !result.metadata) {
    throw new Error('Cannot read a complete npm audit report.');
  }

  return result;
}
