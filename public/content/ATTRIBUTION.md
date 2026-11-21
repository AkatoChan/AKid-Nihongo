# Licenses and attribution for learning data

The **application source code** written for Nihongo Master N4 is available under the MIT License (`LICENSE-CODE`). **Learning data has separate terms**.

## OpenJLPT

- Project: Evan Clancy et al., [OpenJLPT](https://github.com/evanclan/OpenJLPT)
- Source: https://github.com/evanclan/OpenJLPT
- License: [Creative Commons Attribution–ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
- Starter data `public/content/n4-vocab.json`: the *first 65* N4 entries are an adapted, ordered sample of OpenJLPT headwords, readings, romanization and first English meanings, with our Vietnamese translations. The remaining starter entries and other Vietnamese explanations are original teaching materials. This subset is made available under CC BY-SA 4.0.
- `npm run sync:data` downloads N4/N5 vocabulary, kanji, grammar and examples from OpenJLPT at `OPENJLPT_REF` (default `main`) and merges original Vietnamese translations and supplemental lessons. After sync, generated content files **remain under CC BY-SA 4.0**, and SHA-256 digests of upstream source files plus a timestamp are recorded in `public/content/manifest.json`.
- The script saves upstream `NOTICE.md` and `LICENSE` into `public/content/openjlpt-NOTICE.md` and `public/content/openjlpt-LICENSE.txt` when synced. Retain these files when distributing built packages.
- Upstream original grammar explanations are attributed to OpenJLPT when present; Vietnamese teaching content and reading passages are original, separately identifiable in `source` metadata.
- No claim of affiliation with the OpenJLPT project is made.

## Upstream underlying data

OpenJLPT derives certain data from:

- **JMdict / KANJIDIC2** of EDRDG. EDRDG materials are published under CC BY-SA 4.0 subject to the EDRDG general dictionary license: https://www.edrdg.org/edrdg/licence.html . Credit **James W. Breen and the Electronic Dictionary Research and Development Group** as relevant.
- **Jonathan Waller**'s JLPT word/kanji classification lists under a Creative Commons attribution license, via OpenJLPT. https://www.tanos.co.uk/jlpt/
- **Tatoeba** example sentences with per-sentence IDs retained as `examples[].tatoeba_id`. Respect sentence-specific licensing/attribution and original authors; see https://tatoeba.org/en/terms_of_use and the OpenJLPT upstream NOTICE. Japanese example sentences are shown with provenance in the application's vocabulary dialog when IDs are supplied.

**Caution:** The official JLPT organization does not publish an exhaustive current JLPT vocabulary/grammar/kanji list. N4 labels in OpenJLPT and this app are study-level approximations, not official certification.

## Original materials

- `readings.json`: original Japanese reading comprehension passages, questions and Vietnamese explanations, written for this project.
- `n4-grammar.json` starter: original Vietnamese grammar descriptions, example sentences and explanations.
- Starter Kanji Vietnamese glosses: original translations and selected manual items.

You may adapt these original learning materials under CC BY-SA 4.0 when distributed together with the adapted OpenJLPT content; clearly credit Nihongo Master N4. Code, as opposed to learning content, is MIT licensed.

This document is a practical attribution notice, not legal advice.


## Nihongo Master v0.2

Original Japanese–Vietnamese glosses, grammar translations, long readings and exam simulation content were added by Nihongo Master N4 contributors. Optional dictionary enrichment source: Bunchaway (https://github.com/bunchaway/tu-dien-nhat-viet), CC BY-SA 4.0. Official JLPT sample tests are linked rather than reproduced. See DATA-LICENSE.md for details.
