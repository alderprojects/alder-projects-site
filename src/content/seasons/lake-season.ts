import type { SeasonalGuideContent } from '../templates/seasonal-guide-template'

// Lake season — June 15 through September 14. Vermont's premium
// outdoor-work window. Dock work, lake-access prep, contractor
// scheduling, second-home reopening, bug pressure (post-blackfly,
// pre-fall mosquito spike). The opening hook is contractor demand.

export const LAKE_SEASON_CONTENT: SeasonalGuideContent = {
  slug: 'lake-season',
  season: 'lake',
  metaTitle: 'Vermont lake season homeowner guide — what to do, when',
  metaDescription: "Vermont's lake season runs June 15 - September 14. Dock work, contractor scheduling, second-home prep. What it actually costs, what books up, what to do this week.",
  h1: "Vermont lake season — what books up, what costs more, what to do this week.",

  leadParagraph: "The dock goes in on Memorial Day weekend. The contractor schedule books out by mid-June. If you didn't have your project booked by April, you're competing for fall slots now. Lake season in Vermont is short, expensive, and crowded — the cost premium isn't a markup, it's the price of getting work done in the only 12-week window when most outdoor projects are physically possible.",

  sections: [
    {
      h2: 'When lake season actually starts and ends',
      body: `Vermont's lake season runs roughly June 15 through September 14. The boundaries are softer than mud season — they depend on water temperature, bug pressure, and the early-September turn toward shorter days.

The full window has three rhythms: early lake (mid-June through July 4) when water temps are still cold and crowds are light; peak lake (July 4 through Labor Day) when contractors are at full capacity and second-home owners are on-site; and late lake (Labor Day through mid-September) when crowds drop, water temps stay swimmable, and contractor availability briefly opens up before fall scheduling locks in.

**Vermont-specific:** Lake Champlain is open by mid-May for early-season boating but most of the inland lakes — Memphremagog, Bomoseen, the lakes around Greensboro/Hardwick — don't warm up enough for swimming until late June. The Lake Region (Caspian, Greensboro, Eden) often runs 1-2 weeks behind Lake Champlain timing.`,
    },
    {
      h2: 'The contractor demand peak',
      body: `Lake season is when most exterior contractor work happens, which means demand is highest. Roofing, siding, exterior paint, deck construction, dock work, septic installs, foundation work — all push to summer because the ground is dry, the weather cooperates, and the daylight hours are long.

**Trap:** the homeowner who calls in May for a July project and assumes a contractor will fit them in. By May, the good Vermont contractors have May, June, and July fully booked from work scheduled in the previous fall. Calling in May for July is calling for next-year's July, not this year's.

**What to do:** if you want lake-season exterior work in 2027, start the contractor search in October 2026. Sign by January 2027 to lock the slot. Pay the deposit when the contractor asks — that's how you confirm the booking. **Vermont-specific:** ask each bidder how many lake-season slots they fill from prior-year bookings vs. walk-in inquiries. Contractors who fill 80%+ from prior-year bookings are the ones whose schedules you cannot crash.`,
    },
    {
      h2: 'Dock and shoreline work',
      body: `Dock installation, repair, and shoreline maintenance is its own contractor specialty. Vermont's Shoreland Protection Act buffer (250 feet from any lake larger than 10 acres, per Vermont DEC) regulates anything done within the buffer.

**Vermont-specific:** any new dock, addition to a dock, change in shoreline armoring (riprap, retaining walls), or new impervious surface within the 250-foot shoreland buffer requires a Vermont DEC shoreland permit. The permit process runs 4-12 weeks. Many homeowners discover this when they sign a contract for a new dock, then learn the contractor needs to be DEC-permitted and the work is now scheduled for next summer.

**Trap:** the dock contractor who says "we don't need permits, we've done this for 20 years." Either they're lying or they're operating illegally. Vermont's shoreland rules tightened in 2014 — what was OK in 2010 isn't OK now. **Verify with** the Vermont DEC Lakes & Ponds program before signing any shoreline contract.

**What to do:** for new dock installation or shoreline work, plan 12-18 months ahead. Get the DEC shoreland permit submitted by October if you want a summer install the next year. Confirm contractor licensing and DEC permit experience before deposit.`,
    },
    {
      h2: "What costs more in lake season",
      body: `Most outdoor work runs at peak pricing. Specific premiums:

**Roofing** runs 10-20% above off-season rates because crews are at capacity and roofers can pick the most lucrative bids. **Vermont-specific:** Vermont's standing-seam metal roof market is supply-constrained — premium colors and approved historic-district profiles can run a 6-8 week wait on materials in lake season. Order materials in early spring, before crew schedules fully book.

**Septic install** runs at peak demand. The Vermont DEC issues most wastewater permits in spring and summer; conventional systems run $15,000-25,000 and engineered (mound) systems run $30,000-45,000. Add another 10-15% for lake-season scheduling premium.

**Deck construction** — composite decks at $15,000-40,000, pressure-treated at $8,000-18,000 — run summer-only because spring is too wet and fall too short for proper construction. Book by March for a summer install.

**Worth knowing:** interior work (kitchen, bath, basement finishing) runs at off-season pricing in lake season because the good interior crews aren't competing with exterior work. If you can do an interior project this summer, you can often get a stronger crew at lower rates than you would in November.`,
    },
    {
      h2: 'Second-home reopening',
      body: `If your Vermont property is a second home or seasonal use, lake season is when you reopen it. The reopening sequence matters — turn the water on before checking for leaks and you flood the basement.

The actual sequence: visual inspection of pipes and water heater first; pressure-test the supply lines before opening the main valve; check for evidence of mice or wildlife intrusion; inspect the dock from underneath before stepping on it; test the well water before drinking; verify the heat pump/HVAC system operates before the first hot day.

**Vermont-specific:** Vermont bedrock has naturally occurring arsenic in many wells. A $30 home test kit catches gross contamination; a full $300 lab panel catches the arsenic and bacteriological issues that go invisible. After 7-8 months of dormancy, a well needs testing before anyone drinks from it.

**Trap:** the dock that looks fine from shore and turns out to have a cracked crossbeam from ice heave that you don't see until someone falls through. Inspect dock structure from below before putting weight on it. Spring repair on an underground water intake line costs $2,000-$8,000 if cracked.`,
    },
    {
      h2: 'Lake-season project planning',
      body: `Plan around the demand cycle, not against it. Specific project paths:

**This year's lake season (already booked, or not):** if you have contractor commitments, ride them. If you don't, you're shopping the late-September / early-October shoulder for any exterior work. Push interior work into July-August when interior crews have capacity.

**Next year's lake season:** start contractor calls in October 2026. Have written bids by mid-January 2027. Sign by mid-February. Pay the deposit by March. The good crews will book up by April for the following summer.

**Two-year planning:** if your project includes shoreland buffer work (new dock, expanded patio within 250 feet of the lake), file the Vermont DEC shoreland permit a full year before construction. The permit process can run 12 weeks; with revisions and back-and-forth, it can run a year.

**Worth knowing:** EVT's Home Performance with ENERGY STAR weatherization rebate (75% of project cost, standard tier) is available year-round, but lake-season weatherization installs are 1-2 weeks faster than mid-winter installs because crews aren't fighting frozen exteriors. If you're stacking rebates and want fast turnaround, schedule for September-October.`,
    },
    {
      h2: 'The lake-season shopping list',
      body: `If you own or are reopening a Vermont lake property, the small purchases that prevent expensive problems:

A pair of Wi-Fi leak/freeze sensors near the water heater and primary plumbing manifold. A $30 sensor catches a leak in real-time and saves the $8,000-15,000 burst-pipe cleanup. The Govee 5-pack and Moen Flo are the two most common Vermont second-home owner picks.

A subfloor moisture meter for checking dock crossbeams and cottage floor systems for ice-heave damage. $40-80, used twice a year, replaces a $2,000 inspection visit.

A water test kit, both the $30 home version (basic bacteriological) and a $300 lab panel sent to UVM Extension or VT DEC for arsenic, lead, and full bacteriological. Test every spring at minimum.

A simple amp meter for verifying the well pump and HPWH are pulling expected current. $50-150. Catches a failing well pump before it fails completely.

**Worth knowing:** Vermont's lake-season hardware needs aren't the same as the national list. National "summer cottage" lists feature pool toys and BBQ accessories. Vermont's list is mostly "things that catch problems before they become $5,000 problems."`,
    },
  ],

  faq: [
    {
      question: 'When should I book a Vermont contractor for next summer?',
      answer: "October-November of the prior year. Get written bids by mid-January, sign by February, pay deposit by March. The good Vermont crews fill 80%+ of their summer schedule from prior-year bookings — by May, you're shopping the also-rans for the current summer.",
    },
    {
      question: "Do I need a Vermont state permit for new dock installation?",
      answer: 'Almost always yes if your lake is over 10 acres. Vermont\'s Shoreland Protection Act regulates new docks, additions, shoreline armoring, and new impervious surface within 250 feet of the lake. The DEC shoreland permit process runs 4-12 weeks. Contractors should be DEC-experienced — verify before signing.',
    },
    {
      question: 'How much does lake-season pricing add to a roof or deck project?',
      answer: 'Typically 10-20% above off-season rates because crews are at capacity. Materials for premium roofing colors or historic-district profiles can also run 6-8 week waits in lake season. Schedule materials and labor in early spring for the same-summer install.',
    },
    {
      question: 'What is the cheapest interior project I can do during lake season?',
      answer: "Anything that doesn't compete with exterior crews. Interior paint, kitchen refresh, basement finishing, and bathroom remodels often run at off-season rates in summer because the strong interior crews have spare capacity. Lake season is the wrong time for exterior premium projects and the right time for many interior ones.",
    },
    {
      question: 'When should I test my Vermont well after winter dormancy?',
      answer: "Within the first week of the seasonal reopening, before anyone drinks from it. Use a $30 home test kit for the basic bacteriological screen and order a $300 full lab panel through UVM Extension or VT DEC for arsenic and lead. Vermont bedrock has naturally occurring arsenic in many wells.",
    },
  ],

  factIds: [
    'vt-shoreland-buffer',
    'evt-weatherization-standard-tier',
    'vt-cost-deck-pt',
    'vt-cost-deck-composite',
    'vt-cost-roof-asphalt',
    'vt-cost-roof-standing-seam',
    'vt-cost-septic-conventional',
    'vt-cost-septic-engineered',
  ],

  relatedGuideSlugs: [
    'opening-lake-house-summer-vermont',
    'winterizing-lake-house-vermont',
    'how-much-does-a-deck-cost-vermont',
    'how-much-does-roof-replacement-cost-vermont',
    'vermont-septic-what-to-know',
    'vermont-flood-zone-renovation',
  ],

  relatedTownSlugs: ['stowe-vt', 'burlington-vt', 'vergennes-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
