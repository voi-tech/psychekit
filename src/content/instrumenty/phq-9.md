---
id: phq-9
title: PHQ-9
subtitle: Nasilenie objawów depresyjnych
language: pl
definitionVersion: 1.0.0
estimatedMinutes: 3
license: phq-unrestricted
disclaimer: PHQ-9 jest narzędziem samoopisowym i przesiewowym. Wynik nie jest diagnozą ani oceną poziomu ryzyka.
sources:
  - https://www.phqscreeners.com/select-screener
  - https://www.phqscreeners.com/images/sites/g/files/g10060481/f/201412/PHQ9_Polish%20for%20Poland.pdf
optionSets:
  frequency:
    id: frequency
    options:
      - { id: not-at-all, score: 0, label: "Wcale nie" }
      - { id: several-days, score: 1, label: "Kilka dni" }
      - { id: more-than-half, score: 2, label: "Więcej niż połowę dni" }
      - { id: nearly-every-day, score: 3, label: "Niemal codziennie" }
items:
  - { id: q1, text: "Niewielkie zainteresowanie lub odczuwanie przyjemności z wykonywania czynności", optionSet: frequency }
  - { id: q2, text: "Uczucie smutku, przygnębienia lub beznadziejności", optionSet: frequency }
  - { id: q3, text: "Kłopoty z zaśnięciem lub przerywany sen, albo zbyt długi sen", optionSet: frequency }
  - { id: q4, text: "Uczucie zmęczenia lub brak energii", optionSet: frequency }
  - { id: q5, text: "Brak apetytu lub przejadanie się", optionSet: frequency }
  - { id: q6, text: "Poczucie niezadowolenia z siebie — lub uczucie, że jest się do niczego, albo że zawiódł/zawiodła Pan/Pani siebie lub rodzinę", optionSet: frequency }
  - { id: q7, text: "Problemy ze skupieniem się na przykład przy czytaniu gazety lub oglądaniu telewizji", optionSet: frequency }
  - { id: q8, text: "Poruszanie się lub mówienie tak wolno, że inni mogliby to zauważyć? Albo wręcz przeciwnie — niemożność usiedzenia w miejscu lub nadmierne pobudzenie powodujące ruchliwość znacznie większą niż zwykle", optionSet: frequency }
  - { id: q9, text: "Myśli, że lepiej byłoby umrzeć, albo chęć zrobienia sobie krzywdy w jakiś sposób", optionSet: frequency }
scales:
  - { id: total, title: "Wynik ogólny", aggregation: sum, items: [q1, q2, q3, q4, q5, q6, q7, q8, q9], range: { min: 0, max: 27 }, bands: [{ min: 0, max: 4, label: "Minimalne" }, { min: 5, max: 9, label: "Łagodne" }, { min: 10, max: 14, label: "Umiarkowane" }, { min: 15, max: 19, label: "Umiarkowanie ciężkie" }, { min: 20, max: 27, label: "Ciężkie" }] }
safetySignals:
  - id: self-harm-thoughts
    item: q9
    when: { scoreGte: 1 }
    message: "Twoja odpowiedź wskazuje, że w ostatnich dwóch tygodniach występowały myśli dotyczące śmierci lub zrobienia sobie krzywdy. Sam PHQ-9 nie określa poziomu ryzyka. Jeśli istnieje bezpośrednie zagrożenie, zadzwoń pod 112."
---

## O teście

PHQ-9 pyta o częstotliwość objawów w ostatnich dwóch tygodniach. Jest narzędziem przesiewowym i samoopisowym.

## Ograniczenia

Wynik nie zastępuje rozmowy z lekarzem ani specjalistą zdrowia psychicznego i nie służy do samodzielnego rozpoznawania zaburzenia.
