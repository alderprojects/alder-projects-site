# Vision Eval Test Photos

The vision prompt is the product. Before week 2 ships Smart Cart synthesis
that reads from extractions, the prompt has to produce reliable output across
real photos — not stock library shots.

## How to populate

Drop real photos into the subfolder matching the room type:

```
test-photos/
  kitchen/      8-10 kitchens, varied eras (1980s, 2000s, 2020s) + conditions
  bathroom/     5-7 bathrooms, varied vanity styles, shower types
  deck/         4-5 decks/patios, varied materials (pressure-treated, composite, ipe)
  living_room/  3-4
  bedroom/      3-4
  basement/     2-3 (finished and unfinished)
  mudroom/      2-3
  laundry/      2-3
  exterior_front/ 2-3
  exterior_back/  2-3
```

Plus 2-3 ambiguous edge cases (kitchen-dining transitions, basement-with-
bedroom). Put those in whichever room they read as "most".

## Source guidance

Real homes only — yours, friends-and-family (consented), or staged real-
estate listings. **No Pinterest or Unsplash** — those are too clean and the
extractor will pass them trivially while failing on real-world photos.

## Running the eval

```
npm run vision:eval
```

Outputs `eval-results/eval-<timestamp>.html`. Open in browser.

## Pass criteria (week 1 gate)

- Room type correct on ≥95% of clear photos
- Era estimate within 1 decade on ≥80%
- Boolean features correct on ≥90% where determinable
- Zero value judgments in `condition_note_short`
- High-confidence (≥0.7) on ≥70% of clear photos

If any of these fail, revise `src/lib/vision/extract.ts` `SYSTEM_PROMPT`,
bump `PROMPT_VERSION`, and re-run.

## Privacy

Photos in `test-photos/` are .gitignored — they never get committed. Only
the directory structure (via `.gitkeep` files) is tracked.
