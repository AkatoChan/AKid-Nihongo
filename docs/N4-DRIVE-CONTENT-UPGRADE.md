# N4 content expansion — Vietnamese learning pack

This update adds original and supplemental N4 practice material to the existing React/Tauri app without replacing its OpenJLPT corpus or changing the SQLite database.

## Included
- 130 Vietnamese vocabulary glosses in `manual-vi-addon.json`
- 183 Kanji compound lookup entries (readings and Vietnamese meanings)
- 6 original reading passages and 24 comprehension questions
- 42 additional practice questions: 16 vocabulary, 18 grammar, 8 listening
- Content loader, Kanji detail popup, validation script and mock exam integration

## Attribution and integrity
The new practice questions and passages are supplemental teaching exercises, **not official JLPT questions or reproduced 2025 exam papers**. JLPT-style categories were informed by the documents shared for this project. Existing OpenJLPT licensing remains unchanged; see `DATA-LICENSE.md`.

## How to test
```powershell
npm ci
npm run check:data
npm run build
npm run desktop:dev
```
After building, verify Kanji compound lookups, untranslated terms, longer readings and the three-stage mock exam. Listening continues to use Windows TTS, not official exam audio.

## Current limitations
- Not all 852 previously unlisted Kanji examples have Vietnamese glosses yet; this update covers a curated 183.
- The mock is **not a standardized JLPT score**.
- No compiled Windows package is included.

**SQLite study progress is preserved:** this branch does not change database schema, app identifier, or saved progress.