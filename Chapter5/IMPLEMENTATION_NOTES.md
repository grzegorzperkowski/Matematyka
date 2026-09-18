# Rozdział 5 — analiza programu, projekt ćwiczeń i zapis implementacji

## Status

- Etap: **rozdział zaimplementowany, opublikowany i zweryfikowany 2026-09-18**.
  Stacja `porownywanie` pokazuje dwa modele ułamków zamiast samego zapisu.
- Tytuł rozdziału ustalony ze strony otwierającej: **Ułamki zwykłe**.
- Źródło: 30 plików `page_0159.png`–`page_0188.png`, obejrzanych w całości i w kolejności 2026-09-16.
- Obrazy są wyłącznie materiałem programowym. Nie wolno publikować, buforować, kopiować ani odtwarzać ich ilustracji i treści zadań w grze.
- Przed analizą przeczytano `NEW_CHAPTER_PROMPT_TEMPLATE.md`, `AI_DEVELOPMENT_GUIDE.md` i `CHAPTER_TEMPLATE.md`. Sprawdzono także aktualnie dostępne typy wizualizacji w silniku, aby plan nie zakładał nieistniejących możliwości.
- Stan repozytorium przed pracą zawierał trzy nieśledzone pliki niezwiązane z rozdziałem 5: `Download-GwoPages.ps1`, `NEW_CHAPTER_PROMPT_TEMPLATE.md` i `Test-Download-GwoPages.ps1`. Pozostawiono je bez zmian.
- Utworzono `Chapter5/index.html`, `Chapter5/game.js`, testy generatorów i offline oraz integrację ze stroną główną i service workerem. Materiał ze skanów posłużył wyłącznie do ustalenia zakresu dydaktycznego.

## Mapa stron źródłowych

Numery plików są o jeden większe od drukowanych numerów stron; `page_0159.png` jest stroną tytułową działu.

| Pliki | Strony drukowane | Zawartość i postęp trudności |
| --- | --- | --- |
| `page_0159.png` | otwarcie działu | Tytuł „Ułamki zwykłe”; intuicyjne rozpoznawanie połowy i ćwierci na kołach oraz ocena, czy pokolorowane części figury rzeczywiście stanowią połowę. |
| `page_0160.png`–`page_0161.png` | 158–159 | **Ułamek jako część całości**: podział na równe części, zapis i odczytywanie ułamka, licznik, mianownik i kreska ułamkowa. Mianownik opisuje liczbę równych części całości, a licznik — liczbę części wybranych. Rozpoznawanie części na kołach, prostokątach, pasach i siatkach. |
| `page_0162.png`–`page_0163.png` | 160–161 | Utrwalenie modelu część–całość: cięcie odcinka/sznurka, część tortu po podziale, kolorowanie kilku ułamków w jednej figurze, część zamalowana i niezamalowana, warunki na licznik i mianownik, ułamki opisujące zbiory przedmiotów i osoby. Pojawiają się proste zagadki tekstowe oraz figury o mniej oczywistym podziale. |
| `page_0164.png`–`page_0165.png` | 162–163 | **Liczby mieszane** jako suma części całkowitej i ułamkowej. Odczyt z modeli całości, zapis części jednostki i kilku jednostek w centymetrach/metrach, gramach/kilogramach, minutach/godzinach i godzinach/dobach. Zamiana jednostek prowadzi do ułamków lub liczb mieszanych; odczyt pojemności oraz zadanie z calami i stopami. |
| `page_0166.png`–`page_0167.png` | 164–165 | **Ułamki i liczby mieszane na osi liczbowej**: dzielenie odcinka jednostkowego na tyle równych części, ile wskazuje mianownik; odczytywanie i zaznaczanie ułamków oraz liczb mieszanych; dobór właściwej podziałki. Trudniejsze zadania obejmują gęste osie o różnych zakresach oraz ruch pionka o kroki `1/3` i `2/3`. |
| `page_0168.png`–`page_0171.png` | 166–169 | **Porównywanie ułamków**: ułamki o jednakowych mianownikach, ułamki o jednakowych licznikach, porównywanie liczb mieszanych, porządkowanie na osi, dobieranie liczb spełniających nierówność i porównywanie z `1/2`. Reguła połowy: licznik mniejszy/większy od połowy mianownika wskazuje ułamek mniejszy/większy od `1/2`. Zastosowania tekstowe rozróżniają część zużytą od części pozostałej. |
| `page_0172.png`–`page_0173.png` | 170–171 | **Rozszerzanie i skracanie ułamków**: równoważność modeli `1/2 = 2/4`, mnożenie lub dzielenie licznika i mianownika przez tę samą liczbę różną od zera, ułamki nieskracalne, sprowadzanie do wskazanego mianownika lub licznika, skracanie do najprostszej postaci i porównywanie po sprowadzeniu do wspólnego mianownika. Końcowe zagadki dotyczą brakujących cyfr w równych ułamkach. |
| `page_0174.png`–`page_0177.png` | 172–175 | **Ułamki niewłaściwe** i właściwe; zależność od liczby `1` na podstawie relacji licznika do mianownika. Modele wielu identycznych części, zamiana ułamka niewłaściwego na liczbę mieszaną/naturalną oraz odwrotnie, przedstawianie liczb naturalnych z zadanym mianownikiem, a także odczyt obrazka na dwa sposoby. |
| `page_0178.png`–`page_0180.png` | 176–178 | **Ułamek jako wynik dzielenia**: sprawiedliwy podział jednej lub kilku całości pomiędzy osoby; równoważność `a : b = a/b`; skracanie wyniku, a dla ułamka niewłaściwego — dzielenie z resztą i wyłączanie całości. Zadania obejmują zapis ilorazu jako ułamka i odwrotnie, podział jedzenia, zamianę ułamków niewłaściwych oraz porządkowanie na osi. |
| `page_0181.png`–`page_0182.png` | 179–180 | **Dodawanie ułamków zwykłych o jednakowych mianownikach**: dodawanie liczników przy niezmienionym mianowniku, wyłączanie całości z wyniku niewłaściwego, dodawanie liczb mieszanych osobno w częściach całkowitych i ułamkowych, sprytne grupowanie składników, brakujący składnik i zadania tekstowe. |
| `page_0183.png`–`page_0186.png` | 181–184 | **Odejmowanie ułamków zwykłych o jednakowych mianownikach**: odejmowanie liczników, odejmowanie ułamka od liczby naturalnej, odejmowanie liczb mieszanych bez zamiany i z zamianą jednej całości na części ułamkowe. Dalej: równania z niewiadomą, droga/pojemność/masa, błąd rachunkowy do wyjaśnienia, odczyt osi i wieloetapowe zadania tekstowe. |
| `page_0187.png` | 185, „Przed klasówką” | Powtórzenie całego działu: licznik i mianownik, część doby, modele figur, liczby mieszane i niewłaściwe, ułamki równoważne, oś liczbowa, dodawanie, odejmowanie, porównywanie oraz zadanie zbiorcze. |
| `page_0188.png` | 186, „W krainie łamigłówek” | Dwie łamigłówki końcowe: zależność arytmetyczna między trzema liczbami mieszanymi oraz logiczna macierz kolejności figur. Druga zagadka ćwiczy wzorzec, ale nie jest specyficzna dla ułamków. |

## Cele dydaktyczne i granice rozdziału

Po ukończeniu rozdziału uczeń powinien:

1. rozumieć, że części muszą być **równe**, i poprawnie interpretować licznik oraz mianownik;
2. odczytywać i tworzyć ułamki na modelach figur, zbiorów i wielkości;
3. odczytywać oraz zapisywać liczby mieszane;
4. umieszczać ułamki i liczby mieszane na osi o jawnej podziałce;
5. porównywać ułamki o wspólnym mianowniku, wspólnym liczniku, względem `1/2` i `1`, a w prostych przypadkach przez rozszerzenie;
6. rozszerzać i skracać ułamki, rozpoznawać równe ułamki i postać nieskracalną;
7. rozróżniać ułamki właściwe i niewłaściwe oraz zamieniać zapis niewłaściwy, mieszany i naturalny;
8. interpretować `a/b` jako `a : b` i używać dzielenia z resztą do wyłączania całości;
9. dodawać i odejmować ułamki oraz liczby mieszane **o jednakowych mianownikach**, w tym odejmować z zamianą jednej całości;
10. rozwiązywać krótkie zadania tekstowe i wykrywać typowe błędy rozumowania.

Świadome ograniczenia:

- Nie wprowadzamy dodawania ani odejmowania ułamków o różnych mianownikach. Materiał źródłowy stosuje wspólny mianownik przy porównywaniu, lecz działania wykonuje tylko dla jednakowych mianowników.
- Nie wprowadzamy mnożenia i dzielenia ułamków, liczb ujemnych, ułamków dziesiętnych ani procentów.
- Mianowniki w podstawowych pytaniach powinny mieścić się zwykle w zakresie `2–12`; `15`, `20`, `24`, `50` i `100` można stosować oszczędnie w zadaniach o skracaniu i jednostkach. Bardzo duże mianowniki ze strony źródłowej służą demonstracji skracania, ale nie powinny dominować w grze.
- Wyniki mają być dokładne; bez przybliżeń i bez odpowiedzi dziesiętnych.
- Modele części całości zawsze muszą pokazywać równe części. Nierówny podział może pojawić się tylko jako jednoznaczny błąd do rozpoznania.
- Przeliczenia jednostek są kontekstem dla liczby mieszanej, a nie osobnym kursem jednostek. Należy używać znanych zależności podanych w pytaniu lub podpowiedzi.

## Zaimplementowane stacje i stabilne identyfikatory tras

Poniższe identyfikatory są publicznym kontraktem adresów rozdziału. Każda trasa zwraca dokładnie 10 autorskich pytań. Trasa `mix` pobiera po jednym pytaniu z każdej z dziesięciu stacji, dzięki czemu pełny obchód nie pomija żadnego tematu.

| ID trasy | Nazwa stacji | Zakres | Rodziny pytań, wartości i pomoce |
| --- | --- | --- | --- |
| `czesci-calosci` | Pracownia równych części | część całości, licznik, mianownik, dopełnienie do całości, ułamek zbioru | Odczyt zaznaczenia na kole/prostokącie/siatce (`2–12` części), wskazanie licznika lub mianownika, wybór poprawnie podzielonej figury, część obiektów spełniających warunek, brakująca część do `1`. Każdy model niesie jawne dane, nie jest dekoracją. |
| `liczby-mieszane` | Magazyn całych i części | budowa i odczyt liczby mieszanej, część jednostki, proste zamiany jednostek | Odczyt kilku całych figur i reszty; składanie „całości + część”; cm↔m, min↔h, h↔doba, dag↔kg na dobranych wielokrotnościach; wartości całkowite `1–9`, mianowniki zgodne z jednostką albo uproszczone. |
| `os-ulamkowa` | Ulica ułamkowej osi | podział odcinka jednostkowego, odczyt i zaznaczanie ułamków/liczb mieszanych | Odczyt zaznaczonego punktu, wybór położenia, brakująca etykieta, dopasowanie podziałki do mianownika, prosty spacer po osi. Zakres zwykle `0–5`, mianownik `2–10`; pozycje przechowywane jako całkowita liczba kroków, nie jako niedokładne liczby zmiennoprzecinkowe. |
| `porownywanie` | Wieża porównań | wspólny mianownik/licznik, liczby mieszane, punkt odniesienia `1/2` i `1`, porządkowanie | Wstawianie `<`, `>` lub `=`, wybór największej/najmniejszej liczby, układanie 4–6 kart, wskazanie liczby bliższej `1`, pytania „zużyto/pozostało”. Każde zadanie pokazuje dwa modele ułamków z jawnymi licznikami i mianownikami, nie sam zapis. Najpierw jedna jawna reguła, później wybór strategii. |
| `rozszerzanie-skracanie` | Warsztat równoważności | ułamki równe, brakujący licznik/mianownik, postać nieskracalna, wspólny mianownik | Uzupełnienie jednej wartości, wybór wszystkich ułamków równych, skrócenie do najprostszej postaci, rozszerzenie do wskazanego mianownika/licznika, wykrycie błędnego kroku. Mnożnik/dzielnik zwykle `2–10`; dane mają jednoznaczne rozwiązanie całkowite. |
| `ulamki-niewlasciwe` | Przepakownia całości | właściwy/niewłaściwy, relacja do `1`, ułamek ↔ liczba mieszana/naturalna | Klasyfikacja, odczyt wielu całych modeli, wyłączanie całości, zamiana liczby mieszanej na niewłaściwą, zapis liczby naturalnej z zadanym mianownikiem. Całości `1–9`, mianowniki `2–12`, licznik na ogół nie większy niż `10 × mianownik`. |
| `ulamek-jako-iloraz` | Punkt sprawiedliwego podziału | `a : b = a/b`, równy podział, dzielenie z resztą | Dzielenie przedmiotów między osoby, zapis ilorazu jako ułamka i odwrotnie, wynik naturalny lub mieszany, interpretacja reszty jako części jednostki. Dzielnik `2–12`, wynik do `9` całości; konteksty inne niż ilustracje źródłowe. |
| `dodawanie` | Kasa ułamkowych sum | wspólny mianownik, wynik właściwy/niewłaściwy, liczby mieszane, brakujący składnik | Dodawanie na pasku, rachunek prosty, wyłączanie całości, dodawanie liczb mieszanych, grupowanie do pełnej całości, zadanie tekstowe i równanie z okienkiem. Wyłącznie wspólne mianowniki; wynik nieujemny, zwykle do `20`. |
| `odejmowanie` | Kasa ułamkowych różnic | wspólny mianownik, całość minus ułamek, liczby mieszane bez i z zamianą | Wizualne zabieranie części, rachunek prosty, odejmowanie od liczby naturalnej, pożyczka jednej całości, niewiadoma, analiza błędu i zadanie tekstowe. Odejmowana liczba nigdy nie przewyższa odjemnej; wynik nieujemny. |
| `ulamkowe-zagadki` | Klub tropicieli ułamków | łączenie reprezentacji i strategie problemowe | Autorskie mini-misje: napraw cudze rozwiązanie, odkoduj brakującą cyfrę, wybierz wystarczającą wskazówkę, dwustopniowy spacer po osi, porównaj część zużytą z pozostałą, dopasuj trzy równoważne karty. Jedno zadanie może mieć dwa kroki, ale bez nowego materiału. |
| `mix` | Wielki ułamkowy obchód | przekrój całego rozdziału | Dokładnie po jednym pytaniu z każdej z dziesięciu tras, w losowej kolejności. |

## Progresja wewnątrz stacji

Każda dziesięciopytaniowa runda powinna przechodzić od rozpoznania do samodzielnego rozumowania:

1. dwa pytania z czytelnym modelem lub kontekstem;
2. trzy pytania ćwiczące pojedynczą regułę;
3. dwa pytania łączące dwie reprezentacje, np. model i zapis albo iloraz i liczbę mieszaną;
4. dwa krótkie zadania tekstowe lub pytania odwrócone;
5. jedno pytanie „uważaj na pułapkę”: analiza błędu, brakująca wartość albo wybór strategii.

Losowanie powinno zmieniać dane i kolejność, lecz nie może przypadkowo wygenerować rundy złożonej wyłącznie z jednego łatwego typu. Warto budować rundę z określonych koszyków kompetencji, a dopiero potem tasować pytania.

## Najciekawsze pomysły na ćwiczenia

Poniższe pomysły są autorskimi formatami inspirowanymi zakresem, nie kopią zadań ze stron:

1. **Kontroler podziału** — spośród czterech figur uczeń wybiera tę, w której zaznaczenie naprawdę przedstawia podany ułamek; część dystraktorów ma właściwy kolor, lecz nierówne części.
2. **Zbuduj ułamek z dwóch liczb** — osobno podane są liczba wszystkich równych pól i liczba pól wybranych; uczeń składa zapis oraz nazywa jego elementy.
3. **Winda na osi** — punkt startuje na liczbie mieszanej, wykonuje dwa kroki o podanych ułamkach i trzeba podać piętro końcowe. Kroki zawsze pasują do podziałki.
4. **Pojedynek strategii** — uczeń wybiera najlepsze uzasadnienie porównania: wspólny mianownik, wspólny licznik, odniesienie do `1/2`, odniesienie do `1` lub położenie na osi.
5. **Maszyna równoważności** — pokazany jest jeden mnożnik/dzielnik przy liczniku; uczeń uzupełnia operację przy mianowniku i wynik, widząc że obie części ułamka zmieniają się razem.
6. **Łańcuch skracania** — należy wskazać pierwszy błędny krok w skracaniu albo najkrótszą poprawną drogę do postaci nieskracalnej.
7. **Pakowanie całości** — luźne części trzeba pogrupować w pełne zestawy; odpowiedzią jest jednocześnie ułamek niewłaściwy i odpowiadająca mu liczba mieszana.
8. **Sprawiedliwy rozdział** — uczeń rozdziela kilka jednakowych całości między grupę i wybiera opis porcji jednej osoby; warianty obejmują wynik mniejszy od `1`, mieszany i naturalny.
9. **Domknij do całości** — w sumie kilku ułamków uczeń najpierw łączy te, które tworzą `1`, a potem podaje wynik. Ćwiczy to elastyczność zamiast mechanicznego liczenia od lewej.
10. **Pożycz jedną całość** — animowany/paskowy model pokazuje zamianę `1` na `mianownik/mianownik` przed odejmowaniem; uczeń wybiera poprawny zapis pośredni.
11. **Pogotowie rachunkowe** — fikcyjny uczeń dodaje mianowniki, skraca tylko licznik albo źle pożycza całość. Gracz wskazuje błąd i wybiera krótkie poprawne wyjaśnienie.
12. **Trzy karty, jedna liczba** — trzeba dobrać model, ułamek i liczbę mieszaną/iloraz przedstawiające tę samą wartość.
13. **Kod ułamkowy** — poprawne uporządkowanie 5–6 kart odsłania litery hasła. Generator musi najpierw zapewnić różne wartości, aby odpowiedź była jednoznaczna.
14. **Która wskazówka wystarczy?** — dla nieznanego ułamka podano kilka wskazówek, np. „większy od `1/2`”, „mianownik 8”, „równy `3/4`”; uczeń wybiera informację rozstrzygającą lub sam ułamek.

## Typowe błędy, które powinny kształtować podpowiedzi

- Traktowanie dowolnych, także nierównych kawałków jako części ułamkowych.
- Zamiana ról licznika i mianownika.
- Liczenie kresek osi zamiast równych odcinków między kreskami.
- Założenie, że większy mianownik zawsze oznacza większy ułamek.
- Rozszerzanie lub skracanie tylko licznika albo tylko mianownika.
- Skracanie przez odejmowanie zamiast dzielenia przez wspólny czynnik.
- Uznawanie każdego ułamka niewłaściwego za „niepoprawny” zamiast za poprawny zapis liczby co najmniej równej `1`.
- Przy zamianie liczby mieszanej: pomijanie części całkowitej albo dodawanie jej bez pomnożenia przez mianownik.
- Dodawanie lub odejmowanie mianowników przy działaniach o wspólnym mianowniku.
- Przy odejmowaniu z pożyczką: zmiana części całkowitej bez dodania `mianownik/mianownik` do części ułamkowej.
- W zadaniach tekstowych: mylenie części zużytej z częścią pozostałą.

Podpowiedź ma wskazywać następny krok, np. „Podziel każdą całość na 7 części i zamień jedną całość na `7/7`”, a nie jedynie powtarzać polecenie. Wyjaśnienie ma pokazać regułę na konkretnych liczbach z pytania.

## Wizualizacje i kontrakty danych

Do współdzielonego silnika dodano dwa dostępne typy wizualne przeznaczone dla ułamków. Dzięki temu generatory używają jawnych danych matematycznych zamiast osobnych, dekoracyjnych rysunków.

### `fraction-model`

Kontrakt jawnych danych:

```js
{
  type: "fraction-model",
  shape: "circle",        // circle | bar | grid | collection
  numerator: 7,
  denominator: 4,
  groups: 2,              // liczba pokazywanych całości, wyliczalna tylko pomocniczo
  rows: 2,                // wymagane dla grid
  columns: 4,             // wymagane dla grid
  mode: "shaded",        // shaded | removed | compare
  caption: "Zaznaczono siedem ćwiartek."
}
```

- Renderer ma dzielić figury matematycznie, nie na podstawie tekstu pytania.
- Ułamki niewłaściwe pokazuje się jako kilka identycznych całości o tym samym podziale.
- Kolor nie może być jedyną informacją: zaznaczone części powinny różnić się także wzorem/obrysem, a SVG otrzymać pełny `aria-label`.
- Dla `collection` liczba obiektów oraz liczba wyróżnionych obiektów muszą być jawne; nie należy wyciągać ich z emoji ani opisu.

### `fraction-numberline`

Kontrakt jawnych danych:

```js
{
  type: "fraction-numberline",
  denominator: 4,
  minNumerator: 0,
  maxNumerator: 12,
  markedNumerators: [7],
  labelEveryWhole: true,
  unknownLabel: "A",
  caption: "Każda jednostka jest podzielona na cztery równe części."
}
```

- Pozycje mają być liczone w całkowitych krokach mianownika. Pozwoli to uniknąć błędów zmiennoprzecinkowych i porównań `value === marked` obecnych w ogólnej osi.
- Ten sam renderer powinien umieć pokazać ułamek właściwy, niewłaściwy i liczbę mieszaną oraz opcjonalnie etykietę literową zamiast wartości.
- Zakres wizualny na telefonie należy ograniczyć do około 13–17 kresek; dłuższe osie trzeba skalować lub wybierać rzadsze etykiety, bez poziomego przepełnienia.

Do zwykłych działań wystarczy istniejący typ `equation`, o ile zapis ułamków pozostaje czytelny i dostępny. Nie ma potrzeby dodawania canvasa, przeciągania wymagającego precyzji ani kopiowania zdjęć jedzenia z materiału źródłowego.

## Decyzje dotyczące odpowiedzi

- Dodano kontroler `fraction`, który toleruje spacje i uznaje ułamki równoważne, gdy zadanie pyta o **wartość**.
- Dodano kontroler `exactFraction` dla poleceń wymagających konkretnej postaci, np. wskazanego mianownika albo zapisu nieskracalnego.
- Dodano kontroler `mixed`, który przyjmuje czytelne warianty `2 1/3` oraz `2 1 / 3`, lecz nie odpowiedź dziesiętną. Pole odpowiedzi pokazuje przykład oczekiwanego formatu.
- W pytaniach `<`, `>` i `=` zastosowano dostępny wybór przyciskami zamiast pola tekstowego.
- Pytania mają jedną jednoznaczną odpowiedź. Wybór wielu kart zastąpiono formatami pojedynczego wyboru, aby zachować pełną obsługę klawiatury w istniejącym silniku.

## Zakres scalony lub świadomie pominięty

- Ułamki opisujące figury, zbiory i część wielkości są połączone w `czesci-calosci`, bo ćwiczą ten sam model licznika i mianownika.
- Zamiany jednostek pozostają elementem `liczby-mieszane`; osobna stacja przeliczeń odciągałaby uwagę od celu rozdziału.
- Porównywanie przez rozszerzanie jest ćwiczone zarówno w `porownywanie`, jak i w późniejszej części `rozszerzanie-skracanie`: pierwsza stacja pyta o relację, druga o metodę i równoważność.
- Zamiana ułamków niewłaściwych jest nauczana najpierw obrazowo w `ulamki-niewlasciwe`, a następnie uzasadniana dzieleniem z resztą w `ulamek-jako-iloraz`.
- Dodawanie i odejmowanie pozostają osobnymi stacjami, ponieważ odejmowanie z zamianą jednej całości jest istotnym, odrębnym progiem trudności.
- Logiczna macierz kolorowych figur z ostatniej strony nie wchodzi do podstawowego generatora: jest atrakcyjną łamigłówką ogólną, ale nie sprawdza treści rozdziału. Można później użyć podobnego, całkowicie autorskiego wzorca jako bonusu niezależnego od postępu.
- Zadania wymagające fizycznego cięcia, składania papieru lub odmierzania płynu zostaną zastąpione jednoznacznymi modelami ekranowymi. Gra nie powinna udawać realnego pomiaru.
- Złożone zadanie o nakładających się zbiorach zwierząt ze strony powtórzeniowej pominięto jako wymagające zasady włączeń i wyłączeń, której rozdział nie objaśnia.

## Zabezpieczenia generatorów

- Kontrolery odpowiedzi rozróżniają równoważność wartości od wymogu konkretnej postaci.
- Pytania porównawcze generują różne wartości, więc nie powstają nieprzewidziane remisy.
- Wizualizacje kołowe używają czytelnych mianowników; większe podziały są przedstawiane paskiem lub siatką.
- Odejmowanie z zamianą jednej całości zawsze ma dodatnią część całkowitą odjemnej i nieujemny wynik.
- Dodawanie i odejmowanie zachowuje wspólny mianownik. Testy obejmują wyniki właściwe, niewłaściwe i mieszane.
- Ułamki na osi są serializowane jako całkowite liczby kroków i mianownik, bez zależności od niedokładnych liczb zmiennoprzecinkowych.
- Wszystkie konteksty, pytania i grafiki są autorskie. Pliki źródłowych stron nie są częścią aplikacji ani pamięci podręcznej offline.

## Zakres wykonanej implementacji

1. Utworzono semantyczny, responsywny interfejs `Chapter5/index.html` zgodny ze współdzielonym silnikiem i obsługą zapisanych rund.
2. Utworzono `Chapter5/game.js` z dziesięcioma stacjami, trasą `mix`, trzema sposobami sprawdzania zapisu ułamka oraz dokładnie dziesięcioma pytaniami w każdej rundzie.
3. Do `shared/game-engine.js` i `shared/game.css` dodano renderery `fraction-model` i `fraction-numberline`; ich kontrakty dopisano do `CHAPTER_TEMPLATE.md`.
4. Dodano testy generatorów, niezmienników matematycznych, serializacji, publikacji i bezpośrednich tras offline.
5. Opublikowano rozdział na stronie głównej, ustawiono go jako bieżącą przygodę i dodano jego zasoby do service workera. Wersję cache zwiększono raz, z `v11` do `v12`.
6. W `AI_DEVELOPMENT_GUIDE.md` oznaczono rozdział 5 jako opublikowany.

## Wyniki weryfikacji

- `node --check` przechodzi dla `Chapter5/game.js`, współdzielonego silnika i service workera.
- Testy rozdziału 5: **10/10 zaliczonych**, w tym wielokrotne losowanie wszystkich generatorów, kontrolery zapisu, niezmienniki działań, miks stacji i zapis JSON.
- Zbiorczy test opublikowanych rozdziałów: **36/37 zaliczonych**. Jedyny błąd pochodzi z istniejącego losowego testu `Chapter1/tests/round-visuals.test.cjs`, który zakłada konkretny wariant pierwszego pytania (`8 · 8`) mimo losowego generatora. Nie jest związany ze zmianami rozdziału 5 ani współdzielonym rendererem ułamków.
- Ręczny test przeglądarkowy przeszedł dla prawdziwej szerokości 320 px: brak poziomego przepełnienia, właściwa kolejność pytania i pomocy, obsługa błędnej i poprawnej odpowiedzi z klawiatury, podpowiedź z przeniesieniem fokusu, przejście 10 pytań, ekran wyniku `9/10`, ponowna gra oraz wznowienie i restart zapisanej rundy.
- Sprawdzono bezpośrednie uruchomienie z `file:` oraz bezpośrednią trasę offline obsługiwaną przez service workera. Rozdział działa bez połączenia po wcześniejszym otwarciu online.
- Sprawdzono brak odwołań do skanów w `index.html`, `game.js` i `service-worker.js`, brak wbudowanych handlerów zdarzeń i brak niekontrolowanego użycia `innerHTML` w kodzie rozdziału.
