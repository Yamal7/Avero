/* Pole tekstowe (Precision UI, M0.2): wypełnienie bg-subtle zamiast ramki, fokus — wewnętrzny pierścień akcentu 1,5 px,
   błąd — pierścień --danger i aria-invalid. Opcjonalna ikona w polu zastępuje etykietę (etykieta zostaje dla czytników). */
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';

// `field-ring` (src/app/tailwind.css) rysuje wewnętrzny pierścień 1,5 px w kolorze z ring-accent / ring-danger.
export const inputFrameClasses = 'flex h-control items-center gap-2 rounded-md bg-subtle px-3 text-tertiary transition-shadow focus-within:field-ring focus-within:ring-accent has-aria-invalid:field-ring has-aria-invalid:ring-danger has-disabled:cursor-not-allowed has-disabled:opacity-50 max-desktop:h-11';
export const inputFieldClasses = 'h-full min-h-0 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 font-sans text-body leading-5 text-primary shadow-none outline-0 placeholder:text-tertiary focus:shadow-none disabled:cursor-not-allowed';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** Etykieta dla czytników ekranu (widoczna etykieta nad polem nie jest wymagana, gdy ikona jest jednoznaczna). */
  label: string;
  icon?: ReactNode;
  error?: string;
  wrapperClassName?: string;
};

export function Input({ label, icon, error, wrapperClassName, className, id, ...rest }: Props) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <span className={cx('inline-flex min-w-0 flex-col gap-1', wrapperClassName)}>
      <label className={inputFrameClasses}>
        <span className="sr-only">{label}</span>
        {icon}
        <input id={id} className={cx(inputFieldClasses, className)} aria-invalid={error ? true : undefined} aria-describedby={errorId} {...rest} />
      </label>
      {error && <span id={errorId} role="alert" className="text-small leading-4 text-danger">{error}</span>}
    </span>
  );
}

/** Miejsce na pole w trakcie ładowania formularza. */
export function InputSkeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx('block h-control w-full rounded-md bg-subtle motion-safe:animate-pulse', className)} />;
}
