#!/usr/bin/env node
// Generuje tabelę modułów w docs/PLAN.md z Linear (zespół KRA).
//
// Źródło prawdy:
//   faza         = kamień milowy zadania, nazwa zaczyna się od „Faza N”
//   numer modułu = „M1.3” w opisie zadania (notatka „Moduł w docs/PLAN.md: M1.3”)
//   zależności   = relacje „blokowane przez” w Linear
//   stan         = status zadania (Done → [x], Canceled → przekreślone)
//
// Użycie:
//   LINEAR_API_KEY=… node scripts/linear-plan-sync.mjs        # aktualizuje docs/PLAN.md
//   node scripts/linear-plan-sync.mjs --fixture plik.json      # dane z pliku (testy)
//   … --check                                                  # kod wyjścia 1, gdy tabela nieaktualna
import { readFileSync, writeFileSync } from 'node:fs';

export const START = '<!-- linear:moduly:start -->';
export const END = '<!-- linear:moduly:end -->';
const PLAN_PATH = 'docs/PLAN.md';
const TEAM_KEY = 'KRA';

const QUERY = `
query PlanIssues($after: String) {
  issues(first: 100, after: $after, filter: { team: { key: { eq: "${TEAM_KEY}" } } }) {
    nodes {
      identifier
      title
      description
      state { name type }
      projectMilestone { name }
      inverseRelations { nodes { type issue { identifier } } }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

/** Pobiera wszystkie zadania zespołu KRA (z paginacją). */
export async function fetchIssues(apiKey, fetchImpl = fetch) {
  const issues = [];
  let after = null;
  for (let page = 0; page < 50; page += 1) {
    const res = await fetchImpl('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey },
      body: JSON.stringify({ query: QUERY, variables: { after } }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(`Linear API: ${res.status} ${JSON.stringify(json.errors ?? json).slice(0, 500)}`);
    }
    const { nodes, pageInfo } = json.data.issues;
    issues.push(...nodes);
    if (!pageInfo.hasNextPage) return issues;
    after = pageInfo.endCursor;
  }
  throw new Error('Linear API: przekroczono limit stron');
}

/** Zadanie z Linear → płaski rekord. Zwraca null dla zadań spoza faz planu. */
export function normalize(issue) {
  const milestone = issue.projectMilestone?.name ?? '';
  const phaseMatch = milestone.match(/^Faza\s+(\d+)\s*[·:—-]?\s*(.*)$/);
  if (!phaseMatch) return null;
  const moduleMatch = (issue.description ?? '').match(/PLAN\.md`?\s*:?\s*\*{0,2}(M\d+\.\d+[a-z]?)\b/);
  const blockedBy = (issue.inverseRelations?.nodes ?? [])
    .filter((r) => r.type === 'blocks' && r.issue?.identifier)
    .map((r) => r.issue.identifier);
  return {
    id: issue.identifier,
    title: issue.title.trim(),
    phase: Number(phaseMatch[1]),
    phaseName: phaseMatch[2].trim(),
    module: moduleMatch ? moduleMatch[1] : null,
    stateType: issue.state?.type ?? 'unstarted',
    stateName: issue.state?.name ?? '',
    blockedBy: [...new Set(blockedBy)].sort(byIssueNumber),
  };
}

function byIssueNumber(a, b) {
  return Number(a.split('-')[1]) - Number(b.split('-')[1]);
}

function moduleKey(m) {
  if (!m) return [Number.MAX_SAFE_INTEGER, 0, ''];
  const [, major, minor, suffix] = m.match(/^M(\d+)\.(\d+)([a-z]?)$/);
  return [Number(major), Number(minor), suffix];
}

function compareModules(a, b) {
  const ka = moduleKey(a.module);
  const kb = moduleKey(b.module);
  for (let i = 0; i < 3; i += 1) {
    if (ka[i] < kb[i]) return -1;
    if (ka[i] > kb[i]) return 1;
  }
  return byIssueNumber(a.id, b.id);
}

const esc = (s) => s.replace(/\|/g, '\\|');

/** Buduje tabelę Markdown z rekordów. */
export function buildTable(records) {
  const byId = new Map(records.map((r) => [r.id, r]));
  const phases = [...new Set(records.map((r) => r.phase))].sort((a, b) => a - b);
  const lines = ['| | Moduł | Linear | Stan | Zależy od |', '|---|---|---|---|---|'];
  for (const phase of phases) {
    const inPhase = records.filter((r) => r.phase === phase).sort(compareModules);
    const names = [...new Set(inPhase.map((r) => r.phaseName).filter(Boolean))].join(' · ');
    lines.push(`| **Faza ${phase}${names ? ` — ${esc(names)}` : ''}** | | | | |`);
    for (const r of inPhase) {
      const done = r.stateType === 'completed';
      const canceled = r.stateType === 'canceled' || r.stateType === 'duplicate';
      const box = done ? '[x]' : '[ ]';
      let label = `${r.module ?? 'M?'} ${esc(r.title)}`;
      if (canceled) label = `~~${label}~~`;
      const deps = r.blockedBy.length
        ? r.blockedBy.map((id) => byId.get(id)?.module ?? id).join(', ')
        : '—';
      lines.push(`| ${box} | ${label} | ${r.id} | ${esc(r.stateName)} | ${deps} |`);
    }
  }
  const missing = records.filter((r) => !r.module).map((r) => r.id).sort(byIssueNumber);
  if (missing.length) {
    lines.push('', `Bez numeru modułu (nadaj go w opisie zadania w Linear): ${missing.join(', ')}.`);
  }
  return lines.join('\n');
}

/** Podmienia blok między znacznikami. Rzuca błąd, gdy znaczników brak. */
export function replaceBlock(markdown, table) {
  const start = markdown.indexOf(START);
  const end = markdown.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Brak znaczników ${START} / ${END} w ${PLAN_PATH}`);
  }
  return `${markdown.slice(0, start + START.length)}\n${table}\n${markdown.slice(end)}`;
}

async function main() {
  const args = process.argv.slice(2);
  const fixtureIdx = args.indexOf('--fixture');
  const check = args.includes('--check');
  let raw;
  if (fixtureIdx !== -1) {
    raw = JSON.parse(readFileSync(args[fixtureIdx + 1], 'utf8'));
  } else {
    const key = process.env.LINEAR_API_KEY;
    if (!key) throw new Error('Brak zmiennej LINEAR_API_KEY');
    raw = await fetchIssues(key);
  }
  const records = raw.map(normalize).filter(Boolean);
  if (!records.length) throw new Error('Brak zadań z kamieniem milowym „Faza N” — nie nadpisuję planu');
  const before = readFileSync(PLAN_PATH, 'utf8');
  const after = replaceBlock(before, buildTable(records));
  if (after === before) {
    console.log('Tabela modułów aktualna.');
    return;
  }
  if (check) {
    console.error('Tabela modułów w docs/PLAN.md różni się od Linear.');
    process.exit(1);
  }
  writeFileSync(PLAN_PATH, after);
  console.log(`Zaktualizowano ${PLAN_PATH}: ${records.length} modułów.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
