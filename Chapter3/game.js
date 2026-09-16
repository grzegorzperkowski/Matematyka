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

  function additionQuestions() { return Array.from({length:10},(_,index)=>{
    const digits=index<4?3:4, min=10**(digits-1), first=rand(min,10**digits-1), second=rand(min,10**digits-1), answer=first+second;
    return question({label:"Dodawanie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(first)} + ${format(second)}.`,answer,hint:"Ustaw jedności pod jednościami. Dodawaj od prawej do lewej i zapisuj przeniesienia.",explanation:`${format(first)} + ${format(second)} = ${format(answer)}.`,visual:column(first,second,"+","Kolumny jedności, dziesiątek i setek są ustawione równo.")});
  }); }
  function subtractionQuestions() { return Array.from({length:10},(_,index)=>{
    const digits=index<4?3:4, min=10**(digits-1), first=rand(min+120,10**digits-1), second=rand(min,first-1), answer=first-second;
    return question({label:"Odejmowanie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(first)} − ${format(second)}.`,answer,hint:"Zacznij od jedności. Gdy górna cyfra jest za mała, pożycz 1 dziesiątkę z kolumny po lewej.",explanation:`${format(first)} − ${format(second)} = ${format(answer)}.`,visual:column(first,second,"−","Pożyczaj tylko wtedy, gdy cyfra na górze jest mniejsza.")});
  }); }
  function oneDigitMultiplicationQuestions() { return Array.from({length:10},(_,index)=>{
    const first=rand(index<4?100:1000,index<4?999:9999), factor=rand(2,9), answer=first*factor;
    return question({label:"Mnożenie przez liczbę jednocyfrową",prompt:`Oblicz sposobem pisemnym: ${format(first)} · ${factor}.`,answer,hint:"Mnoż każdą cyfrę od prawej strony przez mnożnik. Zapisuj przeniesienia nad następną kolumną.",explanation:`${format(first)} · ${factor} = ${format(answer)}.`,visual:column(first,factor,"×","Każda kolumna jest mnożona przez tę samą cyfrę.")});
  }); }
  function multiDigitMultiplicationQuestions() { return Array.from({length:10},(_,index)=>{
    const first=rand(index<5?20:100,index<5?99:999), factor=rand(11,49), answer=first*factor;
    return question({label:"Mnożenie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(first)} · ${factor}.`,answer,hint:"Najpierw pomnóż przez jedności mnożnika. Potem przez dziesiątki — drugi wiersz zacznij o jedno miejsce w lewo.",explanation:`${format(first)} · ${factor} = ${format(answer)}.`,visual:column(first,factor,"×","Drugi iloczyn częściowy dotyczy dziesiątek, więc przesuwa się o jedno miejsce.")});
  }); }
  function divisionQuestions(oneDigit) { return Array.from({length:10},(_,index)=>{
    const divisor=oneDigit?rand(2,9):rand(11,29), quotient=rand(index<5?(oneDigit?20:12):(oneDigit?100:40),index<5?(oneDigit?99:49):(oneDigit?999:99)), dividend=divisor*quotient;
    return question({label:oneDigit?"Dzielenie przez liczbę jednocyfrową":"Dzielenie pisemne",prompt:`Oblicz sposobem pisemnym: ${format(dividend)} : ${divisor}.`,answer:quotient,hint:oneDigit?"Dziel od lewej strony. Po każdym kroku pomnóż otrzymaną cyfrę ilorazu przez dzielnik i odejmij.":"Sprawdź, ile razy dzielnik mieści się w pierwszych cyfrach dzielnej. Każdy krok sprawdzaj mnożeniem.",explanation:`${format(dividend)} : ${divisor} = ${format(quotient)}, bo ${format(quotient)} · ${divisor} = ${format(dividend)}.`,visual:division(dividend,divisor,"Wynik budujesz cyfrę po cyfrze od lewej strony.")});
  }); }
  function wordProblemQuestions() { return Array.from({length:10},(_,index)=>{
    let prompt,answer,hint,explanation,visual;
    if(index%4===0) { const boxes=rand(12,48),items=rand(12,49); answer=boxes*items; prompt=`Do magazynu przyjechało ${boxes} pudełek po ${items} kredek. Ile kredek przyjechało?`; hint="To tyle samo kredek w każdym pudełku, więc użyj mnożenia."; explanation=`${boxes} · ${items} = ${format(answer)} kredek.`; visual=equation(`${boxes} pudełek · ${items} kredek`,"Równe grupy oznaczają mnożenie."); }
    else if(index%4===1) { const rows=rand(14,39),each=rand(10,29),sent=rand(20,rows*each-1),total=rows*each; answer=total-sent; prompt=`W bibliotece było ${rows} półek po ${each} książek. Wypożyczono ${sent} książek. Ile zostało?`; hint="Najpierw policz wszystkie książki, a potem odejmij wypożyczone."; explanation=`${rows} · ${each} = ${total}, a ${total} − ${sent} = ${answer}.`; visual=equation(`${rows} · ${each} − ${sent}`,"Najpierw znajdź całość."); }
    else if(index%4===2) { const groups=rand(4,12),each=rand(15,49),total=groups*each; answer=each; prompt=`${total} sadzonek rozłożono po równo do ${groups} skrzynek. Ile sadzonek jest w każdej skrzynce?`; hint="Równy podział oznacza dzielenie."; explanation=`${total} : ${groups} = ${answer} sadzonek.`; visual=equation(`${total} : ${groups}`,"Podziel całość na równe grupy."); }
    else { const morning=rand(120,499),afternoon=rand(120,499),target=morning+afternoon+rand(100,499); answer=target-morning-afternoon; prompt=`Na festyn potrzeba ${target} balonów. Rano przygotowano ${morning}, a po południu ${afternoon}. Ile balonów trzeba jeszcze przygotować?`; hint="Dodaj już przygotowane balony, a potem odejmij tę liczbę od celu."; explanation=`${morning} + ${afternoon} = ${morning+afternoon}; ${target} − ${morning+afternoon} = ${answer}.`; visual=equation(`${target} − (${morning} + ${afternoon})`,"Odejmij od celu to, co już jest gotowe."); }
    return question({label:"Zadanie tekstowe",prompt,answer,hint,explanation,visual});
  }); }
  function buildQuestions(mode) { const pools={dodawanie:additionQuestions,odejmowanie:subtractionQuestions,mnozeniejedna:oneDigitMultiplicationQuestions,mnozenie:multiDigitMultiplicationQuestions,dzieleniejedna:()=>divisionQuestions(true),dzielenie:()=>divisionQuestions(false),tekstowe:wordProblemQuestions}; if (pools[mode]) return pools[mode](); const selected=Object.values(pools).map((build)=>pick(build())); return shuffle([...selected,pick(additionQuestions()),pick(multiDigitMultiplicationQuestions()),pick(wordProblemQuestions())]); }
  MathTownGame.start({chapterId:"chapter3",chapterTitle:"Działania pisemne",routeLabels,buildQuestions});
})();
