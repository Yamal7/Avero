#!/usr/bin/env node
// PostToolUse (Edit|Write|MultiEdit): ESLint --fix na edytowanym pliku + kontrola surowych kolorów.
// Exit 2 = plik już zapisany, ale Claude dostaje listę problemów do poprawienia.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const abs = resolve(root, filePath);
const rel = relative(root, abs).split('\\').join('/');
if (!existsSync(abs) || rel.startsWith('..')) process.exit(0);

const problems = [];

// 1. ESLint z automatyczną poprawką
if (/\.(ts|tsx|mjs|js)$/.test(rel) && /^(src|packages|tests|scripts)\//.test(rel)) {
  try {
    execFileSync('pnpm', ['exec', 'eslint', '--fix', '--max-warnings=0', rel], {
      cwd: root, stdio: 'pipe', timeout: 60_000, shell: process.platform === 'win32',
    });
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`.trim();
    if (out) problems.push(`ESLint:\n${out.split('\n').slice(0, 30).join('\n')}`);
  }
}

// 2. Precision UI: w komponentach i ekranach tylko tokeny, bez surowych kolorów
const tokenFiles = ['src/app/precision.css', 'src/app/globals.css'];
if (/^src\/(components|app)\/.*\.(tsx|css)$/.test(rel) && !tokenFiles.includes(rel)) {
  const hits = readFileSync(abs, 'utf8').split('\n')
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => /#[0-9a-fA-F]{3,8}\b(?![\w-])|rgba?\(\s*\d/.test(line) && !/var\(--/.test(line))
    .slice(0, 10);
  if (hits.length) {
    problems.push('Surowe kolory zamiast tokenów (użyj var(--…) z precision.css):\n' +
      hits.map(([n, l]) => `  ${rel}:${n}  ${l.trim()}`).join('\n'));
  }
}

if (problems.length) {
  process.stderr.write(problems.join('\n\n') + '\n');
  process.exit(2);
}
process.exit(0);
