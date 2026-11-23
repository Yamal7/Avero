// Lokalna reguła ESLint (M0.2, KRA-26): w ekranach i komponentach klasy Tailwinda tylko z tokenów.
// Zgłasza wartości dowolne (`w-[13px]`, `text-[#fff]`, `w-(--x)`, `[mask-type:luminance]`) oraz ułamkowe
// odstępy spoza siatki 4 px (`p-0.5`, `gap-1.5`). Warianty dowolne (`data-[state=open]:`) są dozwolone —
// to selektory, nie wartości. Sprawdzane są wszystkie napisy w pliku, bo klasy bywają w stałych i wariantach.

const SPACING = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end',
  'w', 'h', 'size', 'min-w', 'min-h', 'max-w', 'max-h', 'basis',
  'translate-x', 'translate-y', 'scroll-m', 'scroll-p', 'leading', 'indent',
];
const fractional = new RegExp(`^-?(?:${SPACING.join('|')})-\\d+\\.\\d+$`);
// odstęp 1 px (`p-px`, `gap-px`) — też poza siatką 4 px; `w-px` / `h-px` (linie 1 px) zostają dozwolone
const onePixel = /^-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-px$/;
// utility z wartością dowolną: `w-[…]`, `w-(…)`; także niedomknięta (fragment szablonu `grid-cols-[${x}]`)
const arbitraryValue = /^-?[a-z][a-z0-9-]*-[[(]/;
// dowolna właściwość: `[mask-type:luminance]`
const arbitraryProperty = /^\[[a-z-]+:/;
// token wygląda jak klasa: litery, cyfry, myślniki, warianty z dwukropkiem, nawiasy
const classLike = /^!?-?[a-z[(]/;

/** Ostatni człon klasy po wariantach (`hover:`, `data-[x=y]:`), z pominięciem dwukropków w nawiasach. */
function utilityOf(token) {
  let depth = 0, start = 0;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!/, '');
}

export function forbiddenClass(token) {
  if (!classLike.test(token)) return false;
  const utility = utilityOf(token);
  return arbitraryValue.test(utility) || arbitraryProperty.test(utility) || fractional.test(utility) || onePixel.test(utility);
}

const rule = {
  meta: {
    type: 'problem',
    docs: { description: 'Klasy Tailwinda tylko z tokenów: bez wartości dowolnych i odstępów spoza siatki 4 px.' },
    schema: [],
    messages: {
      forbidden: 'Klasa „{{token}}” spoza tokenów — użyj wartości z @theme (src/app/tailwind.css, docs/design/tokens.css), bez wartości dowolnych i z siatką 4 px.',
    },
  },
  create(context) {
    function check(node, text) {
      for (const token of text.split(/\s+/)) {
        if (token && forbiddenClass(token)) context.report({ node, messageId: 'forbidden', data: { token } });
      }
    }
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        if (node.parent?.type === 'ImportDeclaration' || node.parent?.type === 'ExportAllDeclaration' || node.parent?.type === 'ExportNamedDeclaration') return;
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

const plugin = { meta: { name: 'avero' }, rules: { 'tailwind-tokens': rule } };
export default plugin;
