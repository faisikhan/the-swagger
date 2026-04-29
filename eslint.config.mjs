// Biome is the primary linter/formatter for this project.
// This file exists for Nx compatibility only.
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**'] },
];
