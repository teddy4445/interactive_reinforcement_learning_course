import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'release/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', '.local/**'] },
  js.configs.recommended,
  { files: ['**/*.{js,mjs}'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
