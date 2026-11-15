import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({ resolve: { alias: { '@hvac/api-client': fileURLToPath(new URL('./packages/api-client/src/index.ts', import.meta.url)), '@': fileURLToPath(new URL('./src', import.meta.url)) } } });
