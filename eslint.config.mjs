import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import avero from './eslint-rules/tailwind-tokens.mjs';
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**', 'design/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Tailwind tylko na tokenach (M0.2): bez wartości dowolnych i odstępów spoza siatki 4 px
  { files: ['src/components/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'], plugins: { avero }, rules: { 'avero/tailwind-tokens': 'error' } },
];

export default config;
