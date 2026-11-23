#!/usr/bin/env node

import { run } from '@codegena/audit-ci';

void run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
