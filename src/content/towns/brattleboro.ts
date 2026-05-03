import type { TownPageContent } from '../templates/town-page-template'

// Brattleboro — small_city tier. Connecticut River flood zone
// covers more of the town than buyers expect. Mix of historic
// downtown and rural outskirts. Vermont's most southern small
// city, closer to MA contractor markets in some respects.

export const BRATTLEBORO_CONTENT: TownPageContent = {
  slug: 'brattleboro-vt',
  townName: 'Brattleboro',
  county: 'Windham County',
  townTier: 'small_city',
  utility: 'Green Mountain Power (GMP)',
  population: 7263,
  medianHomeValue: 295000,

  metaTitle: 'Brattleboro, VT property guide — flood zone reality, costs, contractors',
  metaDescription: "Connecticut River floodplain covers more of Brattleboro than buyers expect. What it actually costs to renovate, weatherize, and flood-proof a Brattleboro property in 2026.",
  h1: "Brattleboro, Vermont — Connecticut River floodplain reality.",

  leadParagraph: "Connecticut River flood zone covers more of the town than most buyers expect. Properties along Putney Road, the West Brattleboro flats, and parts of downtown sit inside the FEMA-mapped floodplain. The substantial improvement rule (50% of building value triggering compliance with current floodplain regs) catches plenty of homeowners mid-renovation. Get an elevation certificate before bid review.",

  sections: [
    {
      h2: "Connecticut River flood reality",
      body: `Brattleboro's geography puts a lot of housing stock in the floodplain. The Connecticut River, the West River (which joins just upstream), and the Whetstone Brook all carry serious volume during spring melt and tropical storm events. The 2011 Irene flooding and the 2023 July floods both hit Brattleboro.

**Vermont-specific:** the FEMA flood zone in Brattleboro is mapped and current — get the elevation certificate ($300-600) for any property purchase or significant renovation.

**Trap:** the renovation that pushes a Brattleboro flood-zone property over the 50% substantial improvement threshold. If the project cost exceeds 50% of the building's pre-improvement market value (building, not land), the entire structure must be brought into current floodplain compliance — typically, raising the building above base flood elevation. A $50,000 renovation on an $85,000-assessed-value home triggers the rule.

**What to do:** order the elevation certificate before bid review, so your contractor knows whether the project as scoped pushes you over the threshold. Phasing can keep you under. So can scope reduction. The expensive surprise is mid-renovation discovery.`,
    },
    {
      h2: "Two-state market dynamics",
      body: `Brattleboro is 10 minutes from Massachusetts. Some homeowners hire MA-based contractors for cost or schedule reasons. Some MA contractors work routinely in Brattleboro.

**Trap:** the MA-licensed contractor who isn't registered with the Vermont AG's Consumer Assistance Program for residential work over $3,500. Vermont law requires that registration regardless of where the contractor is based. Working with an unregistered contractor on a $3,500+ project costs you most of your consumer protections under Vermont law.

**What to do:** ask any MA-based contractor for proof of Vermont AG CAP registration. Free and quick to verify. Refusing to register or claiming "we don't need to because we're MA" is a red flag — it means they don't know Vermont law or are willing to skip a step that protects you.`,
    },
    {
      h2: "Project costs in Brattleboro",
      body: `Brattleboro runs at statewide median for the small_city tier. Some categories trend toward the rural-discount range because Windham County labor rates run lower than Chittenden or Lamoille. As of mid-2026:

**Kitchen remodel** — $32,000-58,000 mid-range. Lower bound runs slightly under Vergennes/Middlebury because of the wider Windham/Cheshire county labor pool.

**Bathroom remodel** — $11,000-23,000 mid-range.

**Heat pump install** — $10,000-20,000 ducted, $3,200-5,200 single-zone ductless. EVT $2,200 ducted rebate, GMP $2,000-per-condenser income-eligible bonus apply. Stack with $400 fuel-switching bonus.

**Whole-home weatherization** — $4,000-15,000. Brattleboro's mix of 1850-1920 and 1950-1970 housing stock means weatherization scope varies — get a free EVT energy audit to scope correctly.

**Roof replacement** — $7,500-18,000 asphalt, $18,000-32,000 standing seam metal. **Worth knowing:** snow loads in Brattleboro are lower than central/northern Vermont, so the cost premium for snow-load engineering is smaller than what Stowe or Woodstock contractors charge.`,
    },
    {
      h2: "When mud season ends in southern Vermont",
      body: `Brattleboro's mud season ends 1-2 weeks earlier than central Vermont — typically late April rather than mid-May. The southern Vermont thaw runs ahead of the rest of the state.

**Worth knowing:** if you're scheduling exterior contractor work, Brattleboro contractors can often start in late April when central Vermont crews are still grounded by mud. The shoulder season here is real.

**Trap:** assuming Brattleboro mud season constraints don't matter because the climate is "milder." Brattleboro's hill towns (West Brattleboro, the Putney-side ridges) still have full mud season. The downtown valley ends earlier than the surrounding hills. Confirm with the contractor whether your specific lot is on the early-thaw side or the late-thaw side.`,
    },
  ],

  faq: [
    {
      question: 'How much of Brattleboro is in the FEMA flood zone?',
      answer: "More than buyers expect. Properties along Putney Road, the West Brattleboro flats, parts of downtown, and along the Whetstone Brook can fall inside Zone AE or Zone A. Get an elevation certificate ($300-600) before any significant renovation to know whether the 50% substantial improvement rule applies.",
    },
    {
      question: 'Can I hire a Massachusetts-based contractor for work in Brattleboro?',
      answer: "Legally yes, but they must register with the Vermont AG's Consumer Assistance Program for residential work $3,500+. Verify the registration before signing. Working with an unregistered contractor — Vermont- or MA-based — costs you most of your Vermont consumer protections.",
    },
    {
      question: "Does mud season end earlier in Brattleboro than the rest of Vermont?",
      answer: "Typically yes — late April in the valley, mid-May in the hill towns. Brattleboro contractors often start exterior work 1-2 weeks before central Vermont crews. Confirm with your contractor whether your specific lot is on the early-thaw or late-thaw side of town.",
    },
    {
      question: "Are heat pump rebates the same in Brattleboro as elsewhere in Vermont?",
      answer: "Yes — EVT statewide rebates apply ($2,200 ducted, $475 per ductless head, $400 fuel-switching). Brattleboro is in GMP territory, so the $2,000-per-condenser income-eligible bonus stacks. Verify income eligibility with the installer when they file the rebate paperwork.",
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-ductless-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-weatherization-standard-tier',
    'gmp-heat-pump-income-bonus',
    'vt-cost-elevation-cert',
    'vt-contractor-registration-threshold',
    'vt-mud-season-window',
  ],

  relatedGuideSlugs: [
    'vermont-flood-zone-renovation',
    'heat-pump-rebates-vermont',
    'vermont-contractor-red-flags',
    'how-much-does-kitchen-remodel-cost-vermont',
    'vermont-renovation-permit-guide',
  ],

  relatedServiceSlugs: [],

  sampleAddress: 'Main Street, Brattleboro, VT',
  samplePropertySlug: 'main-street-brattleboro-vt',

  verifyDate: '2026-05-03',
}
