---
id: ipip-bfm-20
title: IPIP-BFM-20
subtitle: Krótki samoopis Wielkiej Piątki — wersja źródłowa angielska
language: en
definitionVersion: 1.0.0
estimatedMinutes: 4
license: ipip-public-domain
disclaimer: To samoopisowy pomiar cech osobowości, a nie diagnoza ani ocena kliniczna.
sources:
  - https://ipip.ori.org/MiniIPIPKey.htm
  - https://ipip.ori.org/newPermission.htm
optionSets:
  likert:
    id: likert
    options:
      - { id: very-inaccurate, score: 1, label: "Zdecydowanie nieprawdziwe" }
      - { id: moderately-inaccurate, score: 2, label: "Raczej nieprawdziwe" }
      - { id: neither, score: 3, label: "Ani prawdziwe, ani nieprawdziwe" }
      - { id: moderately-accurate, score: 4, label: "Raczej prawdziwe" }
      - { id: very-accurate, score: 5, label: "Zdecydowanie prawdziwe" }
items:
  - { id: q1, text: "Am the life of the party.", optionSet: likert }
  - { id: q2, text: "Talk to a lot of different people at parties.", optionSet: likert }
  - { id: q3, text: "Don't talk a lot.", optionSet: likert, reversed: true }
  - { id: q4, text: "Keep in the background.", optionSet: likert, reversed: true }
  - { id: q5, text: "Sympathize with others' feelings.", optionSet: likert }
  - { id: q6, text: "Feel others' emotions.", optionSet: likert }
  - { id: q7, text: "Am not really interested in others.", optionSet: likert, reversed: true }
  - { id: q8, text: "Am not interested in other people's problems.", optionSet: likert, reversed: true }
  - { id: q9, text: "Get chores done right away.", optionSet: likert }
  - { id: q10, text: "Like order.", optionSet: likert }
  - { id: q11, text: "Often forget to put things back in their proper place.", optionSet: likert, reversed: true }
  - { id: q12, text: "Make a mess of things.", optionSet: likert, reversed: true }
  - { id: q13, text: "Have frequent mood swings.", optionSet: likert, reversed: true }
  - { id: q14, text: "Get upset easily.", optionSet: likert, reversed: true }
  - { id: q15, text: "Am relaxed most of the time.", optionSet: likert }
  - { id: q16, text: "Seldom feel blue.", optionSet: likert }
  - { id: q17, text: "Have a vivid imagination.", optionSet: likert }
  - { id: q18, text: "Have difficulty understanding abstract ideas.", optionSet: likert, reversed: true }
  - { id: q19, text: "Am not interested in abstract ideas.", optionSet: likert, reversed: true }
  - { id: q20, text: "Do not have a good imagination.", optionSet: likert, reversed: true }
scales:
  - { id: extraversion, title: "Ekstrawersja", aggregation: sum, items: [q1, q2, q3, q4], range: { min: 4, max: 20 }, bands: [{ min: 4, max: 9, label: "Niższy zakres" }, { min: 10, max: 14, label: "Środkowy zakres" }, { min: 15, max: 20, label: "Wyższy zakres" }] }
  - { id: agreeableness, title: "Ugodowość", aggregation: sum, items: [q5, q6, q7, q8], range: { min: 4, max: 20 }, bands: [{ min: 4, max: 9, label: "Niższy zakres" }, { min: 10, max: 14, label: "Środkowy zakres" }, { min: 15, max: 20, label: "Wyższy zakres" }] }
  - { id: conscientiousness, title: "Sumienność", aggregation: sum, items: [q9, q10, q11, q12], range: { min: 4, max: 20 }, bands: [{ min: 4, max: 9, label: "Niższy zakres" }, { min: 10, max: 14, label: "Środkowy zakres" }, { min: 15, max: 20, label: "Wyższy zakres" }] }
  - { id: emotional-stability, title: "Stabilność emocjonalna", aggregation: sum, items: [q13, q14, q15, q16], range: { min: 4, max: 20 }, bands: [{ min: 4, max: 9, label: "Niższy zakres" }, { min: 10, max: 14, label: "Środkowy zakres" }, { min: 15, max: 20, label: "Wyższy zakres" }] }
  - { id: intellect, title: "Intelekt / wyobraźnia", aggregation: sum, items: [q17, q18, q19, q20], range: { min: 4, max: 20 }, bands: [{ min: 4, max: 9, label: "Niższy zakres" }, { min: 10, max: 14, label: "Środkowy zakres" }, { min: 15, max: 20, label: "Wyższy zakres" }] }
safetySignals: []
---

## O teście

IPIP-BFM-20 to krótki samoopis oparty na public-domain puli IPIP. W v1 zachowujemy oficjalną wersję źródłową angielską; polska adaptacja wymagałaby osobnego potwierdzenia praw i jakości adaptacji.

## Ograniczenia

Wyniki opisują wyłącznie odpowiedzi udzielone w tym przebiegu. Nie są normami, diagnozą ani poradą psychologiczną.
