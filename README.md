# ADAM DEUTSCH TRAINER · Konkurs Kuratoryjny 2026/27

Webowa aplikacja do przygotowania do **Konkursu Przedmiotowego z Języka Niemieckiego Mazowieckiego Kuratora Oświaty** (szkoła podstawowa, rok szkolny 2026/27). Zbudowana dla ucznia na poziomie B2+, który mówi płynnie, ale musi dopracować **precyzję gramatyczną i ortograficzną** - bo tego konkurs wymaga.

| Etap | Termin (oficjalny harmonogram) | Format | Próg |
|---|---|---|---|
| Szkolny | pon. **5.10.2026**, 9:00 | 90 min · 40 pkt · 9 zadań | awans: 5% najlepszych z wynikiem > 20% |
| Rejonowy | pon. **30.11.2026**, 11:00 | 90 min · 60 pkt · 10 zadań · temat: **UNESCO w Niemczech** | ≥ 85% (lub top 25%) |
| Wojewódzki | pon. **1.03.2027**, 11:00 | 90 min · 60 pkt · słuchanie · temat: **Naturdenkmale** | laureat ≥ 90%, finalista ≥ 40% |

## Co jest w środku

- **Dashboard** - odliczanie do etapu, % przygotowania, dzisiejszy plan, rekomendacja „Co zrobić teraz?”, słabe obszary wykrywane automatycznie, postęp w kategoriach (z wagami punktowymi z arkuszy).
- **Plan nauki** - trzy fazy (sprint szkolny → UNESCO i precyzja form → laureat), cel dzienny, priorytety tygodnia.
- **Nauka** - 43 tematy curriculum (33 z pełną lekcją); każda lekcja: wyjaśnienie po polsku, tabele, przykłady, pułapki, „źle → dobrze”, mini quiz, trening, „oznacz jako opanowane”.
- **Trening** - tryb adaptacyjny, tylko błędy, powtórki SRS, nowe pytania; filtry kategorii i etapu.
- **Bank ~600 oryginalnych pytań** (ok. 400 pisanych ręcznie + generowane z bazy faktów UNESCO/D-A-CH) w 11 typach: A/B/C/D, wpisywanie, luki, wybór wielokrotny, dopasowanie, kolejność, reakcje, transformacje, czytanie, bank słów, prawda/fałsz.
- **Moje błędy** i **Powtórki** - każdy błąd z odpowiedzią ucznia, poprawną, wyjaśnieniem, licznikiem i datą; naprawiony po 2 poprawnych odpowiedziach z rzędu.
- **Próbny konkurs** - generator etapu szkolnego (9 zadań / 40 pkt) i rejonowego (10 zadań / 60 pkt) odwzorowany na arkuszach 2022-2026 + etap wojewódzki (beta). Timer 90 min, „wróć później”, brak podpowiedzi, samoocena e-maila wg kryteriów MKO, analiza wg kategorii i zadań, lista błędów, rekomendacje, historia.
- **Landeskunde D-A-CH** - interaktywne mapy Niemiec, Austrii i Szwajcarii, quiz „znajdź na mapie”, stolice, najważniejsze fakty.
- **UNESCO / etap rejonowy** - 55 obiektów (28 kluczowych ze źródeł programu, z pełnymi kartami: historia, dlaczego UNESCO, cechy, ciekawostki, słownictwo, krótki tekst po niemiecku), mapa, fiszki, timeline, „rozpoznaj obiekt”, obiekt → kraj związkowy i odwrotnie, trening mieszany; zakładka **Naturdenkmale** pod etap wojewódzki.
- **E-Mail** - 5 zadań w stylu zad. 9, licznik słów, kontrola techniczna (zwrot, mała litera po przecinku, XYZ), wzory, timer 15 min.
- **Statystyki**, **Postęp Adama** (widok rodzica: czas nauki, sesje, accuracy, historia konkursów, najmocniejsze/najsłabsze obszary, rekomendacje na tydzień), **osiągnięcia, XP, poziomy, streak**.
- Tryb jasny/ciemny, pełna obsługa telefonu i komputera.

## Jak uruchomić lokalnie

Potrzebny [Node.js](https://nodejs.org) w wersji 20 lub nowszej.

```bash
npm install
npm run dev        # otwórz adres pokazany w terminalu (np. http://localhost:5173)
```

Inne polecenia: `npm run build` (wersja produkcyjna do katalogu `dist/`), `npm run lint`, `npm run typecheck`, `npm test`.

## Jak wdrożyć na GitHub Pages

1. Wypchnij kod do gałęzi `main` tego repozytorium.
2. W GitHubie: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` sam zbuduje i opublikuje aplikację po każdym pushu. Adres: `https://scamdo.github.io/adam-deutsch-trainer/`.

Aplikacja używa `HashRouter` i ścieżek względnych, więc działa w podkatalogu GitHub Pages bez dodatkowej konfiguracji.

## Zapis postępu i Supabase (opcjonalnie)

Bez żadnej konfiguracji postęp zapisuje się w przeglądarce (localStorage) - aplikacja działa od razu. Eksport/import kopii jest w Ustawieniach.

Synchronizacja między urządzeniami (i widok rodzica na innym komputerze):

1. Załóż darmowy projekt na [supabase.com](https://supabase.com).
2. **SQL Editor** → wklej zawartość `supabase/schema.sql` → **Run**. Powstaną tabele: `profiles`, `study_sessions`, `question_attempts`, `mastery`, `mistakes`, `mock_exams`, `achievements`, `daily_activity` - wszystkie z polityką RLS „każdy widzi tylko swoje dane”.
3. **Authentication → URL Configuration**: ustaw *Site URL* na adres aplikacji (np. `https://scamdo.github.io/adam-deutsch-trainer/`) i dodaj go do *Redirect URLs*.
4. **Project Settings → API**: skopiuj *Project URL* i klucz **anon / publishable** (NIE `service_role`).
5. W repozytorium GitHub: **Settings → Secrets and variables → Actions → Variables** dodaj `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`. Lokalnie: skopiuj `.env.example` do `.env.local`.
6. Po wdrożeniu: Ustawienia w aplikacji → zaloguj e-mailem (link lub kod, bez hasła).

Bezpieczeństwo: w kodzie nie ma żadnych haseł ani sekretów; klucz anon jest publiczny z założenia, a dostęp do danych chronią polityki RLS.

## Architektura (dla rozwoju)

```
src/
  content/          treści: curriculum (topics.ts), pytania (questions/*), UNESCO, D-A-CH, Naturdenkmale, e-maile
  engine/           logika: sprawdzanie odpowiedzi, mastery + SRS, dobór adaptacyjny, generator konkursu, plan, grywalizacja
  storage/          abstrakcja zapisu: localStorage (domyślnie) i Supabase (opcjonalnie)
  store/            stan aplikacji (Zustand)
  components/       UI: renderer wszystkich typów pytań, runner quizu, mapy SVG, layout
  pages/            ekrany modułów
supabase/schema.sql schemat bazy + RLS
scripts/            generator map (Natural Earth, domena publiczna)
docs/               analiza konkursu i decyzje projektowe
```

- **Nowe pytania**: dopisz do pliku w `src/content/questions/` (pomocnicze funkcje `q.mc`, `q.input`, `q.gap`…). Test `npm test` sprawdzi integralność i to, czy wzorcowa odpowiedź jest oceniana jako poprawna.
- **Nowy moduł**: strona w `src/pages/`, trasa w `src/App.tsx`, link w `src/components/Layout.tsx`.

## Źródła

Analiza oparta na oficjalnych materiałach Kuratorium Oświaty w Warszawie: program merytoryczny j. niemieckiego 2026/27, regulamin konkursów 2026/27 z harmonogramami, arkusze i modele oceniania z Banku zadań (szczegóły w `docs/ANALIZA-KONKURSU.md`). Pytania są autorskie - odwzorowują strukturę i typy zadań, nie kopiują treści arkuszy.
