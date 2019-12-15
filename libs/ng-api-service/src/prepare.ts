/**
 * Prepares environment for tests.
 * TypeScript —> Node.js file.
 */

import fs from 'fs';
import path from 'path';

import { createApiServiceWithTemplate } from './lib/templates/index';

// Mock data for tests
import { FindPetsService } from './lib/mocks/template.data';

declare const RegExp;

// NPM-package data
const packageJson = require('../package.json');
const packageName = packageJson.name;

// Before tests: initialize mock services
const findPetsTemplate = createApiServiceWithTemplate(FindPetsService) as any;

fs.writeFileSync(
    path.resolve(__dirname, '../src/auto-generated/find-pets.api.service.ts'),
    findPetsTemplate.replace(new RegExp(`${packageName}\/?(lib\/)?`, 'g'), '../lib/')
);

fs.writeFileSync(
    path.resolve(__dirname, '../src/auto-generated/index.ts'),
    'export * from \'./find-pets.api.service\';\n'
);
