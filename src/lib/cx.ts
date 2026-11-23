/** Łączy klasy CSS, pomijając puste wartości (bez zależności typu clsx). */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}
