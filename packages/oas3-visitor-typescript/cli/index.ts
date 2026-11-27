#!/usr/bin/env node

import { runCli } from './run-cli';

void runCli().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
