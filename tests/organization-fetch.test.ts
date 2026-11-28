/* Ochrona zapisów po zmianie firmy (PR #28): każde wywołanie /api z komponentów przeglądarki idzie przez
   useOrganizationFetch() (nagłówek x-avero-organization). Wyjątek: /api/v1/me/* — konto, a nie firma
   (preferencje, przełączanie firmy). Test pilnuje src/components i src/lib/collection (M0.4). */
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..');
function files(dir: string): string[] {
  return readdirSync(dir).flatMap(n => { const p = join(dir, n); return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(n) ? [p] : []; });
}

describe('fetch do /api z przeglądarki', () => {
  it('idzie przez organizationFetch (poza /api/v1/me/*)', () => {
    const offenders: string[] = [];
    for (const f of [...files(join(root, 'src/components')), ...files(join(root, 'src/lib/collection'))]) {
      const text = readFileSync(f, 'utf8');
      for (const m of text.matchAll(/(?<![A-Za-z.])fetch\(\s*[`'"](\/api[^`'"]*)/g)) {
        if (m[1]!.startsWith('/api/v1/me/')) continue;
        offenders.push(`${f.slice(root.length + 1)}: ${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
