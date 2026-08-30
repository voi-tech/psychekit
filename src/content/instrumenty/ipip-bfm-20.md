---
id: ipip-bfm-20
title: IPIP-BFM-20
subtitle: Krótki opis pięciu cech osobowości
language: pl
definitionVersion: 2.0.0
estimatedMinutes: 4
license: ipip-pl-cc-by
attribution: "Polska wersja IPIP-BFM-20: Topolewska, Skimina, Strus, Cieciuch, Rowiński (2014), www.ipip.edu.pl"
adaptationNotice: "Brzmienie stwierdzeń dostosowano gramatycznie do wybranej formy. To nie jest oficjalna wersja narzędzia."
disclaimer: To jest opis własnych cech, a nie diagnoza ani ocena psychologiczna.
sources:
  - https://www.ipip.uksw.edu.pl/test.php?id=31
  - https://ojs.tnkul.pl/index.php/rpsych/article/view/513
optionSets:
  trafnosc:
    id: trafnosc
    options:
      - { id: calkowicie-nietrafnie, score: 1, label: "Całkowicie nietrafnie mnie opisuje" }
      - { id: raczej-nietrafnie, score: 2, label: "Raczej nietrafnie mnie opisuje" }
      - { id: posrednio, score: 3, label: "Trochę trafnie, a trochę nietrafnie mnie opisuje" }
      - { id: raczej-trafnie, score: 4, label: "Raczej trafnie mnie opisuje" }
      - { id: calkowicie-trafnie, score: 5, label: "Całkowicie trafnie mnie opisuje" }
items:
  - { id: q1, text: "Jestem duszą towarzystwa.", optionSet: trafnosc }
  - { id: q2, text: "Niezbyt obchodzą mnie inni ludzie.", optionSet: trafnosc, reversed: true }
  - { id: q3, text: "Zostawiam moje rzeczy gdzie popadnie.", optionSet: trafnosc, reversed: true }
  - { id: q4, text: { m: "Zwykle jestem zrelaksowany.", f: "Zwykle jestem zrelaksowana." }, optionSet: trafnosc }
  - { id: q5, text: "Mam bogate słownictwo.", optionSet: trafnosc }
  - { id: q6, text: "Trzymam się z boku.", optionSet: trafnosc, reversed: true }
  - { id: q7, text: { m: "Jestem wyrozumiały dla uczuć innych ludzi.", f: "Jestem wyrozumiała dla uczuć innych ludzi." }, optionSet: trafnosc }
  - { id: q8, text: "Bez zwłoki wypełniam codzienne obowiązki.", optionSet: trafnosc }
  - { id: q9, text: "Często martwię się czymś.", optionSet: trafnosc, reversed: true }
  - { id: q10, text: "Mam trudności ze zrozumieniem abstrakcyjnych pojęć.", optionSet: trafnosc, reversed: true }
  - { id: q11, text: "Rozmawiam z wieloma różnymi ludźmi na przyjęciach.", optionSet: trafnosc }
  - { id: q12, text: "Nie interesują mnie problemy innych ludzi.", optionSet: trafnosc, reversed: true }
  - { id: q13, text: "Często zapominam odkładać rzeczy na miejsce.", optionSet: trafnosc, reversed: true }
  - { id: q14, text: { m: "Rzadko czuję się przygnębiony.", f: "Rzadko czuję się przygnębiona." }, optionSet: trafnosc }
  - { id: q15, text: "Mam głowę pełną pomysłów.", optionSet: trafnosc }
  - { id: q16, text: { m: "Wśród nieznajomych jestem małomówny.", f: "Wśród nieznajomych jestem małomówna." }, optionSet: trafnosc, reversed: true }
  - { id: q17, text: "Znajduję czas dla innych.", optionSet: trafnosc }
  - { id: q18, text: "Postępuję zgodnie z harmonogramem.", optionSet: trafnosc }
  - { id: q19, text: "Często miewam huśtawki nastrojów.", optionSet: trafnosc, reversed: true }
  - { id: q20, text: "Nie mam zbyt bogatej wyobraźni.", optionSet: trafnosc, reversed: true }
scales:
  - { id: ekstrawersja, title: "Ekstrawersja", aggregation: sum, items: [q1, q6, q11, q16], range: { min: 4, max: 20 }, bands: [] }
  - { id: ugodowosc, title: "Ugodowość", aggregation: sum, items: [q2, q7, q12, q17], range: { min: 4, max: 20 }, bands: [] }
  - { id: sumiennosc, title: "Sumienność", aggregation: sum, items: [q3, q8, q13, q18], range: { min: 4, max: 20 }, bands: [] }
  - { id: stabilnosc-emocjonalna, title: "Stabilność emocjonalna", aggregation: sum, items: [q4, q9, q14, q19], range: { min: 4, max: 20 }, bands: [] }
  - { id: intelekt, title: "Intelekt", aggregation: sum, items: [q5, q10, q15, q20], range: { min: 4, max: 20 }, bands: [] }
safetySignals: []
---

## O kwestionariuszu

IPIP-BFM-20 opisuje pięć cech: ekstrawersję, ugodowość, sumienność, stabilność emocjonalną i intelekt. Każdą cechę mierzą cztery stwierdzenia, więc wynik każdej mieści się między 4 a 20 punktami.

## Jak czytać wynik

Wynik to suma punktów, bez porównania z wynikami innych osób. PsycheKit nie stosuje tu norm, dlatego nie pokazuje etykiet w rodzaju „wysoki" czy „niski". Wyższa liczba punktów oznacza tylko, że więcej stwierdzeń opisujących daną cechę zostało uznanych za trafne.

## Ograniczenia

Wynik opisuje wyłącznie odpowiedzi udzielone w tym przebiegu. Nie jest normą, diagnozą ani poradą psychologiczną. Narzędzie nie służy do indywidualnej oceny psychologicznej.
