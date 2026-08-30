---
id: gad-7
title: GAD-7
subtitle: Nasilenie objawów lękowych
language: pl
definitionVersion: 1.0.0
estimatedMinutes: 3
license: gad-unrestricted
disclaimer: GAD-7 jest narzędziem samoopisowym i przesiewowym. Wynik nie jest diagnozą.
sources:
  - https://www.phqscreeners.com/select-screener
  - https://www.phqscreeners.com/images/sites/g/files/g10060481/f/201412/GAD7_Polish%20for%20Poland.pdf
optionSets:
  frequency:
    id: frequency
    options:
      - { id: not-at-all, score: 0, label: "Wcale nie" }
      - { id: several-days, score: 1, label: "Kilka dni" }
      - { id: more-than-half, score: 2, label: "Więcej niż połowę dni" }
      - { id: nearly-every-day, score: 3, label: "Niemal codziennie" }
items:
  - { id: q1, text: "Czuł(a) się Pan(i) podenerwowany(a), niespokojny(a), mocno spięty(a)", optionSet: frequency }
  - { id: q2, text: "Nie mógł/mogła Pan(i) przestać się martwić albo zapanować nad tym", optionSet: frequency }
  - { id: q3, text: "Za bardzo się Pan(i) martwił(a) różnymi rzeczami", optionSet: frequency }
  - { id: q4, text: "Miał(a) Pan(i) trudności z relaksowaniem się", optionSet: frequency }
  - { id: q5, text: "Był(a) Pan(i) tak niespokojny(a), że nie mógł/mogła usiedzieć na miejscu", optionSet: frequency }
  - { id: q6, text: "Łatwo stawał(a) się Pan(i) rozdrażniony(a) lub poirytowany(a)", optionSet: frequency }
  - { id: q7, text: "Obawiał(a) się Pan(i), tak jakby miało się stać coś strasznego", optionSet: frequency }
scales:
  - { id: total, title: "Wynik ogólny", aggregation: sum, items: [q1, q2, q3, q4, q5, q6, q7], range: { min: 0, max: 21 }, bands: [{ min: 0, max: 4, label: "Minimalne" }, { min: 5, max: 9, label: "Łagodne" }, { min: 10, max: 14, label: "Umiarkowane" }, { min: 15, max: 21, label: "Ciężkie" }] }
safetySignals: []
---

## O teście

GAD-7 pyta o częstotliwość objawów lękowych w ostatnich dwóch tygodniach. Jest narzędziem przesiewowym i samoopisowym.

## Ograniczenia

Wynik nie zastępuje konsultacji i nie służy do samodzielnego rozpoznawania zaburzenia lękowego.
