---
id: gad-7
name: Skala lęku uogólnionego
code: GAD-7
subtitle: Nasilenie objawów lękowych w ostatnich dwóch tygodniach
language: pl
definitionVersion: 2.0.0
estimatedMinutes: 3
license: gad-unrestricted
adaptationNotice: "Podwójne formy gramatyczne z oficjalnego tłumaczenia rozdzielono na wariant męski i żeński. To nie jest oficjalna wersja narzędzia."
disclaimer: GAD-7 jest narzędziem przesiewowym wypełnianym samodzielnie. Wynik nie jest diagnozą.
sources:
  - https://www.phqscreeners.com/select-screener
  - https://www.phqscreeners.com/images/sites/g/files/g10060481/f/201412/GAD7_Polish%20for%20Poland.pdf
optionSets:
  czestotliwosc:
    id: czestotliwosc
    prompt: "Jak często w ciągu ostatnich dwóch tygodni?"
    options:
      - { id: wcale, score: 0, label: "Wcale" }
      - { id: kilka-dni, score: 1, label: "Kilka dni" }
      - { id: ponad-polowe-dni, score: 2, label: "Więcej niż połowę dni" }
      - { id: niemal-codziennie, score: 3, label: "Niemal codziennie" }
items:
  - { id: q1, text: { m: "Czułeś się zdenerwowany, niespokojny lub mocno spięty", f: "Czułaś się zdenerwowana, niespokojna lub mocno spięta" }, optionSet: czestotliwosc }
  - { id: q2, text: { m: "Nie mogłeś przestać się martwić ani nad tym zapanować", f: "Nie mogłaś przestać się martwić ani nad tym zapanować" }, optionSet: czestotliwosc }
  - { id: q3, text: { m: "Za bardzo martwiłeś się różnymi rzeczami", f: "Za bardzo martwiłaś się różnymi rzeczami" }, optionSet: czestotliwosc }
  - { id: q4, text: { m: "Miałeś trudności z odprężeniem się", f: "Miałaś trudności z odprężeniem się" }, optionSet: czestotliwosc }
  - { id: q5, text: { m: "Byłeś tak niespokojny, że nie mogłeś usiedzieć w miejscu", f: "Byłaś tak niespokojna, że nie mogłaś usiedzieć w miejscu" }, optionSet: czestotliwosc }
  - { id: q6, text: { m: "Łatwo stawałeś się rozdrażniony lub poirytowany", f: "Łatwo stawałaś się rozdrażniona lub poirytowana" }, optionSet: czestotliwosc }
  - { id: q7, text: { m: "Obawiałeś się, jakby miało się stać coś strasznego", f: "Obawiałaś się, jakby miało się stać coś strasznego" }, optionSet: czestotliwosc }
scales:
  - { id: wynik-ogolny, title: "Wynik ogólny", aggregation: sum, items: [q1, q2, q3, q4, q5, q6, q7], range: { min: 0, max: 21 }, bands: [{ min: 0, max: 4, label: "Minimalne" }, { min: 5, max: 9, label: "Łagodne" }, { min: 10, max: 14, label: "Umiarkowane" }, { min: 15, max: 21, label: "Ciężkie" }] }
safetySignals: []
---

## O kwestionariuszu

GAD-7 pyta o częstotliwość siedmiu objawów lękowych w ostatnich dwóch tygodniach. Jest narzędziem przesiewowym wypełnianym samodzielnie, a wynik to suma punktów od 0 do 21.

## Ograniczenia

Wynik nie zastępuje konsultacji ze specjalistą i nie służy do samodzielnego rozpoznawania zaburzenia lękowego.
