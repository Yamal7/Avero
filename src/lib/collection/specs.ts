/* Konfiguracje kolekcji na silniku widoku (M0.4, KRA-31). Wartości sortowań, grupowań i widoków pochodzą z listy
   parametrów RPC w @hvac/api-client (collections.ts) — spójność pilnuje tests/collection.test.ts.
   Kolejne moduły dopisują tu swoją kolekcję (opis w docs/STATUS.md › M0.4 › Jak użyć silnika). */
import { stockCategories } from '@hvac/api-client';
import { priorityLabel, taskLabels, type Priority, type TaskLabel } from '@/lib/tasks/labels';
import type { CollectionSpec } from './spec';

export const companiesSpec: CollectionSpec = {
  id: 'customers',
  label: 'Firmy',
  path: '/dashboard/customers',
  fixed: { kind: 'company' },
  searchLabel: 'Szukaj klienta, adresu lub kategorii',
  views: [
    { key: 'all', label: 'Wszystkie firmy' },
    { key: 'no_contact_30', label: 'Bez kontaktu 30 dni', title: 'Bez notatki, zgłoszenia ani zadania od 30 dni', sort: 'last_contact' },
    { key: 'archived', label: 'Zarchiwizowane' },
  ],
  sorts: [{ value: 'name', label: 'Nazwa' }, { value: 'last_contact', label: 'Ostatni kontakt' }, { value: 'devices', label: 'Urządzenia' }, { value: 'revenue', label: 'Przychód' }],
  groups: [{ value: 'none', label: 'Bez grupowania' }, { value: 'category', label: 'Kategoria' }, { value: 'city', label: 'Miasto' }],
  filters: [{ key: 'cat', label: 'Kategoria', kind: 'multi', modeKey: 'mode', max: 20 }],
  columns: [
    { key: 'name', fr: 2, main: true, label: 'Firma' },
    { key: 'categories', fr: 1.5, label: 'Kategorie', hideable: true },
    { key: 'city', fr: 1, label: 'Miasto', hideable: true },
    { key: 'devices', width: 80, label: 'Urządzenia', hideable: true },
    { key: 'contract', width: 104, label: 'Umowa', hideable: true },
    { key: 'contact', width: 104, label: 'Kontakt', hideable: true },
    { key: 'owner', width: 20, label: 'Opiekun', hideable: true },
    { key: 'revenue', width: 112, label: 'Przychód', hideable: true },
  ],
  pageSize: 25,
  selectable: true,
};

/** Osoby (kontakty firm i klienci indywidualni). Widok „Zarchiwizowane” pokazuje zarchiwizowanych klientów indywidualnych. */
export const peopleSpec: CollectionSpec = {
  id: 'people',
  label: 'Osoby',
  path: '/dashboard/customers',
  fixed: { kind: 'individual' },
  searchLabel: 'Szukaj osoby, firmy, roli lub telefonu',
  views: [
    { key: 'all', label: 'Wszystkie osoby' },
    { key: 'decision', label: 'Decyzyjne', title: 'Osoby z kategorią Decyzyjny' },
    { key: 'individual', label: 'Klienci indywidualni' },
    { key: 'no_contact_30', label: 'Bez kontaktu 30 dni', title: 'Bez notatki, zgłoszenia ani zadania od 30 dni', sort: 'last_contact' },
    { key: 'archived', label: 'Zarchiwizowane' },
  ],
  sorts: [{ value: 'name', label: 'Nazwa' }, { value: 'last_contact', label: 'Ostatni kontakt' }],
  groups: [],
  filters: [],
  columns: [
    { key: 'name', fr: 1.5, main: true, label: 'Osoba' },
    { key: 'company', fr: 1.5, label: 'Firma', hideable: true },
    { key: 'role', fr: 1, label: 'Rola', hideable: true },
    { key: 'categories', fr: 1.25, label: 'Kategorie', hideable: true },
    { key: 'phone', width: 128, label: 'Telefon', hideable: true },
    { key: 'contact', width: 104, label: 'Kontakt', hideable: true },
    { key: 'owner', width: 20, label: 'Opiekun', hideable: true },
  ],
  pageSize: 25,
  selectable: true,
};

/** Zarchiwizowani klienci indywidualni (widok „Zarchiwizowane” w Osobach) — stałe kolumny. */
export const archivedIndividualsColumns = [
  { key: 'name', fr: 2, main: true },
  { key: 'categories', fr: 1.5 },
  { key: 'city', fr: 1 },
  { key: 'devices', width: 80 },
  { key: 'contact', width: 104 },
  { key: 'owner', width: 20 },
] as const;

export const stockSpec: CollectionSpec = {
  id: 'stock',
  label: 'Pozycje magazynowe',
  path: '/dashboard/stock',
  searchLabel: 'Szukaj indeksu, nazwy, półki lub czynnika',
  views: [
    { key: 'all', label: 'Wszystkie' },
    { key: 'refrigerant', label: 'Czynniki chłodnicze' },
    { key: 'below', label: 'Poniżej minimum', sort: 'available' },
    { key: 'vehicles', label: 'W samochodach', custom: true },
  ],
  sorts: [{ value: 'code', label: 'Indeks' }, { value: 'name', label: 'Nazwa' }, { value: 'available', label: 'Dostępne' }, { value: 'last_move', label: 'Ostatni ruch' }],
  groups: [{ value: 'category', label: 'Kategoria' }, { value: 'none', label: 'Bez grupowania' }],
  filters: [{ key: 'cat', label: 'Kategoria', kind: 'multi', options: Object.entries(stockCategories).map(([value, label]) => ({ value, label })) }],
  columns: [
    { key: 'code', width: 84, label: 'Indeks', hideable: true },
    { key: 'name', fr: 1, main: true, label: 'Nazwa' },
    { key: 'state', width: 88, label: 'Stan', hideable: true },
    { key: 'reserved', width: 80, label: 'Rezerwacje', hideable: true },
    { key: 'available', width: 104, label: 'Dostępne' },
    { key: 'move', width: 72, label: 'Ostatni ruch', hideable: true },
  ],
  pageSize: 50,
  selectable: true,
};

/** Przeglądy — obecna lista (M1.8 dopisze statusy, grupy po miesiącach i filtry kapsułkami). */
export const maintenanceSpec: CollectionSpec = {
  id: 'maintenance',
  label: 'Plany przeglądów',
  path: '/dashboard/maintenance',
  context: ['installation'],
  searchKey: 'search',
  searchLabel: 'Szukaj planu, klienta lub instalacji',
  views: [
    { key: 'attention', label: 'Wymagające uwagi', title: 'Po terminie i w ciągu 30 dni' },
    { key: 'all', label: 'Wszystkie' },
    { key: 'overdue', label: 'Po terminie' },
    { key: 'upcoming', label: 'W ciągu 30 dni' },
    { key: 'paused', label: 'Wstrzymane' },
  ],
  sorts: [{ value: 'due', label: 'Termin' }, { value: 'customer', label: 'Klient' }, { value: 'title', label: 'Plan' }],
  groups: [],
  filters: [],
  columns: [
    { key: 'title', fr: 1.5, main: true, label: 'Plan' },
    { key: 'customer', fr: 1.5, label: 'Klient', hideable: true },
    { key: 'installation', fr: 1.5, label: 'Instalacja', hideable: true },
    { key: 'state', width: 128, label: 'Status' },
    { key: 'due', width: 96, label: 'Termin' },
    { key: 'interval', width: 88, label: 'Cykl', hideable: true },
    { key: 'actions', width: 28, label: 'Działania' },
  ],
  pageSize: 20,
  selectable: true,
};

/** Zadania: zapytanie po stronie klienta (filtrowanie 20 wczytanych wierszy w JS) — opcje w preferencjach `view.tasks`. */
export const tasksSpec: CollectionSpec = {
  id: 'tasks',
  label: 'Zadania',
  path: '/dashboard/tasks',
  searchLabel: 'Szukaj zadania lub klienta',
  views: [{ key: 'list', label: 'Lista' }],
  sorts: [{ value: 'priority', label: 'Priorytet' }, { value: 'due', label: 'Termin' }, { value: 'number', label: 'Numer' }, { value: 'created', label: 'Utworzone' }],
  groups: [{ value: 'status', label: 'Status' }, { value: 'priority', label: 'Priorytet' }, { value: 'label', label: 'Etykieta' }, { value: 'assignee', label: 'Osoba' }, { value: 'none', label: 'Bez grupowania' }],
  filters: [
    { key: 'priority', label: 'priorytet', kind: 'multi', options: (['urgent', 'high', 'normal', 'low', 'none'] as Priority[]).map(value => ({ value, label: priorityLabel[value] })) },
    { key: 'label', label: 'etykieta', kind: 'multi', options: (Object.keys(taskLabels) as TaskLabel[]).map(value => ({ value, label: taskLabels[value].name })) },
    { key: 'done', label: 'Pokaż zakończone', kind: 'toggle', default: true },
    { key: 'empty', label: 'Puste grupy', kind: 'toggle', default: false, presentation: true },
  ],
  columns: [
    { key: 'priority', width: 14, label: 'Priorytet', hideable: true },
    { key: 'number', width: 56, label: 'Numer', hideable: true },
    { key: 'status', width: 14, label: 'Status' },
    { key: 'title', fr: 1, main: true, label: 'Tytuł' },
    { key: 'customer', width: 20, label: 'Klient', hideable: true },
    { key: 'label', width: 112, label: 'Etykieta', hideable: true },
    { key: 'due', width: 76, label: 'Termin', hideable: true },
    { key: 'assignee', width: 20, label: 'Osoba', hideable: true },
  ],
  pageSize: 20,
};
