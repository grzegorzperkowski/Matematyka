# Rozdział 4 — analiza programu i dziennik wdrożenia

## Status

- Etap: implementacja i integracja zakończone; testy automatyczne zakończone; testy ręczne oczekują na dostępną przeglądarkę.
- Tytuł rozdziału ustalony ze strony otwierającej: **Figury geometryczne**.
- Źródło: 39 plików `page_0119.png`–`page_0157.png`, obejrzanych w całości 2026-09-16.
- Obrazy są wyłącznie materiałem programowym. Nie będą publikowane, buforowane ani kopiowane do gry.
- Przed analizą przeczytano w całości wymagane przewodniki, silnik, wspólne style, rozdziały 2–3, stronę główną i service workera.
- Stan początkowy repozytorium obejmował niezależne zmiany dokumentacji oraz nieśledzone skrypty pobierania. Skrypty zachowano; dokumentację uporządkowano później jako osobne zadanie.

## Mapa stron źródłowych

Numery plików są o jeden lub dwa większe od drukowanych numerów stron, ponieważ zestaw zawiera stronę tytułową.

| Pliki | Strony drukowane | Zawartość i postęp trudności |
| --- | --- | --- |
| `page_0119.png` | otwarcie działu | Tytuł „Figury geometryczne”; intuicyjne rozróżnianie punktów, linii krzywych, prostych, łuków i trójkątów. |
| `page_0120.png`–`page_0121.png` | 118–119 | Punkt i oznaczenia wielkimi literami; odcinek i jego dwa końce; prosta jako nieograniczona w obu kierunkach; półprosta z początkiem i bez końca; oznaczenia literowe i znaczenie kolejności liter dla półprostej; jedna prosta przez dwa punkty, wiele prostych przez jeden punkt. |
| `page_0122.png`–`page_0123.png` | 120–121 | Łamana otwarta i zamknięta, liczba składowych odcinków; należenie punktu do odcinka/prostej/półprostej; rozpoznawanie łamanej; zdania prawda/fałsz o podstawowych figurach liniowych. |
| `page_0124.png`–`page_0126.png` | 122–124 | Proste prostopadłe i równoległe, symbole `⊥` i `∥`, rozpoznawanie na planie ulic; konstrukcja ekierką i linijką; ważne rozróżnienie: proste, które na małym rysunku się nie przecinają, nie muszą być równoległe po przedłużeniu. |
| `page_0127.png`–`page_0128.png` | 125–126 | Prostopadłość i równoległość odcinków definiowana przez proste, na których leżą; odcinki równoległe mogą leżeć na tej samej prostej; wnioskowanie o relacjach i wyszukiwanie par. |
| `page_0129.png`–`page_0131.png` | 127–129 | Pomiar długości; zapis długości odcinka `|AB|`; jednostki mm, cm, dm, m, km i zależności; jednostki umowne; rysowanie długości, wielokrotności i różnic; długość łamanej jako suma odcinków; zadania z krokami i szacowaniem. |
| `page_0132.png`–`page_0135.png` | 130–133 | Kąt, ramiona i wierzchołek; porównywanie kątów; rodzaje: ostry, prosty, rozwarty, półpełny, pełny, wklęsły; dwa kąty tworzone przez parę półprostych; rozpoznawanie kątów w wielokątach i na zegarze. |
| `page_0136.png`–`page_0138.png` | 134–136 | Stopień i kąt jednostkowy; 90° i 180°; kątomierz oraz wybór właściwej skali; klasyfikacja kąta na podstawie miary; kąty dopełniające linię prostą, obroty i ruch wskazówki zegara (6° na minutę). |
| `page_0139.png`–`page_0140.png` | 137–138 | Wielokąt jako zamknięta łamana bez krzywych; boki, wierzchołki i kąty; nazwy od liczby boków; punkty wewnątrz/na zewnątrz; podział figur i liczenie figur złożonych. |
| `page_0141.png`–`page_0142.png` | 139–140 | Prostokąt: cztery kąty proste i przeciwległe boki równe/równoległe; kwadrat: dodatkowo wszystkie boki równe; kwadrat jako szczególny prostokąt; rozpoznawanie własności i figur złożonych. |
| `page_0143.png`–`page_0144.png` | 141–142 | Obwód jako suma długości boków; obwody dowolnych wielokątów, kwadratów `4a` i prostokątów `2a + 2b`; konieczność wspólnych jednostek; zadania odwrotne (bok z obwodu), zastosowania praktyczne. |
| `page_0145.png`–`page_0147.png` | 143–145 | Okrąg jako linia i koło jako okrąg z wnętrzem; środek nie należy do okręgu; promień, cięciwa i średnica; średnica równa dwóm promieniom; punkty wewnątrz/na zewnątrz/na okręgu; użycie cyrkla. |
| `page_0148.png`–`page_0152.png` | 146–150 | Skala `1:1`, pomniejszenie `1:n`, powiększenie `n:1`; obliczanie wymiaru rzeczywistego i rysunkowego; dobór skali i porównywanie obiektów pokazanych w różnych skalach; duże współczynniki i zamiana jednostek. |
| `page_0153.png`–`page_0156.png` | 151–154 | Skala planu i mapy; znaczenie 1 cm i 1 mm na planie; skale od `1:50` do milionowych; rzeczywiste odległości, podziałka liniowa, rozpoznawanie bardziej szczegółowej mapy i wyznaczanie skali z pary długości. |
| `page_0157.png` | 155, powtórzenie | Sprawdzian łączący relacje odcinków, wielokąty, skalę, klasyfikację i pomiar kątów, średnicę/promień, obwód prostokąta wokół kół oraz odległość na mapie. |

## Stacje i stabilne identyfikatory tras

Każda trasa ma zwracać dokładnie 10 autorskich pytań. Identyfikatorów po publikacji nie wolno zmieniać.

| ID trasy | Nazwa stacji | Zakres | Planowane pytania, limity i pomoce |
| --- | --- | --- | --- |
| `linie` | Laboratorium linii | punkt, odcinek, prosta, półprosta, łamana otwarta/zamknięta | Wybór poprawnej nazwy/opisu, liczba odcinków łamanej (2–8), własności końców i kierunków; proste symbole liniowe i podpisy, bez kopiowania rysunków źródłowych. |
| `polozenie` | Skrzyżowania | prostopadłość i równoległość prostych/odcinków | Klasyfikacja par na podstawie jawnego kąta lub kierunków; wnioskowanie `a ⊥ b`, `b ⊥ c` ⇒ `a ∥ c`; wybory „równoległe / prostopadłe / żadne”. Pomoc: nowy ścisły diagram relacji prostych. |
| `dlugosci` | Patrol miarki | jednostki długości, pomiar i długość łamanej | Całkowite przeliczenia mm–cm–dm–m–km, wartości zwykle 2–90; suma 3–6 odcinków we wspólnej jednostce; różnica i wielokrotność długości. Bez niejednoznacznych pomiarów ekranowych. |
| `katy` | Detektyw kątów | elementy i rodzaje kątów | Klasyfikacja według jawnej miary: ostry 10–80°, prosty 90°, rozwarty 100–170°, półpełny 180°, wklęsły 190–350°, pełny 360°; nazwy ramion/wierzchołka. Pomoc: diagram kąta rysowany z danych liczbowych. |
| `mierzenie-katow` | Pracownia stopni | stopnie, kątomierz, obroty i kąty przyległe | Brakujący kąt do 90° lub 180°, obroty 90/180/270/360°, wskazówka minutowa 6° na minutę; wyłącznie wyniki całkowite. |
| `wielokaty` | Aleja wielokątów | rozpoznawanie i nazwy wielokątów, boki/wierzchołki | Trójkąt–ośmiokąt (3–8 boków), równość liczby boków/kątów/wierzchołków, rozpoznanie warunków wielokąta; diagramy regularne lub lekko nieregularne generowane z jawnej liczby boków. |
| `prostokaty` | Plac czworokątów | własności prostokąta i kwadratu | Prawda/fałsz i wybór figury na podstawie kątów/boków; kwadrat jako prostokąt; przeciwległe boki równoległe i równe. Diagramy z jawnym typem i wymiarami. |
| `obwody` | Ogrodzenie figur | obwód wielokąta, prostokąta i kwadratu, zadania odwrotne | Boki 2–40 cm/m; obwody do ok. 300; brak mieszanych jednostek bez jawnej konwersji; brak pól figur. Diagram z listą długości boków. |
| `kola` | Rondo odkrywców | okrąg/koło, środek, promień, średnica, cięciwa | `d = 2r`, `r = d/2` z parzystymi średnicami 4–40; wybór nazwy elementu i położenia punktu; ścisły diagram koła z wyróżnionym elementem. Bez obwodu/pola koła, których źródło nie uczy. |
| `skala` | Biuro planów | skala rysunków, planów i map | Skale `1:2`–`1:100000`, powiększenia `2:1`–`10:1`; wymiar rysunku/rzeczywisty i proste odległości mapowe; dane dobrane tak, by wynik był całkowity, z jednostkami podanymi w pytaniu. Wizualna proporcja lub równanie skali. |
| `mix` | Geometryczny obchód | przekrój całego rozdziału | Po jednym pytaniu z każdej z 10 tras, losowa kolejność. |

## Zakres scalony lub świadomie pominięty

- Konstrukcje linijką, ekierką, kątomierzem i cyrklem są scalone z odpowiadającymi im stacjami jako podpowiedzi/metoda, ale gra nie udaje precyzyjnego rysowania myszą. Pozwala to zachować poprawność na ekranach dotykowych i przy 320 px.
- Fizyczne mierzenie wydrukowanych obiektów i szacowanie jednostkami umownymi pominięto: rozmiar CSS/ekranu nie jest wiarygodną miarą.
- Złożone łamigłówki z liczeniem wszystkich nakładających się figur pominięto, ponieważ wymagają bardzo bogatych, statycznych diagramów i łatwo stają się niejednoznaczne.
- Kąty wklęsłe i pełne pozostają w klasyfikacji, ale nie będą dominować. Nie wprowadzamy minut/sekund kątowych.
- Skala obiektów i skala map/planu zostały połączone w jedną stację `skala`, bo korzystają z tej samej proporcji; pytania przechodzą od prostych pomniejszeń do odległości mapowych.
- Pole figur, obwód/średnica okręgu i liczba π są celowo pominięte — należą do późniejszego materiału, a źródło ich tu nie naucza.

## Decyzje techniczne i wizualne

- Vanilla HTML/CSS/JS, bez zależności i sieci; silnik `MathTownGame` zachowuje punktację, zapisy rund, ekrany i obsługę odpowiedzi.
- Rozdział użyje wspólnych identyfikatorów kontrolek wzorowanych na rozdziałach 2–3 oraz lokalnego, CSS-owego „warsztatu geometrii” w hero.
- Geometria wymaga ścisłych diagramów dydaktycznych. Planowany jest jeden nowy, ogólny typ wizualny `geometry`, renderowany przez wspólny silnik z bezpiecznych danych (`shape`, miary, relacje i długości), bez wstawiania generowanego HTML. Wspólny styl i kontrakt zostaną udokumentowane w `CHAPTER_TEMPLATE.md`; starsze zapisane rundy bez tego typu pozostaną bez zmian.
- Tekst dynamiczny nadal wyłącznie przez `textContent`; sterowanie natywne; widoczny fokus; input zatwierdzany Enterem; pytanie przed panelem pomocy na wąskim ekranie; toast ukryty także przez `visibility` i `opacity`.
- Tytuł przekazywany do silnika: `Figury geometryczne`; `chapterId`: `chapter4`.

## Dziennik kamieni milowych

### 2026-09-16 — inspekcja obowiązkowa

- [x] Sprawdzono stan gita i zapisano istniejące zmiany użytkownika.
- [x] Przeczytano wszystkie 10 wymaganych plików w całości.
- [x] Obejrzano wszystkie 39 PNG w kolejności i opracowano powyższą mapę programu.
- [x] Ustalono 10 stacji tematycznych, trasę `mix`, limity oraz zakres pominięty.
- [x] Zaimplementować `Chapter4/index.html`, `Chapter4/game.js` i testy.
- [x] Dodać i udokumentować uzasadniony renderer `geometry`.
- [x] Zintegrować stronę główną i service workera; zwiększyć cache dokładnie raz.
- [x] Uruchomić wymagane testy i kontrole składni.
- [ ] Wykonać testy przeglądarkowe `file:`, HTTP, 320 px, klawiatury, zapisu i offline — brak dostępnej powierzchni przeglądarki w bieżącej sesji.

### 2026-09-16 — implementacja gry

- Utworzono semantyczny, responsywny `Chapter4/index.html` z CSS-owym hero oraz 10 kartami stacji i kartą `mix`.
- Utworzono `Chapter4/game.js`. Każda trasa buduje dokładnie 10 pytań, a `mix` pobiera dokładnie po jednym pytaniu z każdej stacji.
- Pytania obejmują wybór i wpisy liczbowe, mają polskie etykiety, konkretne podpowiedzi, krótkie wyjaśnienia i wyłącznie jawne dane diagramów.
- Dodano jeden uzasadniony typ wizualny `geometry` do `shared/game-engine.js`. Bezpiecznie tworzy elementy SVG przez DOM (`createElementNS` i `textContent`), nie używa `innerHTML`, ma etykiety dostępności i obsługuje: punkt, linię, łamaną, relacje prostych, kąt, wielokąt, prostokąt, obwód i koło.
- Renderer toleruje starsze nazwy pól (`shape`/`subtype`/`kind`, `degrees`/`angle`, `relation`/`lineRelation`, `sides`/`lengths`) i ukrywa nieznany kształt zamiast przerywać przywróconą rundę.
- W `shared/game.css` dodano wspólne, skalowalne style diagramów; w `CHAPTER_TEMPLATE.md` opisano kontrakt danych typu `geometry`, zachowując wcześniejszą niezwiązaną zmianę dotyczącą diagramu dzielenia.
- Dla trójkątów i dowolnych wielokątów obwodowych generatory wymuszają nierówność wielokąta; średnice są parzyste; wszystkie przeliczenia skali i jednostek dają wyniki całkowite.

### 2026-09-16 — publikacja i kontrole

- Karta rozdziału 4 na stronie głównej jest semantycznym linkiem; usunięto stan „wkrótce”, zmieniono opis i hero prowadzi do najnowszego ukończonego rozdziału. Nadal istnieje dokładnie 8 kart najwyższego poziomu.
- `service-worker.js` publikuje `Chapter4/index.html` i `Chapter4/game.js`; nie publikuje 39 referencyjnych PNG. `CACHE_NAME` zwiększono dokładnie raz: `v10` → `v11`.
- `node --test Chapter4/tests/*.test.cjs`: 9/9 testów zaliczonych. Obejmują kompletność tras, kontrakt pytań i wizualizacji, przeliczenia długości, granice kątów, nierówności wielokątów, obwody, zależności koła, skale, `mix`, serializację rundy i offline direct URL.
- `node --test Chapter2/tests/*.test.cjs`: 2/2 zaliczone.
- `node --test Chapter3/tests/*.test.cjs`: 2/2 zaliczone (kontrola dodatkowa).
- `node --check Chapter4/game.js`, `node --check shared/game-engine.js`, `node --check service-worker.js` oraz `git diff --check`: zaliczone.
- `node --test Chapter1/tests/*.test.cjs`: 12/13 zaliczonych; jedna niezwiązana, wcześniejsza awaria powtórzyła się w czterech uruchomieniach. `Chapter1/tests/round-visuals.test.cjs:17` zakłada, że losowa runda zawsze zawiera pytanie z tekstem `8 · 8`, po czym odczytuje `.visual` z `undefined`. Rozdziału 1 nie zmieniano, zgodnie z poleceniem.
- Statyczna kontrola: kolejność zasobów to `../shared/game.css`, `../shared/game-engine.js`, `game.js`; brak `onclick`, `innerHTML`, zdalnych zależności oraz odniesień aplikacji do stron źródłowych.

## Pozostałe testy ręczne

Interfejs Computer Use zwrócił pustą listę przeglądarek i aplikacji; próby utworzenia kart `iab` oraz Chrome zakończyły się komunikatem „Browser is not available”. Nie wykonano i nie należy uważać za zaliczone poniższych testów:

1. Otworzenie `Chapter4/index.html` przez `file:` i lokalny HTTP.
2. Bezpośredni adres `?exercise=<id>` w przeglądarce.
3. Poprawna/błędna odpowiedź, podpowiedź, wyjaśnienie, następne pytanie, wynik i restart w realnym DOM.
4. Zapis i wznowienie niedokończonej rundy przez `localStorage`.
5. Nawigacja wyłącznie klawiaturą, Enter w polu, widoczny fokus oraz odsłuch komunikatów czytnikiem ekranu.
6. Oględziny wizualne w szerokości 320 px i desktopowej, w tym brak przewijania poziomego i kolejność pytanie → panel pomocy.
7. Bezpośredni adres ćwiczenia offline po wcześniejszym zapełnieniu cache w prawdziwej przeglądarce. Zachowanie fallbacku service workera jest pokryte testem Node.

### 2026-09-16 — poprawa czytelności długości łamanej

- Na podstawie zrzutu ekranu z trasy `dlugosci` poprawiono etykiety długości odcinków.
- Wartości są teraz wyśrodkowane względem swoich odcinków, odsunięte od linii w kierunku prostopadłym i układane naprzemiennie po obu stronach łamanej, dzięki czemu nie zbiegają się przy wierzchołkach.
- Zastosowano większą, grubszą fioletową czcionkę z jasną obwódką; liczby pozostają czytelne również wtedy, gdy etykieta znajdzie się blisko ciemnej linii.
