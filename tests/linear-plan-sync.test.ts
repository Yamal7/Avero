import { describe, expect, it } from 'vitest';
// @ts-expect-error — skrypt Node w JS, bez deklaracji typów
import { buildTable, END, fetchIssues, normalize, replaceBlock, START } from '../scripts/linear-plan-sync.mjs';

const issue = (over: Record<string, unknown>) => ({
  identifier: 'KRA-1',
  title: 'Zadanie',
  description: '',
  state: { name: 'Backlog', type: 'backlog' },
  projectMilestone: { name: 'Faza 1 · Serwis' },
  inverseRelations: { nodes: [] },
  ...over,
});

describe('linear-plan-sync: normalize', () => {
  it('czyta fazę z kamienia milowego i numer modułu z opisu', () => {
    const r = normalize(
      issue({
        identifier: 'KRA-34',
        title: 'Karta urządzenia z F-gaz i CRO',
        description: 'Zakres…\n\n+++ Agent notes\n\nModuł w `docs/PLAN.md`: **M1.3**. Źródła…\n\n+++',
        inverseRelations: {
          nodes: [
            { type: 'blocks', issue: { identifier: 'KRA-64' } },
            { type: 'blocks', issue: { identifier: 'KRA-29' } },
            { type: 'related', issue: { identifier: 'KRA-50' } },
          ],
        },
      }),
    );
    expect(r).toMatchObject({ id: 'KRA-34', phase: 1, phaseName: 'Serwis', module: 'M1.3', blockedBy: ['KRA-29', 'KRA-64'] });
  });

  it('pomija zadania bez kamienia milowego „Faza N”', () => {
    expect(normalize(issue({ projectMilestone: null }))).toBeNull();
    expect(normalize(issue({ projectMilestone: { name: 'Pilotaż' } }))).toBeNull();
  });

  it('rozpoznaje numer modułu także bez pogrubienia i z literą', () => {
    expect(normalize(issue({ description: 'Moduł w `docs/PLAN.md`: M0.3.' }))?.module).toBe('M0.3');
    expect(normalize(issue({ description: 'Moduł w docs/PLAN.md: **M1.3b**' }))?.module).toBe('M1.3b');
  });
});

describe('linear-plan-sync: buildTable', () => {
  const records = [
    normalize(issue({ identifier: 'KRA-48', title: 'Obiekty', description: 'PLAN.md`: M1.1', inverseRelations: { nodes: [{ type: 'blocks', issue: { identifier: 'KRA-31' } }] } })),
    normalize(issue({ identifier: 'KRA-31', title: 'Silnik | kolekcji', description: 'PLAN.md`: M0.4', projectMilestone: { name: 'Faza 0 · Fundament UI' }, state: { name: 'Done', type: 'completed' } })),
    normalize(issue({ identifier: 'KRA-27', title: 'Wielofirmowość', description: 'PLAN.md`: M0.1', projectMilestone: { name: 'Faza 0 · Wielofirmowość' } })),
    normalize(issue({ identifier: 'KRA-70', title: 'Nowy ekran', description: 'bez numeru', inverseRelations: { nodes: [{ type: 'blocks', issue: { identifier: 'KRA-58' } }] } })),
    normalize(issue({ identifier: 'KRA-50', title: 'Reklamacje', description: 'PLAN.md`: M1.2', state: { name: 'Canceled', type: 'canceled' } })),
  ];
  const table = buildTable(records);

  it('sortuje fazy i moduły, łączy nazwy kamieni milowych fazy', () => {
    const rows = table.split('\n');
    expect(rows[2]).toBe('| **Faza 0 — Wielofirmowość · Fundament UI** | | | | |');
    expect(rows[3]).toContain('M0.1 Wielofirmowość');
    expect(rows[4]).toContain('M0.4');
    expect(rows[5]).toBe('| **Faza 1 — Serwis** | | | | |');
    expect(rows[6]).toContain('M1.1 Obiekty');
    expect(rows[8]).toContain('M? Nowy ekran');
  });

  it('oznacza stan, zależności po numerze modułu i escapuje „|”', () => {
    expect(table).toContain('| [x] | M0.4 Silnik \\| kolekcji | KRA-31 | Done | — |');
    expect(table).toContain('| [ ] | M1.1 Obiekty | KRA-48 | Backlog | M0.4 |');
    expect(table).toContain('| [ ] | ~~M1.2 Reklamacje~~ | KRA-50 | Canceled | — |');
    expect(table).toContain('| [ ] | M? Nowy ekran | KRA-70 | Backlog | KRA-58 |');
    expect(table).toContain('Bez numeru modułu (nadaj go w opisie zadania w Linear): KRA-70.');
  });
});

describe('linear-plan-sync: replaceBlock', () => {
  it('podmienia tylko blok między znacznikami', () => {
    const md = `# Plan\n\n${START}\nstara tabela\n${END}\n\nreszta`;
    expect(replaceBlock(md, 'nowa')).toBe(`# Plan\n\n${START}\nnowa\n${END}\n\nreszta`);
  });

  it('rzuca błąd bez znaczników', () => {
    expect(() => replaceBlock('# Plan', 'x')).toThrow(/Brak znaczników/);
  });
});

describe('linear-plan-sync: fetchIssues', () => {
  it('przechodzi przez strony i zgłasza błędy API', async () => {
    const pages = [
      { data: { issues: { nodes: [{ identifier: 'KRA-1' }], pageInfo: { hasNextPage: true, endCursor: 'c1' } } } },
      { data: { issues: { nodes: [{ identifier: 'KRA-2' }], pageInfo: { hasNextPage: false, endCursor: null } } } },
    ];
    const calls: string[] = [];
    const fake = async (_url: string, init: { body: string; headers: Record<string, string> }) => {
      calls.push(JSON.parse(init.body).variables.after);
      expect(init.headers.Authorization).toBe('klucz');
      return { ok: true, status: 200, json: async () => pages.shift() };
    };
    const issues = await fetchIssues('klucz', fake);
    expect(issues.map((i: { identifier: string }) => i.identifier)).toEqual(['KRA-1', 'KRA-2']);
    expect(calls).toEqual([null, 'c1']);

    const failing = async () => ({ ok: false, status: 401, json: async () => ({ errors: [{ message: 'Authentication required' }] }) });
    await expect(fetchIssues('zly', failing)).rejects.toThrow(/Linear API: 401/);
  });
});
