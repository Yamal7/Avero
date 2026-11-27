/* Silnik widoku kolekcji (M0.4, KRA-31) — publiczne API dla ekranów. Instrukcja: docs/STATUS.md › M0.4. */
export { CollectionProvider, useCollection, useOptionalCollection, type CollectionState } from './provider';
export { CollectionNotice, CollectionSearch, CollectionViews, FilterBar, SortMenu, ViewOptionsButton, type FilterOption } from './toolbar';
export { CollectionTable, type CollectionGroup, type CollectionRow } from './table';
export { ViewOptions, type InlineFilterDots } from './view-options';
