'use client';
/* „Dodaj plan” na liście Przeglądów (M0.4): okno z formularzem planu (MaintenancePlanForm — bez zmian, style formularza jak dotąd).
   Wcześniej rozwijany blok nad tabelą. Esc i „Zamknij” zamykają okno. */
import { useId, useRef } from 'react';
import { Plus, X } from '@phosphor-icons/react/ssr';
import { Button } from '@/components/ui/button';
import { MaintenancePlanForm } from '@/components/maintenance-forms';
import type { InstallationOption } from '@/lib/service/types';

export function NewMaintenancePlan({ options, selected }: { options: InstallationOption[]; selected?: string }) {
  const dialog = useRef<HTMLDialogElement>(null), id = useId();
  return (
    <>
      <Button variant="pri" size="sm" title="Dodaj plan przeglądu" onClick={() => dialog.current?.showModal()} icon={<Plus size={14} className="shrink-0" aria-hidden />}>Dodaj plan</Button>
      <dialog ref={dialog} aria-labelledby={id} className="shell-dialog record-actions-dialog">
        <div className="shell-dialog-heading">
          <h2 id={id}>Nowy plan przeglądu</h2>
          <Button variant="icon" size="sm" aria-label="Zamknij" shortcut="Esc" onClick={() => dialog.current?.close()} icon={<X size={16} className="shrink-0" aria-hidden />} />
        </div>
        <div className="record-actions-content"><MaintenancePlanForm selected={selected} options={options} /></div>
      </dialog>
    </>
  );
}
