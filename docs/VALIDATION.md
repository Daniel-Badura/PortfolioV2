# Walidacja modernizacji

## Aktualizacja: formularz Formspree

Formularz React (`@formspree/react`) skonfigurowano dla `moevqqvl`, z opcjonalnym build-time override `VITE_FORMSPREE_FORM_ID`. Zastępuje główny adres email; pozostawia LinkedIn i GitHub. Zaktualizowano CSP i konfigurację Docker build. Prerender używa trybu production, zgodnego z bundlowaniem zmiennych środowiskowych.

Walidacja po integracji: lint i strict TypeScript OK; build OK; 6/6 testów API i 27/27 testów przeglądarkowych. Przegląd desktop/mobile i axe bez naruszeń. Nowe testy obejmują poprawną wysyłkę, blokadę ponownego wysłania, natywną walidację, błędy pól, awarię sieci, 429, 500, nieprawidłową odpowiedź oraz POST bez JavaScript. Wszystkie zgłoszenia Formspree przechwycono lokalnie — nie wysyłano wiadomości do rzeczywistej skrzynki i nie potwierdzano dostarczenia poczty. Po instalacji SDK frontend: 0 zgłoszeń npm audit. Poniższe pomiary Lighthouse i rozmiary opisują wcześniejszą wersję modernizacji, przed dodaniem sklepu i formularza.

Data: 2026-09-16. Windows, Node 24.19.0, Chrome headless, produkcyjny Express. Bez publikowania strony i bez dostępu do prywatnej bazy.

## Wyniki

| Kontrola | Wynik |
|---|---|
| Czysta instalacja root `npm ci --ignore-scripts` | OK, 272 pakiety w audycie |
| Czysta instalacja frontend `npm ci --prefix frontend` | OK, 33 pakiety w audycie |
| ESLint 10, zero dozwolonych warningów | OK |
| TypeScript strict, noUnusedLocals / noUnusedParameters | OK |
| Testy API `node --test` | 6/6 |
| Produkcyjny build Vite + prerender | OK |
| Playwright / Chrome | 19/19 |
| axe WCAG 2 A/AA, 2.1 AA, 2.2 AA | Brak wykrytych naruszeń w 12 kombinacjach widok/szerokość |
| `npm audit`, root i frontend | 0 zgłoszonych podatności |
| `git diff --check` | OK |
| `docker compose config --quiet` | OK |

Przegląd wizualny wykonano na zrzutach rzeczywistej przeglądarki przed i po zmianach. Testy obejmują overview/projects/contact przy 320, 390, 768, 1440 px, brak poziomego overflow, załadowanie obrazów, poprawną hierarchię nagłówków, konsolę bez błędów, menu i Escape, focus po nawigacji, historię, skip link, reduced motion, filtr i pusty stan, awarię API, kopiowanie emaila z obsługą odmowy, odpowiedzi 404, HTML bez JavaScript i kompresję/cache. Poprawiono wykryty podczas rozszerzonej kontroli konflikt CSS nawigacji bez JS.

## Wydajność

Lighthouse 13.4.1, profil mobile, localhost, produkcyjny serwer:

| Kategoria | Wynik |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

FCP 1.2 s, LCP 1.4 s, TBT 0 ms, CLS 0. Brak runtimeError i runWarnings w raporcie. To pomiar laboratoryjny, nie polowe Core Web Vitals ani gwarancja wyniku na produkcyjnym hostingu. Automatyczne testy nie stanowią certyfikacji WCAG; nie przeprowadzono pełnego testu z czytnikiem ekranu.

JS: 197 569 B surowo / 63 454 B gzip / 55 600 B Brotli. CSS: 11 560 B surowo / 3 164 B gzip / 2 720 B Brotli. Pięć screenshotów projektów: 754 161 B oryginalnych JPEG → 102 778 B dla zestawu 720px WebP (około 86% mniej); dodatkowe warianty 360/540px ograniczają transfer na mniejszych ekranach. Hero nie ładuje dawnego tła JPEG 3.43 MB. Brak zewnętrznych fontów i skryptów.

Lighthouse uruchomiono dodatkowo przez API z kontrolowaną instancją Chrome, ponieważ pierwsza próba CLI zakończyła się błędem usuwania tymczasowego profilu Windows już po zapisaniu raportu. Końcowy pomiar przez API zakończył się kodem 0.

## Pozostałe ograniczenia

- Docker Engine był niedostępny (brak pipe dockerDesktopLinuxEngine). Sprawdzono konfigurację, nie zbudowano ani nie uruchomiono kontenera.
- Tryb MongoDB testowano z atrapą modelu, bez połączenia z prywatną bazą. Seeder i usuwanie rekordów nie były wykonywane.
- Domena nie jest potwierdzona. Generowanie metadata dla SITE_URL sprawdzono na zarezerwowanej domenie testowej; końcowy build nie zawiera tej domeny. Przed publikacją ustawić prawdziwe SITE_URL i wykonać build.
- Nie wykonano wdrożenia, konfiguracji HTTPS/HSTS ani zdalnego uruchomienia GitHub Actions.
- W repo brak materiałów o pracodawcach, projektach infrastrukturalnych, technologiach chmurowych i osiągnięciach. Ich rzetelne dodanie wymaga danych od właściciela.
- Historyczne demo: HEAD zwrócił 200 dla Testowo, Widoczki i Portfolio v1; WebSklep i GitHub Lens nie odpowiedziały w limicie 8 s. HTTP 200 nie potwierdza pełnej sprawności aplikacji. Linki oznaczono jako historyczne.

Zrzuty i surowy raport Lighthouse znajdują się lokalnie w ignorowanym `test-results/`. README zawiera komendy odtworzenia testów. Oryginalne media pozostają w repo. Usunięty martwy kod jest dostępny w historii Git; nie wykonywano resetów ani commitów.
