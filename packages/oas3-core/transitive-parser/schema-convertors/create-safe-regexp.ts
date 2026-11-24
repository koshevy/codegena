import { checkSync } from 'recheck';

export function createSafeRegExp(pattern: string): RegExp | null {
  let isSafe: boolean;

  try {
    const diagnostics = checkSync(pattern, '', {
      // Prefer static analysis for bounded repetitions.
      maxRepeatCount: 128,
      // Allow for cold JVM analysis where recheck has no native binary.
      timeout: 500,
    });

    isSafe = diagnostics.status === 'safe';
  }
  catch {
    return null;
  }

  if (!isSafe) {
    return null;
  }

  try {
    // False positive: recheck confirmed the schema pattern is safe.
    // eslint-disable-next-line secure-coding/detect-non-literal-regexp -- recheck: safe
    return new RegExp(pattern); // nosemgrep
  }
  catch {
    return null;
  }
}
