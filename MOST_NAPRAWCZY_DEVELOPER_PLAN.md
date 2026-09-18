# Most naprawczy — plan dla AI deweloperskiego

## Cel i decyzja produktowa

„Most naprawczy” to pojedyncza, dobrowolna okazja w rundzie 10 pytań, by po pierwszej błędnej odpowiedzi przejść przez podpowiedź i wyjaśnienie, a następnie ponownie rozwiązać dokładnie ten sam przykład. Ma wspierać poprawianie rozumowania, nie ratować wyniku ani ukrywać pomyłkę.

Zlecony próg dostępności to 85% nowych rund. Jest to odstępstwo od wcześniejszej zasady, że mechanika oparta na przypadku powinna być rzadka; dlatego losowanie nie może zmieniać punktów, liczby poprawnych, serii, gwiazdek, rekordu ani dostępu do podstawowej podpowiedzi i wyjaśnienia. W 15% rund bez Mostu dziecko po błędzie otrzymuje tę samą pełną, wspierającą informację zwrotną i może kontynuować naukę — nie wolno nazywać tego karą ani „przegraną szansą”.

## Granice rozwiązania

- Dotyczy wyłącznie wspólnego przebiegu rundy; wszystkie opublikowane rozdziały zachowują wspólne zachowanie.
- Maksymalnie jeden Most naprawczy na rundę, niezależnie od liczby błędów.
- Jest dostępny tylko po błędnej pierwszej odpowiedzi i tylko dla aktualnego, tego samego pytania.
- Najpierw zawsze pokazuje podpowiedź i istniejące wyjaśnienie; dopiero potem pozwala na ponowną odpowiedź.
- Naprawiona odpowiedź jest zapisana jako „naprawiona z pomocą”, ale pierwsza odpowiedź pozostaje błędem dla wyniku, serii, liczby poprawnych, gwiazdek i rekordów.
- Nie wolno pomijać pytania, zmieniać generatorów, dodawać nowej waluty, konta, historii wyników ani zewnętrznych zasobów.
- Standardowa podpowiedź ma pozostać dostępna na dotychczasowych zasadach niezależnie od Mostu.

## Reguły dostępności i losowości

### Losowanie

1. Przy rozpoczęciu nowej rundy wykonaj dokładnie jedno losowanie: 85% rund dostaje Most, 15% nie.
2. Wynik losowania musi zostać zapisany razem z rozpoczętą rundą. Wznowienie, odświeżenie widoku oraz ponowne renderowanie pytania nigdy nie losują ponownie.
3. Dla równego doświadczenia losowanie nie zależy od rozdziału, trasy, wyniku, serii, użycia podpowiedzi ani treści pytania.
4. W rundzie z Mostem pomoc pozostaje niewykorzystana, dopóki dziecko nie wybierze naprawy; wybór „Zachowaj na później” nie zużywa jej.

### Jasność dla dziecka

Na początku rundy z Mostem pokaż krótki komunikat: „W tej wyprawie masz jeden Most naprawczy. Jeśli utkniesz, pomoże Ci poprawić jeden przykład po podpowiedzi.” Nie przedstawiaj go jako losu, nagrody ani przedmiotu do zbierania.

Na początku rundy bez Mostu nie pokazuj informacji o braku funkcji. Po błędzie zachowaj zwykłą, pełną informację zwrotną: poprawną odpowiedź, podpowiedź lub wyjaśnienie i bezpieczne przejście dalej. Dzięki temu dziecko nie odczuwa, że matematycznie otrzymało gorszą rundę.

### Etyczne zabezpieczenia

- Losowość dotyczy wyłącznie dodatkowego doświadczenia powtórki; nie decyduje o tym, czy dziecko może poznać poprawny sposób ani ukończyć matematykę.
- Nie ma serii losowań, „prawie wygranych”, liczników szans, odliczania, płatności, wymian ani komunikatów zachęcających do ponownego uruchamiania rundy dla Mostu.
- Skromnym, przejrzystym uznaniem za skuteczną naprawę jest tekstowy znak „naprawione z pomocą” w podsumowaniu, a nie punkty ani przewaga w rekordzie.

## Przebieg dla dziecka

### 1. Start rundy

Jeśli runda ma Most, po uruchomieniu pokaż krótki, nieblokujący komunikat statusowy. Nie wymaga on kliknięcia i nie przerywa koncentracji na pierwszym zadaniu.

### 2. Pierwsza błędna odpowiedź, gdy Most jest dostępny

Najpierw zachowaj obecne bezpieczne oznaczenie błędnej odpowiedzi. W panelu informacji zwrotnej zamiast zwykłego przycisku przejścia pokaż blok Mostu:

- Tytuł: „Zatrzymaj się na Moście naprawczym”.
- Tekst: „Ta pierwsza odpowiedź nie jest poprawna. Zobacz podpowiedź i sposób rozwiązania, a potem możesz poprawić ten sam przykład. Wynik rundy zachowa pierwszą odpowiedź.”
- Przycisk główny: „Zobacz pomoc i spróbuj ponownie”.
- Przycisk drugorzędny: „Zachowaj Most na później”.

Nie pokazuj jeszcze poprawnej odpowiedzi w tym wariancie: dziecko ma najpierw skorzystać z podpowiedzi i wyjaśnienia, a nie jedynie przepisać wynik. Jeśli wybierze zachowanie Mostu, pokaż normalne wyjaśnienie, prawidłową odpowiedź i przycisk „Następne wyzwanie”; Most pozostaje dostępny dla kolejnego błędu.

### 3. Etap pomocy

Po wyborze głównego przycisku otwórz podpowiedź i wyjaśnienie tego pytania w czytelnej kolejności. Nad nimi pokaż stały komunikat: „Przeczytaj sposób, a potem popraw swoją odpowiedź.”

Po przeczytaniu pomocy aktywuj formularz dla tego samego pytania i wyróżnij go etykietą „Spróbuj poprawić odpowiedź”. W polu tekstowym pozostaw poprzednią odpowiedź zaznaczoną do łatwego zastąpienia; przy odpowiedziach wyboru zachowaj dokładnie tę samą kolejność opcji co przy pierwszej próbie. Przycisk ma brzmieć „Sprawdź poprawkę”.

### 4. Wynik poprawki

Jeśli poprawka jest poprawna:

- pokaż tytuł „Dobrze naprawione!”;
- pokaż tekst: „Pierwsza odpowiedź pozostaje błędem w wyniku rundy, ale poprawnie użyłeś/aś wskazówki. Wiesz już, jak zrobić taki przykład.”;
- pokaż oznaczenie „Naprawione z pomocą” i standardowy przycisk do następnego pytania.

Jeśli poprawka nadal jest błędna:

- pokaż tytuł „Sprawdźmy to krok po kroku.”;
- pokaż prawidłową odpowiedź oraz istniejące wyjaśnienie;
- zakończ Most i pokaż standardowy przycisk do następnego pytania.

W obu przypadkach Most zostaje wykorzystany. Nie oferuj drugiej poprawki w tej rundzie.

### 5. Finał rundy

Jeśli naprawa została poprawnie wykonana, pod istniejącymi szczegółami wyniku pokaż: „1 przykład naprawiony z pomocą”. Nie zmieniaj liczby „poprawnych”, punktów, gwiazdek, najlepszej serii ani rekordu punktowego.

Jeśli Most nie został użyty lub poprawka nie była udana, nie pokazuj licznika „0” ani komentarza o niewykorzystanej okazji.

## Stany rundy do zachowania po odświeżeniu

Rozszerz zapis rozpoczętej rundy o opcjonalny, defensywnie walidowany stan Mostu. Brak tego pola w starym zapisie ma oznaczać bezpieczny stan domyślny, nie uszkodzoną rundę.

Minimalne informacje do przechowania:

| Informacja | Po co jest potrzebna |
| --- | --- |
| Czy ta runda dostała Most | Nie losować ponownie po wznowieniu. |
| Czy Most pozostaje dostępny | Utrzymać limit jednej okazji. |
| Etap bieżącego pytania: brak / oferta / pomoc / poprawka / zakończony | Odtworzyć dokładny bezpieczny widok po odświeżeniu. |
| Numer pytania objętego Mostem | Nie dopuścić do przeniesienia poprawki na inne pytanie. |
| Pierwsza odpowiedź | Zachować uczciwy wynik i pokazać właściwy kontekst. |
| Czy naprawa była poprawna | Pokazać właściwe podsumowanie na finale. |
| Wariant animacji | Nie losować innej animacji po wznowieniu. |
| Kolejność opcji dla pytania wyboru podczas poprawki | Nie przestawiać odpowiedzi między pierwszą próbą a naprawą. |

Zapis po każdym przejściu stanu jest obowiązkowy: po pierwszym błędzie, po wyborze „zachowaj”, po rozpoczęciu pomocy, po wysłaniu poprawki i po jej rozstrzygnięciu. Ukończenie lub ręczne rozpoczęcie rundy od nowa czyści ten stan razem z bieżącą rundą.

## Punktacja i raportowanie

| Zdarzenie | Punkty | Poprawne | Seria | Ekran końcowy |
| --- | ---: | ---: | ---: | --- |
| Pierwsza odpowiedź poprawna | Obecne zasady | +1 | Rośnie | Bez zmian |
| Pierwsza odpowiedź błędna | 0 | Bez zmian | Reset | Bez zmian |
| Poprawka poprawna | 0 | Bez zmian | Nie odradza serii | „1 przykład naprawiony z pomocą” |
| Poprawka błędna | 0 | Bez zmian | Bez zmian | Bez dodatkowego wpisu |

Ta tabela jest celowa: Most nagradza wysiłek komunikatem i możliwością przećwiczenia, lecz nie zmienia miary opanowania materiału. Dzięki temu dziecko nie jest motywowane do czekania na przypadkową korzyść punktową.

## Animacje — trzy wylosowane, z góry zdefiniowane warianty

Wybierz jeden z trzech wariantów wyłącznie wtedy, gdy dziecko wybierze „Zobacz pomoc i spróbuj ponownie”. Jest to dekoracja, nie osobna nagroda; nie zawiera losowania widocznego dla dziecka i nie wpływa na wynik. Wariant należy zapisać razem ze stanem Mostu.

1. **Składany most** — trzy małe, zaokrąglone segmenty w kolorach projektu wsuwają się kolejno z lewej do prawej i łączą przy panelu pomocy.
2. **Latarnia sposobu** — nad nagłówkiem pomocy pojawia się łagodny promień w ciepłym żółtym kolorze, po czym zostaje jako statyczny znacznik.
3. **Stempel naprawy** — niewielka obręcz z napisem „SPRÓBUJ” obraca się najwyżej o kilka stopni i miękko osiada obok tytułu.

Wspólne wymagania animacji:

- Czas maksymalnie 450 ms, bez migania, błysków, konfetti, odliczania ani dźwięku.
- Ruch ma być dyskretny i korzystać z aktualnej ciepłej palety, zaokrągleń oraz prostych obrysów; nie używać nowych emoji jako głównego nośnika znaczenia.
- Tekst i przyciski są dostępne od razu; ruch niczego nie ukrywa i nie opóźnia czytania.
- Przy `prefers-reduced-motion: reduce` pokaż natychmiast statyczny wariant z tą samą etykietą.
- Znaczenie nie może wynikać z koloru lub ruchu: zawsze musi istnieć nagłówek i tekstowa informacja o etapie.

## Dostępność i zachowanie na małym ekranie

- Użyj istniejącego panelu informacji zwrotnej jako miejsca dla Mostu, zamiast dodawać wyskakujące okno zasłaniające zadanie.
- Gdy pojawia się oferta, uprzejmie ogłoś jej tytuł w aktualnym regionie statusu, a fokus przenieś na przycisk główny tylko po zakończeniu komunikatu o błędzie.
- Po wejściu w etap pomocy fokus prowadź do nagłówka „Przeczytaj sposób…”, a potem do pola lub pierwszej odpowiedzi poprawki.
- Wszystkie przyciski zachowują obsługę Enterem, wyraźny fokus i wystarczająco duży obszar dotykowy.
- Przy szerokości 320 px przyciski układają się pionowo, a podpowiedź, wyjaśnienie i formularz pozostają w karcie pytania przed panelem bocznym.
- Nie blokuj przycisku „Wróć do wyboru trasy”; przy powrocie zapisz aktualny stan Mostu tak jak inne postępy.

## Zakres plików i odpowiedzialności

| Obszar | Odpowiedzialność |
| --- | --- |
| `shared/game-engine.js` | Stan Mostu, jednokrotne losowanie, przebieg pierwszego błędu i poprawki, zapis/wznowienie, punktacja bez zmian oraz komunikaty końcowe. |
| `shared/game.css` | Wspólny wygląd panelu Mostu, układ przycisków, trzy krótkie animacje i wariant ograniczonego ruchu. |
| `ChapterN/index.html` wszystkich opublikowanych rozdziałów | Tylko jeśli silnik potrzebuje spójnych, semantycznych punktów zaczepienia dla miejsca Mostu lub dodatkowego szczegółu wyniku. Zachowaj ich bieżącą strukturę i styl rozdziału. |
| Testy wspólnego silnika oraz istniejące testy rozdziałów | Kontrakt zapisu, limit użycia, brak wpływu na punktację i bezpieczne wznowienie. |

Nie zmieniaj generatorów pytań, identyfikatorów tras, `chapterId`, formatu klucza lokalnego zapisu ani zasad standardowej rundy 10 pytań.

## Kryteria akceptacji

1. W nowej rundzie losowanie Mostu dzieje się raz i jego wynik nie zmienia się po odświeżeniu lub wznowieniu.
2. W rundzie z Mostem pierwsza błędna odpowiedź daje wybór naprawy lub zachowania pomocy na później.
3. Naprawa zawsze pokazuje podpowiedź i wyjaśnienie przed ponowną odpowiedzią na identyczne pytanie.
4. Poprawna naprawa nie zwiększa punktów, liczby poprawnych, serii, gwiazdek ani rekordów; jest widoczna wyłącznie jako pomocnicze uznanie procesu.
5. W rundzie bez Mostu każda błędna odpowiedź nadal pokazuje pełne, wspierające wyjaśnienie i pozwala normalnie kontynuować.
6. Żadne pytanie nie jest pomijane, zastępowane ani losowo ułatwiane przez tę funkcję.
7. Po wznowieniu trwającej oferty, pomocy lub poprawki dziecko wraca do właściwego etapu i nie traci pierwszej odpowiedzi.
8. Opcje odpowiedzi wyboru nie zmieniają kolejności między pierwszą próbą i poprawką.
9. Każdy z trzech wariantów animacji jest jedynie dekoracją, działa bez migania i ma statyczny odpowiednik przy ograniczeniu ruchu.
10. Pełny przebieg jest dostępny klawiaturą, czytelny z technologiami asystującymi i mieści się przy 320 px.

## Weryfikacja przed wydaniem

- Sprawdź nowe rundy z dostępnością i bez dostępności Mostu przez kontrolowany scenariusz testowy; nie oceniaj 85% wyłącznie na przypadkowym pojedynczym uruchomieniu.
- Przejdź ręcznie oba rodzaje pytań: wpisywanie i wybór, w tym zachowanie Mostu na później, poprawkę poprawną i błędną oraz ostatnie pytanie rundy.
- Sprawdź odświeżenie na każdym etapie: oferta, pomoc, formularz poprawki i wynik poprawki.
- Uruchom testy wszystkich opublikowanych rozdziałów, kontrolę składni oraz kontrolę różnic.
- Sprawdź klawiaturę, widoczny fokus, komunikaty czytnika ekranu, widok 320 px i `prefers-reduced-motion: reduce`.
