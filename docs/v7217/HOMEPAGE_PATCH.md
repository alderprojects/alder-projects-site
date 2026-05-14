# v7.2.17 — Homepage Patch Instructions

In src/app/page.tsx:
1. Add: `import SeasonalHero from '@/components/SeasonalHero'`
2. Replace existing top-of-page hero with `<SeasonalHero />`
