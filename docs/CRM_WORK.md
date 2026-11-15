# Notatki, zadania i opiekun klienta

Wdrożenie lokalne KRA-10, 28.10.2026. Karta `/dashboard/customers/{id}` ma zakładki **Notatki** i **Zadania** oraz sekcję **Relacja z klientem** w profilu. Na telefonie profil jest dostępny pod przyciskiem „Profil i powiązania”. Zachowano oba motywy i wspólne wzorce CRM inspirowane Attio i Linear.

## Codzienna praca

- Notatki: zwykła notatka, rozmowa lub spotkanie, tytuł, data, treść i opcjonalna osoba kontaktowa. Daty rozmów nie mogą być przyszłe — przyszły kontakt planuje się jako zadanie. Archiwizacja jest odwracalna i zachowuje historię.
- Zadania: tytuł, opis dla wykonawcy, termin dzienny, osoba odpowiedzialna, opcjonalna osoba kontaktowa, status i wynik/postęp. Filtry: otwarte, po terminie, zamknięte, wszystkie. Biuro może zmienić dane, wykonać, anulować lub ponownie otworzyć zadanie; wcześniejsze zmiany pozostają w audycie.
- Typ „Kontakt z klientem” automatycznie wyznacza **następny kontakt**: najwcześniejszy termin otwartego zadania tego typu. Zamknięcie lub anulowanie usuwa je z tego wskazania. Technicy mają wskazanie wyłącznie własnego następnego kontaktu.
- Opiekun handlowy: aktywny administrator lub pracownik biura, z możliwością usunięcia przypisania. Niedostępny opiekun jest oznaczony i może zostać zastąpiony.
- Historia współpracy zawiera metadane zmian notatek, zadań i opiekuna; nie kopiuje ich pełnej treści ani wyników do osi zdarzeń.

Terminy są datami działań, liczone według dnia w Europe/Warsaw. Nie rezerwują wizyt ani dostępności ekip. Nie uruchomiono automatycznych e-maili, push lub synchronizacji z pocztą. Zbiorczą listę własnych zadań opisuje [MY_TASKS.md](MY_TASKS.md).

## Dostęp

Notatki są prywatne dla administratora i biura. Technik nie widzi ich tytułów, treści, liczników ani zdarzeń. Zadania biuro przypisuje aktywnym pracownikom biura/administratorom lub technikom już przypisanym do klienta. Sam wybór opiekuna lub wykonawcy **nie nadaje uprawnień** i nie tworzy konta.

Technik wymaga aktywnego przypisania do klienta i widzi tylko własne zadania. Zmienia wyłącznie status i wynik; nie zmienia daty, tytułu, opisu ani wykonawcy. Nie anuluje zadań i nie wznawia zadania anulowanego przez biuro. Odebranie dostępu do klienta blokuje także odczyt i wykonanie już przypisanych zadań. Biuro może zamknąć zadanie nieaktywnego wykonawcy lub przekazać je innej dostępnej osobie. Nie może wznowić zadania na nieaktywnym przypisaniu.

Osoby kontaktowe muszą należeć do tego samego klienta. Istniejące powiązanie z osobą zarchiwizowaną może pozostać w zapisie; nie można jej wybierać do nowych rekordów. Archiwizacja klienta pozostawia odczyt, ale blokuje zapisy CRM. Portal klienta nie udostępnia żadnej z tych wewnętrznych funkcji.

## Dane i API

Migracja `202610280004_crm_work.sql`: `crm_notes`, `crm_tasks`, `crm_owners`; brak bezpośrednich uprawnień odczytu/zapisu dla authenticated, prywatne funkcje pomocnicze, jawnie chronione RPC i istniejący audyt. Zapis używa stabilnego UUID i wersji. Identyczne ponowienie ostatniej operacji jest bezpieczne, a stara wersja przy innej zmianie zwraca konflikt. API dodatkowo sprawdza projekcję odpowiedzi technika.

- GET `/api/v1/customers/{id}/crm` — opiekun, podsumowanie, następny kontakt, dozwolone opcje.
- PUT tej ścieżki: `{version, ownerId}` — opiekun lub null; biuro/admin.
- GET `/api/v1/customers/{id}/notes?archived=false&page=1` — 20 notatek na stronę, biuro/admin.
- PUT `/notes`: `{id,version,fields:{title,body,kind,occurredOn,contactId,archived}}`.
- GET `/api/v1/customers/{id}/tasks?filter=open&page=1` — 20 zadań na stronę, zakres roli.
- PUT `/tasks`: `{id,version,fields:{title,description,kind,dueOn,assigneeId,contactId,state,result}}` — biuro/admin.
- POST `/tasks/{taskId}/progress`: `{version,state,result}` — własny postęp technika lub biuro.
- GET `/activity` przyjmuje dodatkowo `crm_note`, `crm_task`, `crm_owner`.

Wspólne schematy i klient HTTP w `packages/api-client/src/crm-work.ts` / `client.ts` są gotowe do użycia przez przyszłe aplikacje mobilne i desktopowe. Nie oznacza to jeszcze gotowych instalatorów.

## Sprawdzenie

401 testów aplikacji, 776 testów bazy (59 nowych asercji SQL), typy, lint i kompilacja produkcyjna. Obejmują role, zakres klientów, brak notatek i cudzych zadań u technika, odbiór uprawnień, walidację dat i kontaktów, wersje i ponowienia, archiwizację, ponowne otwarcie zadania i blokadę zapisu klienta archiwalnego.

Przeglądarka: wybór opiekuna, dodanie zadania kontaktu, ukończenie poprzedniego kontaktu i wyczyszczenie jego terminu, dodanie notatki, archiwizacja/przywrócenie, motyw jasny/ciemny, układ 1440×1000 i telefon 390×844. Szerokość dokumentu na telefonie 390 px. Testowano wyłącznie tymczasową firmę demonstracyjną; dane usunięto automatycznie, audyt zachowano. Nie tworzono kont ani przypisań dostępu.

Podglądy: `output/qa/crm-work-light.png`, `crm-work-dark.png`, `crm-work-mobile.png`.

Zbiorczy widok **Moje zadania** wdrożono w KRA-11: [MY_TASKS.md](MY_TASKS.md). Kolejny proponowany krok: zadania w przeglądzie i dzwonku powiadomień.
