# Changelog

## 26.8.1

- Replaced the English Mini-IPIP wording of IPIP-BFM-20 with the official Polish adaptation (Topolewska, Skimina, Strus, Cieciuch, Rowiński 2014), including its response scale and reverse-scoring key.
- Corrected the IPIP license record: the Polish version is CC BY with a required credit line, not public domain. The credit is shown in the interface and in the exported report.
- Split every doubled grammatical form into a masculine and a feminine wording, selected on a screen shown before the first question. PHQ-9 and GAD-7 license records now declare an adaptation, and the change is disclosed to the user.
- Dropped the arbitrary interpretive bands from IPIP-BFM-20; scales may now report a raw score. Bands became optional in the schema, the engine, and the content validator.
- Added a three-state appearance switch (system, light, dark) with a full dark palette and no flash on load.
- Translated the whole interface, the error messages, and the exported report into Polish, and removed decorative and technical wording.
- Service worker: documents are now fetched network-first, and result and history pages are excluded regardless of the trailing slash.
- CSP script hashes are generated from the built output instead of being maintained by hand.
- Single source of truth for the app version, enforced at build time.
- Sessions keep their original creation time; results can be cleared in bulk from the history page.

## 26.8.0

- Initial privacy-first questionnaire engine with IPIP-BFM-20, PHQ-9, and GAD-7.
