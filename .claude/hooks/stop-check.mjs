#!/usr/bin/env node
// Stop: zanim Claude zakończy turę ze zmianami w kodzie — typy, testy powiązane ze zmianą i STATUS.md.
// Exit 2 = Claude nie kończy, tylko poprawia to, co zgłoszono.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
if (input.stop_hook_active) process.exit(0); // ochrona przed pętlą: druga próba zawsze przechodzi

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const run = (cmd, args, timeout = 240_000) =>
  execFileSync(cmd, args, { cwd: root, stdio: 'pipe', timeout, encoding: 'utf8', shell: process.platform === 'win32' });

let changed = [];
try {
  changed = run('git', ['status', '--porcelain', '--untracked-files=all'])
    .split('\n').filter(Boolean).map((l) => l.slice(3).trim().replace(/^.* -> /, ''));
} catch { process.exit(0); }

const code = changed.filter((f) => /^(src|packages|tests|supabase)\//.test(f));
if (!code.length) process.exit(0);

const problems = [];
const tail = (e) => `${e.stdout ?? ''}${e.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n');

const ts = code.filter((f) => /\.(ts|tsx)$/.test(f));
if (ts.length) {
  try { run('pnpm', ['-s', 'typecheck']); } catch (e) { problems.push(`pnpm typecheck nie przechodzi:\n${tail(e)}`); }
  try { run('pnpm', ['exec', 'vitest', 'related', '--run', '--passWithNoTests', ...ts]); }
  catch (e) { problems.push(`Testy powiązane ze zmianą nie przechodzą:\n${tail(e)}`); }
}

if (code.some((f) => /^(src|supabase\/migrations)\//.test(f)) && !changed.includes('docs/STATUS.md')) {
  problems.push('Zmieniono kod, ale nie zaktualizowano docs/STATUS.md (co zrobiono, odstępstwa od makiety, pytania do projektu).');
}

if (problems.length) {
  process.stderr.write(problems.join('\n\n') + '\n');
  process.exit(2);
}
process.exit(0);
