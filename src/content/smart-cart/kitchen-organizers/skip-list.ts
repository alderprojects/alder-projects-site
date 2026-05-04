// V7.2.1 — kitchen_organizers skip list.
//
// Type A (wrong_version) entries name the marketing pitch and the
// real reason the version-up doesn't earn its dollar; they carry
// dollar-saved ranges that feed the savings math.
//
// Type B (wrong_category) entries name a category that doesn't earn
// a slot at all in this scope; no dollar amount because the savings
// math doesn't price what you wouldn't have bought.

import type { SkipItemV2 } from '@/lib/smart-cart-model'

export const KITCHEN_ORGANIZERS_SKIP_LIST: SkipItemV2[] = [
  // ===== TYPE A — Wrong version =====================================
  {
    id: 'skip_premium_dividers',
    type: 'wrong_version',
    title: 'Container Store premium drawer dividers',
    marketingPitch: 'Beautiful bamboo, premium feel, perfect fit',
    realReason:
      'Functionally identical to the $25 Pipishell. The Kitchn ranked the cheaper one higher for daily use. You are paying $40 extra per drawer for an aesthetic upgrade nobody but you sees.',
    amountSaved: { low: 35, high: 50 },
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_two_tier_pullout',
    type: 'wrong_version',
    title: 'Rev-A-Shelf two-tier pullout (when you only need one)',
    marketingPitch: 'Doubles your cabinet capacity',
    realReason:
      'Two tiers is great if your cabinet has 24+ inches of vertical clearance. Most under-counter cabinets are 22-24 inches tall — once you fit the second tier and account for what you are storing, the top tier sits empty or holds things you cannot reach. The HOLDN STORAGE single-tier does the actual work for $40 less.',
    amountSaved: { low: 40, high: 65 },
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_spice_kit_with_jars',
    type: 'wrong_version',
    title: 'SpaceAid bamboo spice drawer with jars + labels kit',
    marketingPitch: 'Complete starter kit, 28 jars and 386 labels',
    realReason:
      'The jars are the upcharge. Standard Penzeys / Trader Joes / store-brand spice jars fit the $25 organizer fine. The kit prices the same organizer at $50+ because of jars you do not need. If your spices are already in jars, buy the organizer alone.',
    amountSaved: { low: 25, high: 30 },
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_kraftmaid_drop_in',
    type: 'wrong_version',
    title: 'KraftMaid (or any cabinet-shop-branded) spice insert',
    marketingPitch: 'Custom fit, perfect drawer match',
    realReason:
      'Makes sense only if you are doing a KraftMaid kitchen install — these are designed for one cabinet brand and dimensioned exactly. If you are retrofitting an existing kitchen, the expandable bamboo fits the same drawers without trim work or template knowledge.',
    amountSaved: { low: 70, high: 95 },
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_williams_sonoma_kit',
    type: 'wrong_version',
    title: 'Williams Sonoma / Crate & Barrel branded organization starter kit',
    marketingPitch: 'Curated set of 12 essential pieces',
    realReason:
      'These kits include 3-4 things you need (cutlery tray, dividers, pantry basket) and 8-9 things you do not (specialty cookbook stand, decorative bin set, branded labels). You pay $180-250 for $90 of useful items. Build your own kit from the lean cart.',
    amountSaved: { low: 90, high: 160 },
    appliesToScope: ['kitchen_organizers'],
  },

  // ===== TYPE B — Wrong category ====================================
  {
    id: 'skip_acrylic',
    type: 'wrong_category',
    title: 'Acrylic everything',
    realReason:
      'Premium clear acrylic looks great in social media photos and yellows in 18 months. Reviews on every acrylic spice rack flag the same thing: it scratches, holds spice dust visibly, and discolors near the stove from heat exposure. The $30 acrylic spice rack becomes a $30 cloudy spice rack. Bamboo and steel age better.',
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_brand_specific_organizers',
    type: 'wrong_category',
    title: 'Made for IKEA or fits Wayfair specialty organizers',
    realReason:
      'These are sized for one cabinet brand and one model line. Most kitchens are not those brands. The fit ranges advertised are aspirational — Tasting Table notes IKEA UTRUSTA baskets need DIY modification to work in non-IKEA cabinets.',
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_fridge_freshness_systems',
    type: 'wrong_category',
    title: 'Shelf-life-extending fridge organization systems',
    realReason:
      'Berry produce keepers, herb tubes, "stays fresh 3x longer" pods — most are tested in lab humidity that does not match a home fridge. Cheaper to wrap herbs in damp paper towels in a regular bin.',
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_subscription_organization',
    type: 'wrong_category',
    title: 'Subscription organization services',
    realReason:
      'Anything that auto-ships you "more organizers" monthly is a category mistake. You do not need refills.',
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_aesthetic_bins_for_active_items',
    type: 'wrong_category',
    title: 'Aesthetic bins for items you use weekly',
    realReason:
      'Bamboo bins with metal handles look great but the items inside become invisible. If you use it weekly, store it where you can see it. Aesthetic bins are for closets, not active kitchens.',
    appliesToScope: ['kitchen_organizers'],
  },
  {
    id: 'skip_junk_drawer_kit',
    type: 'wrong_category',
    title: 'Junk drawer kits',
    realReason:
      'A $40 kit of trays for a junk drawer defeats the point of a junk drawer. Buy nothing for that drawer; the chaos is the feature.',
    appliesToScope: ['kitchen_organizers'],
  },
]
