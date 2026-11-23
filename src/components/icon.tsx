/* Ikony aplikacji: Phosphor Regular (@phosphor-icons/react, decyzja projektu). Nazwy zostają, bo nawigacja,
   paleta poleceń i portal podają ikonę jako dane (np. { icon: 'cube' }). W nowym kodzie można importować
   ikony Phosphor wprost z '@phosphor-icons/react/ssr'. Wersja SSR działa w komponentach serwerowych i klienckich. */
import type { CSSProperties } from 'react';
import {
  Archive, ArrowRight, ArrowsClockwise, Bell, Book, BookOpen, Buildings, CalendarBlank, CalendarDots, CaretDown, CaretRight,
  ChartBar, CheckSquare, Cube, Eye, Fan, FileText, Gear, House, Link, List, MagnifyingGlass, MapPin, Moon, NotePencil, Package,
  Plus, Receipt, Scroll, ShoppingCart, SignOut, SlidersHorizontal, Stack, StackSimple, Sun, Target, Toolbox, Tray, UserPlus, Users,
  UsersThree, WarningCircle, Wrench, X,
} from '@phosphor-icons/react/ssr';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

const icons = {
  check: CheckSquare, home: House, users: UsersThree, device: Fan, search: MagnifyingGlass, menu: List, arrow: ArrowRight, plus: Plus,
  logout: SignOut, sun: Sun, moon: Moon, bell: Bell, settings: Gear, wrench: Wrench, calendar: CalendarBlank, pin: MapPin, file: FileText,
  chevron: CaretRight, box: Package, catalog: BookOpen, layers: Stack, inbox: Tray, day: Sun, userPlus: UserPlus, target: Target,
  offer: FileText, building: Buildings, place: MapPin, cube: Cube, contract: Scroll, alert: WarningCircle, tool: Toolbox, plan: CalendarDots,
  cycle: ArrowsClockwise, stack: StackSimple, task: CheckSquare, invoice: Receipt, book: Book, archive: Archive, cart: ShoppingCart,
  chart: ChartBar, sliders: SlidersHorizontal, compose: NotePencil, find: MagnifyingGlass, ring: Bell, down: CaretDown, right: CaretRight,
  people: Users, eye: Eye, close: X, link: Link,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 22, style, className }: { name: IconName; size?: number; style?: CSSProperties; className?: string }) {
  const Glyph = icons[name];
  return <Glyph size={size} weight="regular" aria-hidden="true" style={style} className={className} />;
}
