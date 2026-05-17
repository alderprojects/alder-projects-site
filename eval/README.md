# Vision Eval Harness

Runs the open photo extraction prompt (`src/lib/vision/prompt.ts` + `extractOpenFeatures`) against a local corpus of test photos. Produces a markdown summary + per-photo JSON files in `eval/results/<ISO timestamp>/`.

## Setup

1. Drop test photos into `eval/corpus/`. Subfolders are optional and used only for labeling in the report:
   ```
   eval/corpus/
     basement/
       my-basement-1.jpg
       my-basement-2.jpg
     kitchen/
       kitchen-counters.jpg
     decks/
       weathered-deck.jpg
     uncategorized-photo.jpg   # top-level files are fine too
   ```
2. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`.
3. The corpus is gitignored — your photos stay local. Use Flickr Creative Commons or your own photos.

## Run

```sh
npm run vision:eval
```

(Equivalent to `npx tsx src/lib/vision/eval.ts`.)

Requires `ANTHROPIC_API_KEY` in `.env.local`.

## Output

Each run writes to `eval/results/<ISO timestamp>/`:

- `summary.md` — open this. Top-line metrics, category distribution, top feature types, failed cases, low-confidence cases.
- `summary.json` — same data, machine-readable.
- `<label>__<filename>.json` — one per photo, with the full extraction + latency + cost + any error.

## What "good" looks like for v7.3.3-C

The eval is informational, not a hard gate. Things to watch:

| Signal | Healthy range | What it tells you |
| --- | --- | --- |
| Success rate | ≥95% | The pipeline is stable. Failures usually mean schema validation rejected the model output. |
| Mean feature confidence | 0.7-0.85 | Below 0.6 = prompt is asking for more than the photos can support. Above 0.95 = model is over-confident, watch for hallucinations. |
| Mean feature count per photo | 3-10 | Below 2 = prompt is too restrictive. Above 15 = model is fishing, expect noise. |
| Categories represented | broad | If 90% of photos land in one category, your corpus isn't diverse enough or the model is collapsing categories. |
| Mean latency | 3-8s | Above 9s risks the Vercel Hobby 10s function timeout. Tune `OPEN_MAX_TOKENS`. |
| Mean cost / photo | 1-3¢ | Sonnet 4.5 at $3/M in + $15/M out. |

Compare across prompt versions by running the same corpus twice — `OPEN_EXTRACTION_PROMPT_VERSION` is in the summary.

## Tips for the corpus

- Aim for 100-150 photos across basement, kitchen, bathroom, deck, roof, attic, electrical panel, exterior — i.e. the categories in `CATEGORY_VALUES`.
- Include some intentionally bad photos (dark, blurry, partial wall sections) so you can see how the model degrades.
- Include some mixed-category photos (laundry room with a water heater visible, kitchen with electrical panel in frame) to test category arbitration.
- Don't curate too heavily — over-clean corpora mislead.
