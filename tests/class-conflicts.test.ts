/* Konflikty klas Tailwinda (M0.3, przegląd KRA-63): `cx` tylko skleja klasy, więc przy dwóch klasach ustawiających
   tę samą właściwość CSS (z tym samym wariantem) wygrywa ta, która jest później w wygenerowanym arkuszu — nie ta,
   która jest później w className. Test zbiera zestawy klas z wywołań `cx(...)`, stałych napisowych, `className`
   komponentów z bazowymi klasami (Cell, Row, Button…) i kompiluje je Tailwindem z src/app/tailwind.css.
   Gałęzie warunków (`a ? 'x' : 'y'`, `a && 'x'`, `mapa[klucz]`) to alternatywy — nie konfliktują ze sobą,
   ale każda z nich jest sprawdzana z klasami z pozostałych argumentów. */
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { compile } from 'tailwindcss';
import { buttonClasses, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { cellBase, headerRowBase, rowBase } from '@/components/table/table';
import { pageBase, segmentedBase, toolbarBase } from '@/components/table/page-chrome';
import { scrollBase } from '@/components/table/table-scroll';
import { logoBase } from '@/components/table/logo';
import { customerLogoBase } from '@/components/table/customer-logo';

const root = resolve(__dirname, '..');
const entry = resolve(root, 'src/app/tailwind.css');
const require = createRequire(import.meta.url);

const FILES = [
  'src/components/table/table.tsx', 'src/components/table/table-scroll.tsx', 'src/components/table/page-chrome.tsx',
  'src/components/table/logo.tsx', 'src/components/table/customer-logo.tsx',
  'src/components/ui/button.tsx', 'src/components/ui/input.tsx', 'src/components/ui/pill.tsx', 'src/components/ui/table-row.tsx',
  'src/components/task-list.tsx', 'src/components/stock-view.tsx',
  'src/app/(dashboard)/dashboard/customers/page.tsx', 'src/app/(dashboard)/dashboard/tasks/page.tsx',
  'src/app/(dashboard)/dashboard/customers/loading.tsx', 'src/app/(dashboard)/dashboard/tasks/loading.tsx', 'src/app/(dashboard)/dashboard/stock/loading.tsx',
];
/** Komponenty, których className dokleja się do klas bazowych. */
const COMPONENT_BASE: Record<string, string> = { Cell: cellBase, Row: rowBase, HeaderRow: headerRowBase, TableScroll: scrollBase, TablePage: pageBase, Toolbar: toolbarBase, Segmented: segmentedBase, Logo: logoBase, CustomerLogo: customerLogoBase };

/** Argument zestawu: lista wzajemnie wykluczających się alternatyw (każda = napis klas). */
type Arg = string[];
type ClassSet = { file: string; line: number; args: Arg[] };

function collect(file: string): ClassSet[] {
  const text = readFileSync(resolve(root, file), 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const consts = new Map<string, ts.Expression>();
  const fns = new Map<string, ts.Expression>();
  const visitDecl = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const init = n.initializer;
      if (ts.isArrowFunction(init) && !ts.isBlock(init.body)) fns.set(n.name.text, init.body);
      else consts.set(n.name.text, init);
    }
    ts.forEachChild(n, visitDecl);
  };
  visitDecl(sf);

  const alts = (e: ts.Expression | undefined, depth = 0): string[] => {
    if (!e || depth > 8) return [''];
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e)) return alts(e.expression, depth);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (ts.isTemplateExpression(e)) {
      let out = [e.head.text];
      for (const span of e.templateSpans) { const sub = alts(span.expression, depth + 1); out = out.flatMap(o => sub.map(s => o + s + span.literal.text)); }
      return out;
    }
    if (ts.isConditionalExpression(e)) return [...alts(e.whenTrue, depth + 1), ...alts(e.whenFalse, depth + 1)];
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return ['', ...alts(e.right, depth + 1)];
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.BarBarToken || e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return [...alts(e.left, depth + 1), ...alts(e.right, depth + 1)];
    if (ts.isIdentifier(e)) { const c = consts.get(e.text); return c ? alts(c, depth + 1) : ['']; }
    if (ts.isElementAccessExpression(e) || ts.isPropertyAccessExpression(e)) {
      const obj = ts.isIdentifier(e.expression) ? consts.get(e.expression.text) : undefined;
      if (obj && ts.isObjectLiteralExpression(obj)) {
        const vals = obj.properties.filter(ts.isPropertyAssignment).filter(p => !ts.isPropertyAccessExpression(e) || (ts.isIdentifier(p.name) && p.name.text === e.name.text));
        return vals.flatMap(p => alts(p.initializer, depth + 1));
      }
      return [''];
    }
    if (ts.isCallExpression(e)) {
      // klasy ze zwijanych wywołań (cx w pomocniczej funkcji) — jako jedna alternatywa sklejona z alternatyw argumentów
      const inner = callArgs(e, depth + 1);
      if (inner) return combos(inner);
      return [''];
    }
    return [''];
  };
  /** Wszystkie kombinacje alternatyw (ograniczone, żeby nie wybuchło). */
  const combos = (args: Arg[]) => args.reduce<string[]>((acc, a) => acc.flatMap(x => a.map(y => `${x} ${y}`)).slice(0, 256), ['']);
  /** Argumenty zestawu dla wywołań: cx(...), lokalna funkcja zwracająca cx(...), buttonClasses({...}). */
  const callArgs = (e: ts.CallExpression, depth: number): Arg[] | null => {
    const callee = ts.isIdentifier(e.expression) ? e.expression.text : '';
    if (callee === 'cx') return e.arguments.map(a => alts(a, depth));
    if (callee === 'buttonClasses') {
      const opts = e.arguments[0];
      if (opts && ts.isObjectLiteralExpression(opts)) {
        const prop = (k: string) => opts.properties.filter(ts.isPropertyAssignment).find(p => ts.isIdentifier(p.name) && p.name.text === k)?.initializer;
        const lit = (k: string) => { const v = prop(k); return v && ts.isStringLiteral(v) ? v.text : undefined; };
        return [[buttonClasses({ variant: lit('variant') as ButtonVariant | undefined, size: lit('size') as ButtonSize | undefined })], alts(prop('className'), depth)];
      }
      return [[buttonClasses()]];
    }
    const body = fns.get(callee);
    if (body && ts.isCallExpression(body)) return callArgs(body, depth);
    return null;
  };

  const sets: ClassSet[] = [];
  const line = (n: ts.Node) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n)) {
      const args = callArgs(n, 0);
      if (args && ts.isIdentifier(n.expression) && (n.expression.text === 'cx' || n.expression.text === 'buttonClasses')) sets.push({ file, line: line(n), args });
    }
    // stałe napisowe z klasami (np. field, capsule)
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !ts.isImportDeclaration(n.parent) && !ts.isExportDeclaration(n.parent)) {
      sets.push({ file, line: line(n), args: [[n.text]] });
    }
    // <Komponent className=…> doklejane do klas bazowych komponentu; <Button variant size className>
    if (ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n)) {
      const tag = n.tagName.getText();
      const attr = (k: string) => n.attributes.properties.find((p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && p.name.getText() === k);
      const value = (k: string): ts.Expression | undefined => { const a = attr(k)?.initializer; if (!a) return undefined; if (ts.isStringLiteral(a)) return a; if (ts.isJsxExpression(a)) return a.expression; return undefined; };
      const cls = value('className');
      if (cls && tag === 'Button') {
        const lit = (k: string) => { const v = value(k); return v && ts.isStringLiteral(v) ? v.text : undefined; };
        sets.push({ file, line: line(n), args: [[buttonClasses({ variant: lit('variant') as ButtonVariant | undefined, size: lit('size') as ButtonSize | undefined })], alts(cls)] });
      } else if (cls && COMPONENT_BASE[tag] !== undefined) {
        // Cell dokleja odstęp z parametru gap (domyślnie 2 = gap-2)
        let base = COMPONENT_BASE[tag]!;
        if (tag === 'Cell') { const g = attr('gap')?.initializer; const n = g && ts.isJsxExpression(g) && g.expression && ts.isNumericLiteral(g.expression) ? g.expression.text : '2'; if (n !== '0') base += ` gap-${n}`; }
        sets.push({ file, line: line(n), args: [[base], alts(cls)] });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return sets;
}

/* ---------- właściwości CSS klas (z kompilacji Tailwinda) ---------- */
const EXPAND: Record<string, string[]> = {
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  'padding-inline': ['padding-right', 'padding-left'], 'padding-block': ['padding-top', 'padding-bottom'],
  'padding-inline-start': ['padding-left'], 'padding-inline-end': ['padding-right'],
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  'margin-inline': ['margin-right', 'margin-left'], 'margin-block': ['margin-top', 'margin-bottom'],
  inset: ['top', 'right', 'bottom', 'left'], 'inset-inline': ['right', 'left'], 'inset-block': ['top', 'bottom'],
  gap: ['row-gap', 'column-gap'],
  'border-width': ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
  'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
  'border-top-left-radius': ['border-top-left-radius'], 'border-bottom-left-radius': ['border-bottom-left-radius'],
  overflow: ['overflow-x', 'overflow-y'],
};
/* transition-* czyta czas z --tw-duration, który ustawia duration-* — kolejność w arkuszu nie ma znaczenia. */
const IGNORED = new Set(['transition-duration', 'transition-timing-function']);
/** Wariant (wszystko przed ostatnim „:” poza nawiasami) i sama klasa. */
function split(token: string) {
  let depth = 0, cut = -1;
  for (let i = 0; i < token.length; i++) { const c = token[i]; if (c === '[' || c === '(') depth++; else if (c === ']' || c === ')') depth--; else if (c === ':' && depth === 0) cut = i; }
  return { variant: cut < 0 ? '' : token.slice(0, cut), utility: token.slice(cut + 1) };
}
const escape = (cls: string) => cls.replace(/[^a-zA-Z0-9_-]/g, m => '\\' + m);

async function declarations(utilities: string[]) {
  const compiler = await compile(await readFile(entry, 'utf8'), {
    base: dirname(entry),
    async loadStylesheet(id, base) { const path = id.startsWith('.') ? resolve(base, id) : require.resolve(id); return { path, base: dirname(path), content: await readFile(path, 'utf8') }; },
  });
  const css = compiler.build(utilities);
  const out = new Map<string, Map<string, { value: string; rank: number }>>();
  for (const u of utilities) {
    const sel = '.' + escape(u) + ' {';
    const at = css.indexOf(sel);
    if (at < 0) continue;
    const body = css.slice(at + sel.length, css.indexOf('}', at)).replace(/@[^{]*\{[^]*$/, '');
    const props = new Map<string, { value: string; rank: number }>();
    for (const m of body.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
      const [, p, v] = m as unknown as [string, string, string];
      if (p.startsWith('--') || IGNORED.has(p)) continue;
      const longhands = EXPAND[p] ?? [p];
      for (const q of longhands) props.set(q, { value: v.trim(), rank: longhands.length });
    }
    out.set(u, props);
  }
  return out;
}

describe('konflikty klas Tailwinda w ekranach tabel (M0.3)', () => {
  it('żaden zestaw klas nie ustawia tej samej właściwości dwiema klasami (z tym samym wariantem)', async () => {
    const sets = FILES.flatMap(collect);
    const tokens = new Set<string>();
    for (const s of sets) for (const a of s.args) for (const alt of a) for (const t of alt.split(/\s+/)) if (t) tokens.add(split(t).utility);
    const decl = await declarations([...tokens]);
    const props = (t: string) => decl.get(split(t).utility);
    const problems = new Set<string>();
    /* Skrót i właściwość szczegółowa (p-0 i px-2, px-3 i pl-1): Tailwind stawia szczegółową później, więc wygrywa ona.
       To zamierzone, gdy szczegółowa stoi w tym samym napisie albo w późniejszym argumencie (nadpisanie); błąd — gdy
       wcześniejszy argument ma szczegółową, a późniejszy skrót (np. bazowe „pr-3 pl-2” i doklejone „px-0”).
       Ta sama właściwość tego samego rodzaju (pl-2 i pl-1, text-primary i text-danger) — zawsze błąd. */
    const check = (s: ClassSet, a: string, b: string, sameLiteral: boolean) => {
      if (a === b) return;
      const sa = split(a), sb = split(b);
      if (sa.variant !== sb.variant) return;
      const pa = props(a), pb = props(b);
      if (!pa || !pb) return;
      for (const [p, va] of pa) {
        const vb = pb.get(p);
        if (!vb || vb.value === va.value) continue;
        if (va.rank !== vb.rank && (sameLiteral || vb.rank < va.rank)) continue;
        problems.add(`${s.file}:${s.line}  „${a}” i „${b}” (${p})`); return;
      }
    };
    for (const s of sets) {
      // w obrębie jednej alternatywy
      for (const arg of s.args) for (const alt of arg) { const ts_ = alt.split(/\s+/).filter(Boolean); for (let i = 0; i < ts_.length; i++) for (let j = i + 1; j < ts_.length; j++) check(s, ts_[i]!, ts_[j]!, true); }
      // między argumentami (każda alternatywa z każdą)
      for (let i = 0; i < s.args.length; i++) for (let j = i + 1; j < s.args.length; j++)
        for (const x of s.args[i]!) for (const y of s.args[j]!)
          for (const a of x.split(/\s+/).filter(Boolean)) for (const b of y.split(/\s+/).filter(Boolean)) check(s, a, b, false);
    }
    expect([...problems].sort()).toEqual([]);
  }, 60_000);

  it('wykrywa znane konflikty (kontrola samego testu)', async () => {
    const decl = await declarations(['w-full', 'w-16', 'h-control', 'h-auto', 'font-sans', 'font-mono', 'px-3', 'pl-1', 'gap-2', 'gap-1', 'text-primary', 'text-danger', 'font-normal', 'font-medium', 'truncate', 'overflow-hidden']);
    const clash = (a: string, b: string) => [...decl.get(a)!].some(([p, v]) => decl.get(b)!.has(p) && decl.get(b)!.get(p)!.value !== v.value);
    expect(clash('w-full', 'w-16')).toBe(true);
    expect(clash('h-control', 'h-auto')).toBe(true);
    expect(clash('font-sans', 'font-mono')).toBe(true);
    expect(clash('px-3', 'pl-1')).toBe(true);
    expect(clash('gap-2', 'gap-1')).toBe(true);
    expect(clash('text-primary', 'text-danger')).toBe(true);
    expect(clash('font-normal', 'font-medium')).toBe(true);
    expect(clash('truncate', 'overflow-hidden')).toBe(false);
  });
});
