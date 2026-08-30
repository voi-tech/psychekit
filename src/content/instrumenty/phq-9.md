---
id: phq-9
title: PHQ-9
subtitle: Nasilenie objawów depresyjnych w ostatnich dwóch tygodniach
language: pl
definitionVersion: 2.0.0
estimatedMinutes: 3
license: phq-unrestricted
adaptationNotice: "Podwójne formy gramatyczne z oficjalnego tłumaczenia rozdzielono na wariant męski i żeński. To nie jest oficjalna wersja narzędzia."
disclaimer: PHQ-9 jest narzędziem przesiewowym wypełnianym samodzielnie. Wynik nie jest diagnozą ani oceną poziomu zagrożenia.
sources:
  - https://www.phqscreeners.com/select-screener
  - https://www.phqscreeners.com/images/sites/g/files/g10060481/f/201412/PHQ9_Polish%20for%20Poland.pdf
optionSets:
  czestotliwosc:
    id: czestotliwosc
    options:
      - { id: wcale, score: 0, label: "Wcale" }
      - { id: kilka-dni, score: 1, label: "Kilka dni" }
      - { id: ponad-polowe-dni, score: 2, label: "Więcej niż połowę dni" }
      - { id: niemal-codziennie, score: 3, label: "Niemal codziennie" }
items:
  - { id: q1, text: "Niewielkie zainteresowanie lub odczuwanie przyjemności z wykonywania czynności", optionSet: czestotliwosc }
  - { id: q2, text: "Uczucie smutku, przygnębienia lub beznadziejności", optionSet: czestotliwosc }
  - { id: q3, text: "Kłopoty z zaśnięciem, przerywany sen albo zbyt długi sen", optionSet: czestotliwosc }
  - { id: q4, text: "Uczucie zmęczenia lub brak energii", optionSet: czestotliwosc }
  - { id: q5, text: "Brak apetytu lub przejadanie się", optionSet: czestotliwosc }
  - { id: q6, text: { m: "Poczucie niezadowolenia z siebie — albo wrażenie, że jesteś do niczego, że zawiodłeś siebie lub rodzinę", f: "Poczucie niezadowolenia z siebie — albo wrażenie, że jesteś do niczego, że zawiodłaś siebie lub rodzinę" }, optionSet: czestotliwosc }
  - { id: q7, text: "Problemy ze skupieniem się, na przykład przy czytaniu gazety lub oglądaniu telewizji", optionSet: czestotliwosc }
  - { id: q8, text: { m: "Poruszanie się lub mówienie tak wolno, że inni mogliby to zauważyć — albo przeciwnie: byłeś tak pobudzony, że nie mogłeś usiedzieć w miejscu", f: "Poruszanie się lub mówienie tak wolno, że inni mogliby to zauważyć — albo przeciwnie: byłaś tak pobudzona, że nie mogłaś usiedzieć w miejscu" }, optionSet: czestotliwosc }
  - { id: q9, text: "Myśli, że lepiej byłoby umrzeć, albo chęć zrobienia sobie krzywdy", optionSet: czestotliwosc }
scales:
  - { id: wynik-ogolny, title: "Wynik ogólny", aggregation: sum, items: [q1, q2, q3, q4, q5, q6, q7, q8, q9], range: { min: 0, max: 27 }, bands: [{ min: 0, max: 4, label: "Minimalne" }, { min: 5, max: 9, label: "Łagodne" }, { min: 10, max: 14, label: "Umiarkowane" }, { min: 15, max: 19, label: "Umiarkowanie ciężkie" }, { min: 20, max: 27, label: "Ciężkie" }] }
safetySignals:
  - id: mysli-o-smierci
    item: q9
    when: { scoreGte: 1 }
    message: "Twoja odpowiedź wskazuje, że w ostatnich dwóch tygodniach pojawiały się myśli o śmierci lub o zrobieniu sobie krzywdy. PHQ-9 nie określa poziomu zagrożenia. Jeśli zagrożenie jest bezpośrednie, zadzwoń pod numer 112."
---

## O kwestionariuszu

PHQ-9 pyta o częstotliwość dziewięciu objawów w ostatnich dwóch tygodniach. Jest narzędziem przesiewowym wypełnianym samodzielnie, a wynik to suma punktów od 0 do 27.

## Ograniczenia

Wynik nie zastępuje rozmowy z lekarzem ani specjalistą zdrowia psychicznego i nie służy do samodzielnego rozpoznawania zaburzenia.
