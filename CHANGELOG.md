# Changelog

## 26.8.1

- Replaced the English Mini-IPIP wording of IPIP-BFM-20 with the official Polish adaptation (Topolewska, Skimina, Strus, Cieciuch, Rowiński 2014), including its response scale and reverse-scoring key.
- Corrected the IPIP license record: the Polish version is CC BY with a required credit line, not public domain. The credit is shown in the interface and in the exported report.
- Split every doubled grammatical form into a masculine and a feminine wording, selected on a screen shown before the first question. PHQ-9 and GAD-7 license records now declare an adaptation, and the change is disclosed to the user.
- Dropped the arbitrary interpretive bands from IPIP-BFM-20; scales may now report a raw score. Bands became optional in the schema, the engine, and the content validator.
- Restyled the whole site with the Catppuccin Latte and Mocha palettes, verified against WCAG AA contrast for every text and background pair in use.
- Replaced the appearance dropdown with an icon button cycling system, light and dark, using the Lucide monitor, sun and moon glyphs.
- Switched to self-hosted Geist and Geist Mono variable fonts; the monospaced face carries the instrument codes and scores.
- Separated the questionnaire name from its technical code: the name is the heading, the code sits underneath it.
- Removed the footer note.
- Introduced a token-based design system: one spacing scale, one type scale, one radius scale, and a `.rytm` flow utility, so vertical spacing no longer comes from ad-hoc margins on individual components.
- Capped running text at about 68 characters. Prose pages ran the full 70rem column while their intro was capped at 48rem, so the same page had two different measures.
- Rebuilt the header as a grid: brand and appearance control on one row, navigation on its own row below on narrow screens, instead of links wrapping around the toggle.
- Added the item spine: one tick per question, filled as the questionnaire advances, replacing the abstract progress bar.
- Custom radio and checkbox indicators, focus ring on the whole option row, and a 2.75rem minimum control height.
- Bottom-aligned the last element of every grid card so actions line up across a row, and capped result cards so a single scale no longer stretches the full width.
- Secondary buttons now mark hover with the border rather than a fill; the Latte accent does not reach 4.5:1 on the tinted surface.
- Translated the whole interface, the error messages, and the exported report into Polish, and removed decorative and technical wording.
- Service worker: documents are now fetched network-first, and result and history pages are excluded regardless of the trailing slash.
- CSP script hashes are generated from the built output instead of being maintained by hand.
- Single source of truth for the app version, enforced at build time.
- Sessions keep their original creation time; results can be cleared in bulk from the history page.

## 26.8.0

- Initial privacy-first questionnaire engine with IPIP-BFM-20, PHQ-9, and GAD-7.
