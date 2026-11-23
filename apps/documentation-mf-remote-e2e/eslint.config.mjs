import baseConfig from '@codegena/infr-nx/eslint-config/root.config.mjs';
import playwright from 'eslint-plugin-playwright';

export default [playwright.configs['flat/recommended'], ...baseConfig];
