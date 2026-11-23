/* Rama aplikacji (M0.2): wyłącznie klasy Tailwinda na tokenach. Klasy pui-shell, av i pui-main zostają jako
   zaczepienia dla arkuszy ekranów sprzed przebudowy (np. .pui-main h1, .av .ib) — nie niosą już stylów ramy. */
const focusRing='focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';
export const shell={
 root:'pui-shell av flex h-dvh flex-col bg-shell text-primary print:h-auto print:bg-transparent',
 top:'flex h-12 flex-none items-center gap-2 pl-2 pr-3 max-desktop:px-2 print:hidden',
 topLeft:'flex min-w-0 shrink-0 grow-0 basis-54 items-center gap-1 max-desktop:shrink max-desktop:basis-auto',
 round:`relative size-7 min-h-0 flex-none items-center justify-center rounded-pill border-0 p-0 text-secondary no-underline transition-colors hover:bg-shell-hover ${focusRing}`,
 workspace:`flex h-8 min-h-0 min-w-0 flex-auto items-center justify-start gap-2 rounded-md border-0 bg-transparent px-2 py-0 text-left text-body leading-5 font-medium text-primary transition-colors hover:bg-shell-hover ${focusRing}`,
 mark:'inline-flex size-5 flex-none items-center justify-center rounded-xs bg-primary text-micro font-semibold text-shell',
 tabs:'flex min-w-0 flex-initial items-center overflow-hidden max-desktop:flex-auto',
 pinnedTab:`inline-flex size-7 flex-none items-center justify-center rounded-sm border-0 p-0 no-underline transition-colors ${focusRing}`,
 tab:`inline-flex h-7 min-w-0 max-w-50 flex-initial items-center rounded-sm border-0 text-small no-underline transition-colors ${focusRing}`,
 tabOn:'bg-surface text-primary',
 tabOff:'bg-transparent hover:bg-shell-hover hover:text-primary',
 newTab:`inline-flex size-6 min-h-0 flex-none items-center justify-center rounded-sm border-0 bg-transparent p-0 text-tertiary transition-colors hover:bg-subtle hover:text-primary ${focusRing}`,
 badge:'pointer-events-none absolute h-3.5 min-w-3.5 rounded-pill bg-primary text-center font-semibold text-shell tabular-nums',
 avatar:'inline-flex size-6 items-center justify-center rounded-pill border-0 bg-surface font-medium text-secondary',
 backdrop:'fixed inset-0 z-55 hidden size-full min-h-0 rounded-none border-0 bg-scrim p-0 max-desktop:block print:hidden',
 side:'flex flex-none basis-sidebar flex-col gap-4 overflow-x-hidden overflow-y-auto px-2 pt-1 pb-4 max-desktop:fixed max-desktop:inset-y-0 max-desktop:left-0 max-desktop:z-60 max-desktop:w-68 max-desktop:border-r max-desktop:border-border max-desktop:bg-shell max-desktop:pt-3 max-desktop:transition-all max-desktop:duration-base print:hidden',
 groupHead:`flex h-7 min-h-0 w-full items-center justify-start gap-1 rounded-sm border-0 bg-transparent px-2 py-0 text-left text-small leading-4 font-medium text-tertiary transition-colors hover:bg-transparent hover:text-secondary max-desktop:h-11 ${focusRing}`,
 nav:`group flex h-7 w-full items-center justify-start gap-2 rounded-sm border-0 px-2 text-left no-underline transition-colors max-desktop:h-11 ${focusRing}`,
 navIdle:'bg-transparent font-normal text-secondary hover:bg-shell-hover hover:text-primary',
 navActive:'bg-shell-hover font-medium text-primary',
 navIcon:'shrink-0 text-tertiary transition-colors group-hover:text-primary',
 main:'pui-main relative mr-2 mb-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-edge bg-surface max-desktop:mx-1 max-desktop:mb-1 max-desktop:rounded-lg print:m-0 print:overflow-visible print:rounded-none print:border-0',
};
/* eslint-disable avero/tailwind-tokens -- Wartości 1:1 z makiety ramy spoza siatki 4 px i spoza tokenów (2, 6, 10 px, 1 px,
   tekst 10 px). Zostawione, żeby rama wyglądała jak przed M0.2; do decyzji projektu (docs/STATUS.md › Pytania do projektu). */
export const offGrid={
 tabsGap:'gap-0.5',
 pinnedEnd:'mr-1.5',
 tab:'gap-1.5 px-2.5',
 navGap:'gap-px',
 badge:'top-0.5 right-0.5 px-0.75 text-[10px] leading-3.5',
 avatarText:'text-[10px]',
};
/* eslint-enable avero/tailwind-tokens */
