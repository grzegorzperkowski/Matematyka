(function (global) {
  "use strict";

  global.MathTownCatalog = [
    {
      id: "chapter1",
      number: 1,
      title: "Liczby i działania",
      href: "Chapter1/index.html",
      tone: "numbers",
      icon: "+−",
      stations: [
        { id: "park", title: "Wesołe miasteczko" },
        { id: "plusminus", title: "Sprytne rachunki" },
        { id: "moreless", title: "O ile więcej?" },
        { id: "multdiv", title: "Mnożenie i dzielenie" },
        { id: "by10", title: "Przez 10, 100, ..." },
        { id: "timesmore", title: "Razy więcej, razy mniej" },
        { id: "remainder", title: "Dzielenie z resztą" },
        { id: "powers", title: "Kwadraty i sześciany" },
        { id: "word", title: "Zadania tekstowe" },
        { id: "order", title: "Kolejność działań" },
        { id: "numberline", title: "Oś liczbowa i łamigłówki" },
        { id: "mix", title: "Wielka przejażdżka" }
      ]
    },
    {
      id: "chapter2",
      number: 2,
      title: "Systemy zapisywania liczb",
      href: "Chapter2/index.html",
      tone: "written",
      icon: "123",
      stations: [
        { id: "dziesiatkowy", title: "Cyfrowa wieża" },
        { id: "porownywanie", title: "Pojedynek liczb" },
        { id: "duze", title: "Wielkie rachunki" },
        { id: "pieniadze", title: "Kasa miasteczka" },
        { id: "dlugosc", title: "Miary w ruchu" },
        { id: "masa", title: "Waga odkrywcy" },
        { id: "rzymskie", title: "Rzymskie tajemnice" },
        { id: "kalendarz", title: "Kalendarzowa wyprawa" },
        { id: "zegary", title: "Zegarowa stacja" },
        { id: "mix", title: "Wielki obchód" }
      ]
    },
    {
      id: "chapter3",
      number: 3,
      title: "Działania pisemne",
      href: "Chapter3/index.html",
      tone: "written",
      icon: "↕",
      stations: [
        { id: "dodawanie", title: "Wieża sum" },
        { id: "odejmowanie", title: "Trop różnicy" },
        { id: "mnozeniejedna", title: "Mnożnik solo" },
        { id: "mnozenie", title: "Warsztat mnożenia" },
        { id: "dzieleniejedna", title: "Dzielenie krok po kroku" },
        { id: "dzielenie", title: "Stacja ilorazów" },
        { id: "tekstowe", title: "Misje rachunkowe" },
        { id: "mix", title: "Wielki obchód" }
      ]
    },
    {
      id: "chapter4",
      number: 4,
      title: "Figury geometryczne",
      href: "Chapter4/index.html",
      tone: "geometry",
      icon: "△",
      stations: [
        { id: "linie", title: "Laboratorium linii" },
        { id: "polozenie", title: "Skrzyżowania" },
        { id: "dlugosci", title: "Patrol miarki" },
        { id: "katy", title: "Detektyw kątów" },
        { id: "mierzenie-katow", title: "Pracownia stopni" },
        { id: "wielokaty", title: "Aleja wielokątów" },
        { id: "prostokaty", title: "Plac czworokątów" },
        { id: "obwody", title: "Ogrodzenie figur" },
        { id: "kola", title: "Rondo odkrywców" },
        { id: "skala", title: "Biuro planów" },
        { id: "mix", title: "Geometryczny obchód" }
      ]
    },
    {
      id: "chapter5",
      number: 5,
      title: "Ułamki zwykłe",
      href: "Chapter5/index.html",
      tone: "fractions",
      icon: "◔",
      stations: [
        { id: "czesci-calosci", title: "Pracownia równych części" },
        { id: "liczby-mieszane", title: "Magazyn całych i części" },
        { id: "os-ulamkowa", title: "Ulica ułamkowej osi" },
        { id: "porownywanie", title: "Wieża porównań" },
        { id: "rozszerzanie-skracanie", title: "Warsztat równoważności" },
        { id: "ulamki-niewlasciwe", title: "Przepakownia całości" },
        { id: "ulamek-jako-iloraz", title: "Punkt sprawiedliwego podziału" },
        { id: "dodawanie", title: "Kasa ułamkowych sum" },
        { id: "odejmowanie", title: "Kasa ułamkowych różnic" },
        { id: "ulamkowe-zagadki", title: "Klub tropicieli ułamków" },
        { id: "mix", title: "Wielki ułamkowy obchód" }
      ]
    },
    {
      id: "chapter6",
      number: 6,
      title: "Ułamki dziesiętne",
      href: "Chapter6/index.html",
      tone: "decimals",
      icon: "0,5",
      stations: [
        { id: "zapis-dziesietny", title: "Pracownia przecinka" },
        { id: "os-dziesietna", title: "Aleja liczb dziesiętnych" },
        { id: "dlugosc", title: "Stacja długości" },
        { id: "masa", title: "Waga miejska" },
        { id: "rowne-zapisy", title: "Galeria równych zapisów" },
        { id: "porownywanie", title: "Wieża porównań" },
        { id: "dodawanie", title: "Kasa sum" },
        { id: "odejmowanie", title: "Kasa różnic" },
        { id: "zakupy", title: "Rynek zakupów" },
        { id: "dziesietne-zagadki", title: "Klub tropicieli przecinka" },
        { id: "mix", title: "Wielki dziesiętny obchód" }
      ]
    },
    {
      id: "chapter7",
      number: 7,
      title: "Pola figur",
      href: "Chapter7/index.html",
      tone: "areas",
      icon: "▦",
      stations: [
        { id: "kwadraty-jednostkowe", title: "Mozaika jednostek" },
        { id: "jednostki-pola", title: "Magazyn jednostek" },
        { id: "pole-prostokata", title: "Plan prostokątów" },
        { id: "pole-kwadratu", title: "Plac kwadratów" },
        { id: "brakujacy-bok", title: "Biuro brakujących boków" },
        { id: "figury-zlozone", title: "Pracownia figur złożonych" },
        { id: "zamiana-jednostek", title: "Winda jednostek pola" },
        { id: "ary-hektary", title: "Mierniczy terenów" },
        { id: "wycinanki", title: "Warsztat wycinanek" },
        { id: "pola-w-praktyce", title: "Ekipa planistów" },
        { id: "mix", title: "Wielki obchód pól" }
      ]
    },
    {
      id: "chapter8",
      number: 8,
      title: "Prostopadłościany i sześciany",
      href: "Chapter8/index.html",
      tone: "solids",
      icon: "◇",
      stations: [
        { id: "bryly", title: "Rozpoznawalnia brył" },
        { id: "elementy", title: "Warsztat szkieletów" },
        { id: "wymiary", title: "Trzy krawędzie" },
        { id: "suma-krawedzi", title: "Druciana rama" },
        { id: "pary", title: "Ściany i kierunki" },
        { id: "siatki", title: "Składarnia siatek" },
        { id: "siatka-wymiary", title: "Miarka siatki" },
        { id: "kostki", title: "Składanka z kostek" },
        { id: "pole-powierzchni", title: "Biuro powierzchni" },
        { id: "oklejanie", title: "Ekipa oklejania" },
        { id: "mix", title: "Wielki obchód brył" }
      ]
    }
  ];
})(typeof window === "undefined" ? globalThis : window);
