## Smart Cart catalog — audit + retail-buyer gap analysis

Context: Alder Projects "Smart Cart" recommends curated home-improvement product
sets for a fee. 14 scope catalogs live, 222 universe products, distributed
across 8 topics. Brand thesis: "refresh, don't replace" — i.e. defer the
$15k remodel for $150 of the right stuff + a skip list of overbuy traps.
Goal: scale SEO + paid search; need broader category coverage and credible
savings claims.

### Catalog health (audit run 2026-05-10)

14 catalogs total — 4 launch-ready, 9 fixable, 1 hide-or-rebuild.

| Scope | Picks | Skips (TypeA/B) | Savings $low–$high | $/pick high | Promise/ValueProp/RouteOut | Status |
|---|---|---|---|---|---|---|
| home_repair/home_water_quality | 8 | 8 (5/3) | $1740–$5090 | $636 | y/y/y | hide-or-rebuild |
| home_repair/home_safety_kit | 6 | 8 (5/3) | $1015–$1900 | $317 | y/y/y | fixable |
| kitchen/kitchen_cabinet_hardware_swap | 6 | 10 (5/5) | $227–$377 | $63 | —/—/— | fixable |
| kitchen/kitchen_cosmetic_refresh | 9 | 11 (5/6) | $365–$630 | $70 | —/—/— | fixable |
| kitchen/kitchen_organizers | 11 | 11 (5/6) | $260–$400 | $36 | —/—/— | fixable |
| outdoor/outdoor_deck_refresh | 8 | 10 (6/4) | $255–$1015 | $127 | y/y/y | fixable |
| outdoor/outdoor_freeze_prevention | 9 | 10 (5/5) | $155–$272 | $30 | y/y/y | fixable |
| outdoor/outdoor_lake_season | 12 | 14 (6/8) | $1410–$2870 | $239 | —/—/— | fixable |
| universal/universal_owner_kit | 10 | 9 (5/4) | $295–$805 | $81 | y/y/y | fixable |
| universal/universal_project_prep | 7 | 7 (5/2) | $200–$830 | $119 | y/y/— | fixable |
| home_repair/home_moisture_control | 7 | 8 (4/4) | $480–$985 | $141 | y/y/y | launch-ready |
| mudroom/mudroom_entry_reset | 8 | 9 (5/4) | $220–$610 | $76 | y/y/y | launch-ready |
| outdoor/outdoor_dock_lake | 8 | 8 (4/4) | $190–$430 | $54 | y/y/y | launch-ready |
| outdoor/outdoor_seasonal_opening | 8 | 9 (5/4) | $295–$495 | $62 | y/y/y | launch-ready |

Credibility band used: $30/pick floor, $400/pick ceiling. Above ceiling = recalibrate or route to a pro.

### Universe inventory by topic

kitchen=50, outdoor=101, **bathroom=0, weatherization=0**, home_repair=30, universal=22, mudroom=19. Tier mix: budget=58, sweet_spot=108, premium=56. 3 mudroom-bench products have empty `functions: []` so no scope query can match them.

### Variant registry coverage

20 variants in registry / 14 flagged smartCartReady=true.

Ready + has catalog (13): kitchen_cosmetic_refresh, kitchen_cabinet_hardware_swap, outdoor_lake_season, outdoor_deck_refresh, outdoor_freeze_prevention, outdoor_seasonal_opening, outdoor_dock_lake, mudroom_entry_reset, home_moisture_control, home_water_quality, home_safety_kit, universal_owner_kit, universal_project_prep.

**Broken** — flagged ready but no catalog file: weatherization_diy_air_sealing.

**Mismatch** — catalog exists but variant flagged not-ready: kitchen_organizers.

**Backlog** (smartCartReady=false): kitchen_lighting_swap, kitchen_faucet_swap, weatherization_attic_basics, heat_pump_readiness_prep, bath_accessibility_basics.

**Topics in registry with ZERO variants**: solar_battery, addition_adu, rebate_strat, property_tax, flood_zone, rebate_eligibility, contractor_vetting, general_orientation, mud_season, well_septic.

### Bugs to fix this week

1. `weatherization_diy_air_sealing` ready=true but no catalog — any traffic 500s.
2. `kitchen_organizers` catalog exists but flag is false — flag stale or catalog shouldn't ship.
3. `home_water_quality` $636/pick savings — over the $400 credibility ceiling. Either recalibrate `amountSaved` numbers or split high-savings skips into a route-out (hire a water-quality pro for iron staining instead of selling whole-house filtration).
4. 6 Type-A skip items across 4 catalogs missing `amountSaved` — kills the user-visible "you would have spent $X" line.
5. 4 catalogs (all kitchen + outdoor_lake_season) missing scope-level smartCartPromise / valueProposition / routeOutRules — they predate v7.2.5 and never got the metadata layer.

### Strategic mismatch

Registry was built around consultative topics (septic, flood zone, rebate strategy) that drive content but not cart purchases. The high-volume retail home categories — garage, bathroom, windows, closet, office — are entirely uncovered. Inventory itself reflects this: 101 of 222 products are seasonal/lake-house outdoor.

### Retail-buyer scope recommendations

**Tier 1 — high-volume + perfect "refresh don't replace" fit:**

1. **garage/garage_organization** — wall systems, slat walls, overhead racks, tool/sports/bike storage, workbench. Top-100 perennial home query. Skip-list writes itself (Gladiator/monster systems vs $200 wall + hooks).
2. **bathroom/bathroom_refresh** — vanity org, shower caddies, towel/TP fixtures, mirrors, mats, hardware. Currently zero bathroom universe products. #2 retail home category after kitchen.
3. **windows/window_treatments** — rods, curtains, blinds, layered shades, blackout, hardware. Pure expression of the brand promise. Not in registry today.
4. **closet/closet_organization** — wire/wood shelving, shoe racks, hanging org, drawer systems. Same overbuy trap as kitchen (Container Store premium vs IKEA Pax + skip list).
5. **home_office/home_office_setup** — desk org, cable mgmt, monitor riser, ergonomic add-ons, task lighting. Post-2020 staple, high Amazon affiliate fit.

**Tier 2 — solid retail volume:**

6. laundry/laundry_room_reset — sorters, hampers, drying racks, shelving.
7. outdoor/patio_refresh_suburban — distinct from deck_refresh (assumes a deck) and lake_season (assumes a lake). Fills the suburban gap.
8. outdoor/backyard_yard_tools — clippers, shears, gloves, hose reels, raised beds, garden storage.
9. smart_home/smart_home_starter — plugs, doorbell, lights, sensors. High repeat-purchase.
10. pet/pet_setup — feeding stations, leash hooks, toy/food bins, gates. Cross-sells into mudroom + laundry.

**Sub-scope splits of existing variants (cheaper than new topics):**

- outdoor/dock_accessories — split from outdoor_dock_lake. Bumpers, cleats, ladder, dock box, rope/line storage, dock lights. Different intent ("buying for the dock") vs current scope.
- mudroom/mudroom_shoe_storage — bench + shoe trays + boot dryer. Absorbs the 3 orphan bench products.
- outdoor/outdoor_lighting — carve from deck/patio. String lights, path, post, motion. Easily 8 picks.
- kitchen/kitchen_pantry_overhaul — carve from organizers. Pull-outs, jars, lazy susans, labels. Own search universe.

**Kill list — remove from cart topic dropdown** (keep as content pages with separate funnels, not Smart Cart):

solar_battery, addition_adu, rebate_strat, property_tax, flood_zone, rebate_eligibility, contractor_vetting, general_orientation, mud_season, well_septic.

These dilute the topic UI and produce nothing in the cart funnel.

### Inventory work to launch Tier 1 (5 new scopes)

- ~120 new universe products (8 picks × 3 tiers × 5 scopes, ~50% reuse)
- ~30 new function tags in the universe taxonomy
- ~30–40 new Type-A skip items (retail premium-ladder traps are easy to source: Container Store, The Shade Store, Williams Sonoma equivalents)
- Roughly half the size of current 222-item universe
- Approximately doubles addressable retail funnel before touching Tier 2

### Recommended sequencing

1. Kill consultative topics from the cart dropdown (1-line `SCOPE_VARIANTS` change).
2. Fix the 3 launched-but-broken issues (weatherization no-catalog, kitchen_organizers flag, water_quality recalibration).
3. Add the 4 missing promise/valueProp/routeOut blocks to the legacy kitchen + lake catalogs.
4. Pilot scope: **garage_organization** — highest volume, cleanest thesis, easy skip-list, strong Amazon fit.
5. Then **bathroom_refresh** — highest brand-fit overlap with kitchen (same buyer, same trust mechanics).
6. Then **window_treatments** — purest expression of brand promise, almost no one does it well editorially.
