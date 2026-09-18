# Audyt zaangażowania — Matematyczne miasteczko

> Historical snapshot from before numbered steps, streak records, Most
> naprawczy and method labels shipped. It is not the live product inventory.
> Current capabilities: `PRODUCT_FEATURE_BRIEF.md`. Proposed leftovers:
> `REMAINING_IMPROVEMENTS.md`. Do not treat missing items here as current gaps.

## Zakres i obecny stan

Audyt obejmuje stronę główną, wspólny silnik i style oraz reprezentatywne
rozdziały 1 („Liczby i działania”) i 5 („Ułamki zwykłe”). Sprawdzenie
kontraktu DOM potwierdziło, że wszystkie siedem opublikowanych rozdziałów
korzysta z tych samych punktów zaczepienia wspólnego silnika.

Gra ma już dobre podstawy motywacyjne:

- dziesięciopytaniowe rundy z widocznym numerem pytania i paskiem postępu;
- punkty, licznik poprawnych odpowiedzi i licznik bieżącej serii;
- osobne rekordy punktowe dla rozdziału i ćwiczenia;
- automatyczny, opcjonalny zapis niedokończonej rundy w `localStorage`;
- podpowiedzi, natychmiastową informację poprawna/niepoprawna oraz wyjaśnienie;
- ekran końcowy z wynikiem, liczbą poprawnych odpowiedzi i oceną gwiazdkową;
- polskie komunikaty w regionach `aria-live`, obsługę klawiatury i widoczny fokus.

Obecny pasek postępu nie pokazuje jednak wyraźnie dziesięciu małych kroków,
seria nie ma kamieni milowych ani zapamiętanego rekordu, a informacja zwrotna
i podsumowanie używają prawie zawsze tych samych zdań.

## Pomysły usprawnień

| Nr | Pomysł oparty na obecnym kodzie | Korzyść dla dziecka | Pliki | Wysiłek | Wpływ | Dostępność |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Zamienić wspólny pasek na dziesięć numerowanych kroków, zachowując tekst „ukończono x/10” i semantykę `progressbar`. | Runda staje się przewidywalna, a każdy zakończony krok daje małe poczucie postępu. | `shared/game-engine.js`, `shared/game.css` | mały | wysoki | Widoczny tekst i `aria-valuenow` przekazują stan bez polegania na kolorze; kroki mieszczą się przy 320 px. |
| 2 | Połączyć bieżącą serię z najlepszą serią dla danej trasy, zapisywaną opcjonalnie w istniejącym obiekcie stanu v2; pokazywać kamienie milowe i serię na końcu. | Dziecko ma osiągalny cel niezależny od całkowitej liczby punktów i od razu widzi własny postęp. | `shared/game-engine.js`, `shared/game.css`, test magazynu | mały | wysoki | Rekord ma etykietę tekstową; komunikaty są krótkie i nie przerywają obsługi klawiaturą. |
| 3 | Urozmaicić życzliwe komunikaty po odpowiedzi oraz rozbudować istniejący ekran wyniku o konkretne podsumowanie; dodać subtelne animacje stanu. | Poprawna odpowiedź jest zauważona, błąd pozostaje bezpieczną częścią nauki, a finał wyjaśnia osiągnięcie. | `shared/game-engine.js`, `shared/game.css` | mały | wysoki | Błąd nadal pokazuje odpowiedź i wyjaśnienie; ruch wyłącza się przy `prefers-reduced-motion`; znaczenie nie zależy od animacji. |
| 4 | Dodać na stronie wyboru tras znaczniki ukończenia i rekordy każdej trasy. | Ułatwia wybór kolejnego celu i przypomina o wcześniejszych sukcesach. | `shared/game-engine.js`, wszystkie `ChapterN/index.html`, `shared/game.css` | średni | średni | Wymaga czytelnych nazw i ograniczenia zagęszczenia kart na małych ekranach. |
| 5 | Dodać ekran historii ostatnich rund z trendem poprawnych odpowiedzi. | Pokazuje długofalowy rozwój zamiast pojedynczego wyniku. | `shared/game-engine.js`, HTML rozdziałów, `shared/game.css` | duży | średni | Historia potrzebowałaby zrozumiałej tabeli/wykresu, obsługi pustych danych i większego zakresu danych lokalnych. |

## Wybrane usprawnienia — dokładnie trzy

1. **Dziesięć czytelnych kroków postępu.** Najmniejsza zmiana o dużym wpływie;
   korzysta z niezmiennej struktury 10 pytań i wspólnego paska.
2. **Seria połączona z osobistym rekordem.** Rozwija już istniejący licznik, nie
   tworzy nowej waluty ani systemu nagród, a zapis pozostaje opcjonalny i zgodny
   wstecz.
3. **Życzliwsza informacja zwrotna i mocniejszy finał.** Wykorzystuje istniejące
   wyjaśnienia, wynik i ekran końcowy; subtelny ruch jedynie podkreśla zmianę.

Pomysły 4 i 5 nie są wdrażane: rozszerzałyby zakres na wiele ekranów lub nowy
rodzaj historii, podczas gdy trzy wybrane zmiany poprawiają każdą opublikowaną
trasę wyłącznie we wspólnej warstwie.
