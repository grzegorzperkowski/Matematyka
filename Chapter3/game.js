(() => {
  "use strict";
  const routeLabels = { dodawanie:"Wieża sum", odejmowanie:"Trop różnicy", mnozeniejedna:"Mnożnik solo", mnozenie:"Warsztat mnożenia", dzieleniejedna:"Dzielenie krok po kroku", dzielenie:"Stacja ilorazów", tekstowe:"Misje rachunkowe", mix:"Wielki obchód" };
  const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const pick=(items)=>items[Math.floor(Math.random()*items.length)];
  const shuffle=(items)=>[...items].sort(()=>Math.random()-.5);
  const format=(value)=>Number(value).toLocaleString("pl-PL");
  const question=(data)=>({kind:"input",label:"Działanie pisemne",visual:null,...data});
  const equation=(expression,caption)=>({type:"equation",expression,caption});
  const column = (top, bottom, operator, caption) => ({ type:"column", top:format(top), bottom:format(bottom), operator, caption });
  const division = (dividend, divisor, caption) => ({ type:"division", dividend:format(dividend), divisor:format(divisor), caption });

  function additionQuestions() { return Array.from({length:12},(_,index)=>{
    if (index >= 10) {
      const first=rand(230,1900), missing=rand(120,980), sum=first+missing;
      return question({label:"Dodawanie pisemne",method:"brakujący składnik",prompt:`Jaki składnik trzeba dodać do ${format(first)}, aby otrzymać ${format(sum)}?`,answer:missing,hint:"Odejmij znany składnik od sumy. Ustaw cyfry w kolumnach.",explanation:`${format(sum)} − ${format(first)} = ${format(missing)}, więc ${format(first)} + ${format(missing)} = ${format(sum)}.`,visual:equation(`${format(first)} + ? = ${format(sum)}`,"Szukaj brakującego składnika.")});
    }
    const digits=index<4?3:4, min=10**(digits-1), first=rand(min,10**digits-1), second=rand(min,10**digits-1), answer=first+second;
    if (index >= 8) {
      const third=rand(120,950), total=answer+third;
      return question({label:"Dodawanie pisemne",method:"trzy składniki",prompt:`Dodaj sposobem pisemnym trzy liczby: ${format(first)}, ${format(second)} i ${format(third)}.`,answer:total,hint:"Ustaw wszystkie trzy składniki w kolumnach. Dodawaj od jedności i zapisuj przeniesienia.",explanation:`${format(first)} + ${format(second)} + ${format(third)} = ${format(total)}. W każdej kolumnie dodaj cyfry trzech składników i przeniesienie.`,visual:equation(`${format(first)} + ${format(second)} + ${format(third)}`,"Trzy składniki ustaw według wartości miejsc.")});
    }
    return question({label:"Dodawanie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(first)} + ${format(second)}.`,answer,hint:"Ustaw jedności pod jednościami. Dodawaj od prawej do lewej i zapisuj przeniesienia.",explanation:`${format(first)} + ${format(second)} = ${format(answer)}.`,visual:column(first,second,"+","Kolumny jedności, dziesiątek i setek są ustawione równo.")});
  }); }
  function subtractionQuestions() { return Array.from({length:12},(_,index)=>{
    if (index >= 10) {
      const before=rand(1250,5600), increase=rand(260,1900), after=before+increase;
      return question({label:"Odejmowanie pisemne",method:"znajdowanie przyrostu",prompt:`Licznik wskazywał ${format(before)}, a teraz wskazuje ${format(after)}. O ile wzrosło wskazanie?`,answer:increase,hint:"Od nowego wskazania odejmij stare. Zapisz liczby jedna pod drugą.",explanation:`${format(after)} − ${format(before)} = ${format(increase)}.`,visual:column(after,before,"−","Różnica pokazuje zmianę.")});
    }
    const first=index>=7?[1000,2000,3000,5000,10000,20000][rand(0,5)]:rand(index<4?320:1200,index<4?999:9999);
    const second=rand(index>=7?125:index<4?100:350,first-1), answer=first-second;
    return question({label:"Odejmowanie pisemne",method:index>=7?"pożyczanie przez zera":"odejmowanie w kolumnach",prompt:`Oblicz sposobem pisemnym: ${format(first)} − ${format(second)}.`,answer,hint:index>=7?"Gdy nad cyfrą są zera, pożycz z najbliższej niezerowej kolumny po lewej i rozmień po drodze.":"Zacznij od jedności. Gdy górna cyfra jest za mała, pożycz z kolumny po lewej.",explanation:`${format(first)} − ${format(second)} = ${format(answer)}.${index>=7?" Pożyczanie przez zera zmienia mijane kolumny na dziewiątki.":""}`,visual:column(first,second,"−","Odejmuj od prawej strony, pożyczając w razie potrzeby.")});
  }); }
  function oneDigitMultiplicationQuestions() { return Array.from({length:12},(_,index)=>{
    const first=rand(index<4?100:1000,index<4?999:9999), factor=rand(2,9), answer=first*factor;
    if (index>=10) return question({label:"Mnożenie przez liczbę jednocyfrową",method:"brakujący czynnik",prompt:`Jaką liczbę pomnożono przez ${factor}, aby otrzymać ${format(answer)}?`,answer:first,hint:`Podziel ${format(answer)} przez ${factor}. Wynik sprawdź mnożeniem.`,explanation:`${format(answer)} : ${factor} = ${format(first)}, bo ${format(first)} · ${factor} = ${format(answer)}.`,visual:equation(`? · ${factor} = ${format(answer)}`,"Mnożenie sprawdzisz dzieleniem.")});
    return question({label:"Mnożenie przez liczbę jednocyfrową",prompt:`Oblicz sposobem pisemnym: ${format(first)} · ${factor}.`,answer,hint:"Mnoż każdą cyfrę od prawej strony przez mnożnik. Zapisuj przeniesienia nad następną kolumną.",explanation:`${format(first)} · ${factor} = ${format(answer)}.`,visual:column(first,factor,"×","Każda kolumna jest mnożona przez tę samą cyfrę.")});
  }); }
  function multiDigitMultiplicationQuestions() { return Array.from({length:12},(_,index)=>{
    const first=rand(index<5?25:110,index<5?99:899);
    const factor=index<5?rand(11,49):index<8?rand(2,9)*10:index<10?rand(11,39)*10+rand(1,9):rand(12,46)*100;
    const answer=first*factor, zeroes=factor%10===0;
    const base=zeroes?Number(String(factor).replace(/0+$/,"")):factor;
    const count=zeroes?String(factor).length-String(base).length:0;
    return question({label:"Mnożenie pisemne",method:zeroes?"mnożenie przez liczbę z zerami":factor>=100?"iloczyny częściowe":"mnożenie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(first)} · ${format(factor)}.`,answer,hint:zeroes?`Najpierw oblicz ${format(first)} · ${base}, potem dopisz ${count} ${count===1?"zero":"zera"}.`:"Pomnóż kolejno przez jedności, dziesiątki i ewentualnie setki. Każdy iloczyn częściowy przesuń zgodnie z wartością miejsca.",explanation:zeroes?`${format(first)} · ${base} = ${format(first*base)}, więc po przesunięciu o ${count} ${count===1?"miejsce":"miejsca"} wynik to ${format(answer)}.`:`${format(first)} · ${format(factor)} = ${format(answer)}. Dodaj iloczyny częściowe we właściwych kolumnach.`,visual:column(first,factor,"×",zeroes?"Zera na końcu czynnika oznaczają przesunięcie miejsc.":"Każdy iloczyn częściowy zaczyna się we właściwej kolumnie.")});
  }); }
  function divisionQuestions(oneDigit) { return Array.from({length:12},(_,index)=>{
    const divisor=oneDigit?rand(3,9):rand(11,29), quotient=rand(index<5?(oneDigit?20:12):(oneDigit?100:40),index<5?(oneDigit?99:49):(oneDigit?999:129));
    const remainder=oneDigit&&index>=7?rand(1,divisor-1):0, dividend=divisor*quotient+remainder;
    if (remainder&&index>=10) return question({label:"Dzielenie przez liczbę jednocyfrową",method:"wyznaczanie reszty",prompt:`W dzieleniu ${format(dividend)} : ${divisor} iloraz wynosi ${format(quotient)}. Ile wynosi reszta?`,answer:remainder,hint:`Pomnóż ${format(quotient)} przez ${divisor} i odejmij wynik od ${format(dividend)}. Reszta musi być mniejsza od dzielnika.`,explanation:`${format(dividend)} = ${divisor} · ${format(quotient)} + ${remainder}, więc reszta to ${remainder} < ${divisor}.`,visual:equation(`${format(dividend)} = ${divisor} · ${format(quotient)} + ?`,"Szukaj reszty mniejszej od dzielnika.")});
    if (remainder) return question({label:"Dzielenie przez liczbę jednocyfrową",method:"dzielenie z resztą",prompt:`Podziel ${format(dividend)} przez ${divisor} z resztą. Jaki jest iloraz?`,answer:quotient,hint:"Dziel od lewej strony. Iloraz to liczba pełnych grup; reszta musi być mniejsza od dzielnika.",explanation:`${format(dividend)} = ${divisor} · ${format(quotient)} + ${remainder}. Iloraz wynosi ${format(quotient)}, a reszta ${remainder} < ${divisor}.`,visual:division(dividend,divisor,"Po podzieleniu pozostanie reszta mniejsza od dzielnika.")});
    return question({label:oneDigit?"Dzielenie przez liczbę jednocyfrową":"Dzielenie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(dividend)} : ${divisor}.`,answer:quotient,hint:oneDigit?"Dziel od lewej strony. Po każdym kroku pomnóż otrzymaną cyfrę ilorazu przez dzielnik i odejmij.":"Sprawdź, ile razy dzielnik mieści się w pierwszych cyfrach dzielnej. Każdy krok sprawdzaj mnożeniem.",explanation:`${format(dividend)} : ${divisor} = ${format(quotient)}, bo ${format(quotient)} · ${divisor} = ${format(dividend)}.`,visual:division(dividend,divisor,"Wynik budujesz cyfrę po cyfrze od lewej strony.")});
  }); }
  function wordProblemQuestions() { return Array.from({length:12},(_,index)=>{
    let prompt,answer,hint,explanation,visual,method;
    if(index%6===0) { const boxes=rand(12,48),items=rand(12,49); answer=boxes*items; method="równe grupy"; prompt=`Do magazynu przyjechało ${boxes} pudełek po ${items} kredek. Ile kredek przyjechało?`; hint="To tyle samo kredek w każdym pudełku, więc użyj mnożenia."; explanation=`${boxes} · ${items} = ${format(answer)} kredek.`; visual=equation(`${boxes} · ${items}`,"Równe grupy oznaczają mnożenie."); }
    else if(index%6===1) { const rows=rand(14,39),each=rand(10,29),sent=rand(20,rows*each-1),total=rows*each; answer=total-sent; method="mnożenie i odejmowanie"; prompt=`W bibliotece było ${rows} półek po ${each} książek. Wypożyczono ${sent} książek. Ile zostało?`; hint="Najpierw policz wszystkie książki, a potem odejmij wypożyczone."; explanation=`${rows} · ${each} = ${format(total)}, a ${format(total)} − ${sent} = ${format(answer)} książek.`; visual=equation(`${rows} · ${each} − ${sent}`,"Najpierw znajdź całość."); }
    else if(index%6===2) { const groups=rand(4,12),each=rand(15,49),total=groups*each; answer=each; method="równy podział"; prompt=`${total} sadzonek rozłożono po równo do ${groups} skrzynek. Ile sadzonek jest w każdej skrzynce?`; hint="Równy podział oznacza dzielenie."; explanation=`${total} : ${groups} = ${answer} sadzonek.`; visual=equation(`${total} : ${groups}`,"Podziel całość na równe grupy."); }
    else if(index%6===3) { const a=rand(320,890),b=rand(250,780),c=rand(410,960); answer=a+b+c; method="suma trzech etapów"; prompt=`Trasa wycieczki ma trzy etapy: ${a} m, ${b} m i ${c} m. Ile metrów ma cała trasa?`; hint="Dodaj długości wszystkich trzech etapów. Ustaw metry w kolumnach."; explanation=`${a} + ${b} + ${c} = ${format(answer)} m.`; visual=equation(`${a} + ${b} + ${c}`,"Cała trasa jest sumą etapów."); }
    else if(index%6===4) { const count=rand(4,12),cost=rand(120,590),profit=count*rand(20,95); answer=cost+profit/count; method="koszt i zysk na sztuce"; prompt=`Sklep kupił ${count} jednakowych lamp po ${cost} zł. Sprzedał wszystkie i zyskał razem ${profit} zł. Ile zł płacił klient za jedną lampę?`; hint="Dodaj zysk do łącznego kosztu zakupu, a potem podziel przez liczbę lamp."; explanation=`${count} · ${cost} = ${count*cost} zł kosztu; (${count*cost} + ${profit}) : ${count} = ${answer} zł za lampę.`; visual=equation(`(${count} · ${cost} + ${profit}) : ${count}`,"Cena sprzedaży obejmuje koszt i udział w zysku."); }
    else { const largeCount=rand(2,5),smallCount=rand(3,8),smallWeight=rand(15,45),largeWeight=rand(60,140),total=largeCount*largeWeight+smallCount*smallWeight; answer=largeWeight; method="brakująca równa część"; prompt=`Na wadze jest ${largeCount} jednakowych dużych paczek i ${smallCount} małych po ${smallWeight} g. Razem ważą ${total} g. Ile waży jedna duża paczka?`; hint="Odejmij masę wszystkich małych paczek, potem podziel resztę przez liczbę dużych."; explanation=`(${total} − ${smallCount} · ${smallWeight}) : ${largeCount} = ${largeWeight} g.`; visual=equation(`(${total} − ${smallCount} · ${smallWeight}) : ${largeCount}`,"Najpierw usuń znaną masę małych paczek."); }
    return question({label:"Zadanie tekstowe",method,prompt,answer,hint,explanation,visual});
  }); }
  function buildQuestions(mode) { const pools={dodawanie:additionQuestions,odejmowanie:subtractionQuestions,mnozeniejedna:oneDigitMultiplicationQuestions,mnozenie:multiDigitMultiplicationQuestions,dzieleniejedna:()=>divisionQuestions(true),dzielenie:()=>divisionQuestions(false),tekstowe:wordProblemQuestions}; if (pools[mode]) return pools[mode](); const selected=Object.entries(pools).map(([routeId,build])=>({...pick(build()),routeId})); const extra=[["dodawanie",8],["odejmowanie",8],["mnozenie",8],["dzieleniejedna",8],["tekstowe",5]].map(([routeId,index])=>({...pools[routeId]()[index],routeId})); return shuffle([...selected,...extra]); }
  MathTownGame.start({chapterId:"chapter3",chapterTitle:"Działania pisemne",routeLabels,buildQuestions});
})();
