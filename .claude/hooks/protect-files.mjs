#!/usr/bin/env node
// PreToolUse (Edit|Write|MultiEdit): blokuje edycję plików, których Claude Code nie powinien zmieniać.
// Exit 2 = edycja zablokowana, komunikat ze stderr trafia do Claude.
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rel = relative(root, resolve(root, filePath)).split('\\').join('/');

const block = (why) => {
  process.stderr.write(`Zablokowano edycję ${rel}: ${why}\n`);
  process.exit(2);
};

const base = rel.split('/').pop();
if (base.startsWith('.env') && base !== '.env.example') block('pliki .env zawierają sekrety. Nowe zmienne dopisz do .env.example.');
if (/^deploy\/.*\.env$/.test(rel)) block('plik z sekretami wdrożenia.');
if (rel.startsWith('docs/design/') || rel.startsWith('design/')) {
  block('to obszar czatu projektowego. Uwagi zapisz w docs/STATUS.md w sekcji „Pytania do projektu”.');
}
if (rel === 'pnpm-lock.yaml') block('lockfile zmienia tylko pnpm (pnpm add / pnpm install), po zgodzie właściciela na nową zależność.');
if (rel.startsWith('supabase/migrations/') && existsSync(resolve(root, rel))) {
  block('istniejących migracji nie edytuje się. Utwórz nowy plik RRRRMMDDNNNN_opis.sql.');
}
process.exit(0);
