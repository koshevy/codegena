#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const output = readFileSync('.audit-output', 'utf8');
const exitCode = Number(readFileSync('.audit-exit', 'utf8'));

process.stdout.write(output.slice(0, 100));
setTimeout(() => {
  process.stdout.write(output.slice(100));
  process.exitCode = exitCode;
}, 5);
