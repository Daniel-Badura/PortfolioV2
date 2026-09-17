# Audyt i plan modernizacji — 16.09.2026

## Zakres i punkt wyjścia

Przejrzano wszystkie pliki źródłowe frontendu i backendu, konfiguracje, assety, manifesty i historię Git. Gałąź `main`, ostatni commit `1cc5af5` (2023-11-10). Przed pracą jedyna zmiana użytkownika: `package-lock.json` (przeniesienie colors, morgan i TypeScript między grupami zależności). Kopię wejściowego lockfile zachowano w katalogu tymczasowym sesji; aktualizacje zależności zaczynają od zastanego stanu, bez resetowania Git.

Stack: React 18 / TypeScript, CRA 5, React Router 6, Tailwind 3, Redux Toolkit i axios; Express 4, Mongoose 7. Pięć tras SPA: `/`, `/projects`, `/contact`, `/facebook`, `/instagram`. Brak testów mimo skryptu Jest. Brak CI i lint/typecheck na poziomie repo. Root start wywołuje niezadeklarowane `ts-node` dla JavaScript. Dockerfile jest lokalny, ignorowany przez Git; jego `CMD npm run` nie uruchamia serwera, brak buildu frontendu i niespójne porty. Repo wskazuje historyczne wdrożenie Heroku; brak potwierdzonej aktualnej domeny.

Warstwa treści: pięć projektów w `backend/data/projects.js`, potwierdzony opis administratora IT z doświadczeniem web development, email, GitHub i LinkedIn. README dodatkowo wymienia Keynotes i WWFDB, ale bez danych umożliwiających rzetelną prezentację. Brak CV, pracodawców, chronologii, osiągnięć, certyfikatów czy dowodów użycia Kubernetes/Terraform/cloud. Profil DevOps / Platform Engineer pochodzi z aktualnej dyspozycji właściciela. Nie wolno przedstawiać historycznych aplikacji jako projektów infrastruktury produkcyjnej.

Kontakt to mailto, nie formularz. Nodemailer, JWT, bcrypt i generator tokenów nie mają konsumentów. API jest tylko do odczytu, brak panelu zarządzania. Baza nie jest potrzebna do edytowania treści w repo, ale istniejący tryb MongoDB należy zachować. Nie łączono się z prywatną bazą ani nie uruchamiano seedera.

## Priorytety i decyzje

| Priorytet | Stan / problem | Zmiana i uzasadnienie |
|---|---|---|
| CRITICAL | `npm audit`: root 31 (4 critical, 16 high), frontend 74 (4 critical, 37 high). Wynik obejmuje zależności pośrednie i narzędzia; nie jest dowodem zdalnej eksploatowalności. | Aktualizacja utrzymywanych pakietów, usunięcie niewykorzystanych zależności i CRA. Ponowny skan obu lockfile. |
| HIGH | Wymagana baza do pięciu publicznych rekordów; brak loading/error UI; sentinel `error: initial` zamiast stanu. | Wersjonowane dane wspólne, widoczne od pierwszego renderowania; opcjonalna aktualizacja z API i czytelny fallback. MongoDB tylko przez jawny tryb. |
| HIGH | Endpoint szczegółów odczytuje pola z null oraz `questions.length` nieistniejące w schemacie; wyszukiwanie przyjmuje surowy regex. | Walidacja identyfikatora, 404, dosłowne wyszukiwanie z limitem długości, kontrolowane błędy. |
| HIGH | Startup, Docker i porty niespójne. | Node 24 LTS, zwykły `node`, wieloetapowy build, nieuprzywilejowany runtime, healthcheck. |
| HIGH | Hero na wszystkich trasach, brak roli, lorem ipsum i żartobliwe strony social. | Krótki profil zawodowy, rozdzielenie profilu / projektów / kontaktu, przekierowanie dawnych social routes do kontaktu. |
| MEDIUM | Brak main/h1, anonimowy hamburger, ukrywanie stacku do hover, anonimowe linki social, wyłączony focus. | Semantyka, widoczny focus, skip link, dostępna nawigacja, obsługa Escape, stała widoczność ważnej treści. |
| MEDIUM | Tło hero 3.43 MB, brak wymiarów obrazów, zewnętrzne fonty, ~19 MB public assets. | Systemowe fonty, brak ciężkiego tła, zoptymalizowane WebP, lazy loading, wykluczenie nieużywanych oryginałów z dystrybucji. |
| MEDIUM | CRA description, brak OG/canonical/sitemap/structured data, puste HTML SPA. | Prerender głównych tras, metadata per route, Person JSON-LD, canonical/sitemap tylko przy jawnie skonfigurowanej domenie. |
| MEDIUM | Globalny Redux i duplikacja pobierania dla jednej listy. `any`, martwy details reducer i CSS CRA. | Typowane dane, jeden provider projektów i natywny fetch; usunięcie nadmiarowego stanu i stylów. |
| MEDIUM | Brak nagłówków bezpieczeństwa; nieznane trasy mogą zwracać 200 HTML, również API. | CSP bez zewnętrznych skryptów, nosniff, referrer/permissions policy, poprawne 404 i obsługa API. |
| LOW | Nieaktualny rok, literówki assetów, README CRA, brak instrukcji wdrażania i walidacji. | Dokumentacja, testy regresji API i przeglądarki, CI. |

## Bezpieczeństwo i ograniczenia audytu

`.env` istnieje lokalnie i jest ignorowany, nie jest śledzony i nie występuje w historii ścieżki. Nie wypisano jego wartości. Repo nie zawiera wywołań zewnętrznych skryptów analitycznych. Publiczne fonty Google są dodatkowym żądaniem do strony trzeciej. Docelowo brak zależności od tych fontów. Żadne sekrety nie trafiają do metadanych lub konfiguracji klienta. To przegląd repo i skan zależności, nie test penetracyjny ani audyt kont chmurowych.

## Strategia

Zachować React 18, Router 6, TypeScript, Express i opcjonalny MongoDB. Migracja samego buildu CRA → Vite jest uzasadniona zakończeniem rekomendacji CRA (https://react.dev/blog/2025/02/14/sunsetting-create-react-app), rozmiarem drzewa zależności i legacy OpenSSL. Nie wprowadzać Next.js, CMS, biblioteki UI ani animacji. CSS z niewielkim zestawem tokenów lepiej odpowiada małej stronie niż utrzymywanie Tailwind dla kilku widoków.

UI: jasne tło, grafit, ciemna zieleń, redakcyjny układ i numeracja sekcji. Projekty jako opisy + repozytoria, a nie kafle zasłonięte gradientem. Historyczne demo zachować z jasną informacją, że dostępność nie jest gwarantowana. Język angielski zachowany z obecnej strony. Szczegółowe doświadczenie DevOps wymaga materiału od właściciela, nie generowanych twierdzeń.

## Korekta planu po aktualizacji zależności

Najnowsza dostępna gałąź React Router 6 nadal otrzymała dwa zgłoszenia moderate (`GHSA-wrjc-x8rr-h8h6`, `GHSA-337j-9hxr-rhxg`). Zaktualizowano Router do 7.18.4, bez przechodzenia na framework mode, zmiany modelu routingu lub React 19. Podniesiono też sharp do 0.35.4 z poprawkami libvips/libheif. Zastosowano ESLint 10 zamiast nieutrzymywanej wersji 9; dostępność jest testowana przez axe w rzeczywistej przeglądarce. Końcowy skan obu drzew: zero zgłoszeń.

Wersja bazowa została uruchomiona i obejrzana w Chrome przed zmianami. Potwierdzono olbrzymi hero, lorem ipsum, puste projekty przy niedostępnym API i warningi nieużywanych importów. Początkowa próba buildu CRA została wykonana z niewłaściwego katalogu i nie jest traktowana jako dowód błędu projektu. Dev build z poprawnego katalogu działał z warningami.
