import type { SeasonalGuideContent } from '../templates/seasonal-guide-template'

// Pre-winter prep — Nov 1 through Dec 14. The transition from
// fall to deep winter. Heat pump installs scrambling, oil/propane
// fills, water-line winterization for second homes, the last
// window for many exterior projects.

export const PRE_WINTER_PREP_CONTENT: SeasonalGuideContent = {
  slug: 'pre-winter-prep',
  season: 'pre_winter',
  metaTitle: 'Vermont pre-winter prep — book contractors in August, not November',
  metaDescription: "Vermont's pre-winter window (Nov 1 - Dec 14) is contractor scramble season. Heat pump installs, second-home winterization, fuel deliveries. What to book in August, what to do this week.",
  h1: "Vermont pre-winter — what your contractor wishes you'd booked in August.",

  leadParagraph: "Your heat pump install booked in November is your contractor's emergency. They've already committed their crew to October installs. Pre-winter for them is a scramble to finish what was scheduled, not a window for new work. Book by August if you want a real schedule. The window from November 1 through December 14 is when winterization, fuel deliveries, and heat-system commissioning all compete for the same finite contractor pool.",

  sections: [
    {
      h2: 'The contractor scramble window',
      body: `By November 1, the year's heat-pump installs and weatherization projects scheduled for fall completion are mostly being finished. Contractors are working long days to close out work before frost makes air-sealing and insulation harder. New work bookings for the same season are unrealistic; new bookings for spring are getting locked in.

**Vermont-specific:** the EVT-network installer pipeline is at peak demand from October 15 through Thanksgiving. By December 1, the good crews are turning down emergencies — they're focused on closing the books on this year's projects and starting the deposit phase for next year.

**Trap:** the homeowner who calls in November for a January heat pump install. The good contractor is fully booked through end of December and starting January with prior-year January bookings. Calling in November for January is calling for the also-rans. **What to do:** if your heat pump or weatherization project needs to be done before next October, book by July. If you're calling in November, accept that you're booking for late spring 2027 at the earliest with a strong contractor.`,
    },
    {
      h2: 'Second-home winterization',
      body: `If your Vermont property is seasonal use, this is the window for closing it down. The sequence matters — turn the water off before you drain the system or you'll leave standing water in low spots that cracks pipes by January.

The actual close-down sequence: shut off main water valve, drain interior plumbing (open all faucets, flush toilets until tanks empty, drain water heater); blow out lines with compressed air or hire a plumber to do it; pour antifreeze into trap drains (kitchen sink, bath sinks, shower, washing machine, toilet bowls); set thermostat to 50°F minimum (not 45°F — the safety margin matters); disconnect and store outdoor hoses; drain water heater if you're going below freezing for extended periods.

**Vermont-specific:** standing water in P-traps is the leading cause of January insurance claims on Vermont second homes. RV-grade antifreeze in trap drains costs $20 in supplies and prevents a $5,000-15,000 burst-pipe cleanup.

**Trap:** the homeowner who drains the system and skips the antifreeze step. Even minor residual water in low spots freezes, expands, cracks. The fix isn't draining harder; the fix is antifreeze in every trap. **What to do:** if you're closing down a Vermont second home, hire a plumber for the first close-down to learn the sequence. $300-500 for the visit, including blowing out lines with compressed air. The DIY annual close-down after that is reliable.`,
    },
    {
      h2: 'Fuel delivery scheduling',
      body: `If you heat with oil or propane (most Vermont homes still do), pre-winter is the fuel-delivery window. Tanks should be at 75-80% by November 15. The local oil/propane delivery cooperatives book their delivery routes around early November, and topping off in early December often means waiting 1-2 weeks for a slot.

**Worth knowing:** Vermont oil and propane prices are typically lowest in late August through mid-October — the off-season when delivery trucks aren't competing with peak demand. Locking a fixed price in September often saves $0.20-0.40/gallon over December market rate.

**Vermont-specific:** the Vermont fuel cooperatives (Bourne's Energy, Suburban Propane Vermont, the various local oil suppliers) all run their pricing on the same regional supply contracts. Get quotes from 2-3 in August and lock the lowest rate.

**Trap:** the homeowner who waits for cold weather to "see if they need a fill" and then can't get a delivery slot for 10 days. Don't run a Vermont oil tank below 25% in November or December. The delivery delay turns a $300 fill into an emergency call at premium rate.`,
    },
    {
      h2: 'Heat system commissioning',
      body: `Whatever heat system you have, this is the window to verify it works. Before the first 0°F night, you want to know: the heat pump runs in low-temperature mode without throwing errors; the oil furnace fires cleanly without smoke or oily smell; the propane boiler maintains setpoint; backup electrical baseboards operate if needed.

**Worth knowing:** Vermont HVAC techs run a heating tune-up service for $150-250 in September-October. By November they're prioritizing emergency calls. By December, "tune-up" appointments are 2-3 week waits. **Vermont-specific:** if you're on heating oil with a 1990s-or-older furnace, schedule the annual tune-up by mid-October. Old furnaces with deferred maintenance fail catastrophically in January, not November.

**Trap:** the heat pump install completed in late October that nobody verifies in real cold-weather conditions until December. Most Vermont heat pumps are designed for -15°F operation, but the first time the system encounters that temperature is the test. If it throws errors, you want the contractor available — and they aren't, in mid-December. **What to do:** the week after install, run the heat pump aggressively to test all modes. If something feels wrong, call the contractor immediately while the install is still warm in their queue.`,
    },
    {
      h2: 'The last exterior project window',
      body: `Most Vermont exterior projects can't continue past mid-December. Frozen ground, snow accumulation, and frost depth limit the work that's possible. The pre-winter window — November 1 through Thanksgiving — is the last chance for many projects.

**Realistic in pre-winter:** roof repairs (if no snow), exterior caulking (above 40°F), small siding patches, deck refinishing (above 50°F day, no rain), final exterior paint (above 50°F, daylight hours). All of these get tighter as November progresses.

**Tough in pre-winter:** new construction (frost protection requires above-freezing days), foundation work (frost line concerns), septic install (DEC permits typically lapse, ground freezes, equipment access drops), driveway sealing (above 50°F + dry ground for 24 hours).

**Vermont-specific:** Vermont's frost depth runs 30-48 inches in normal winters. Foundation work that needs to extend below frost can't proceed once the ground is frozen — usually mid-to-late December at lower elevations, earlier at higher.

**Worth knowing:** if you have a project that absolutely must happen before winter, the contractor's quoted timeline is best-case. Add 1-2 weeks of buffer for weather delays. A "10-day" pre-winter project that hits a bad weather week becomes a 2-3 week project, often pushed past the realistic completion window.`,
    },
    {
      h2: 'EVT rebate paperwork before year-end',
      body: `If you've completed weatherization or heat pump work in 2026 and the contractor hasn't filed the rebate paperwork with EVT, this is the window to confirm. Rebates filed against 2026 funding need to be in EVT's queue before the year's pot is exhausted.

**Vermont-specific:** EVT's annual funding pot historically runs out in late November or early December. Projects completed in October typically have paperwork filed by mid-November; projects completed in late November are racing the clock.

**What to do:** by November 15, contact your contractor and ask for written confirmation that the EVT rebate paperwork has been submitted and acknowledged. The acknowledgment from EVT is what locks the rebate to the project. Without it, you're dependent on the contractor's record-keeping; with it, you have a paper trail.

**Trap:** assuming the contractor's "we'll handle the paperwork" means it's done. Some contractors batch rebate filings and submit at year-end. If the year-end submission is on December 28 and the funding pot ran out on December 1, you may not get the rebate. **Verify with** the contractor in writing.`,
    },
    {
      h2: 'The pre-winter shopping list',
      body: `Stock by November 1:

A pair of WiFi leak/freeze sensors near the water heater and primary plumbing manifold. The Govee 5-pack (~$50) covers a typical home; the Moen Flo (~$150) actively shuts off water on detection. A $30 sensor catches the leak that becomes the $8,000 cleanup.

A backup space heater for the room with the most plumbing or where guests sleep. Mr. Buddy Big Buddy (propane, $130) for power-outage situations; Lasko ceramic ($60) for normal supplemental heat. **Vermont-specific:** Vermont sees 1-3 multi-day power outages per winter. A backup heater + a propane tank stored properly is the difference between waiting comfortably and burst-pipe panic.

Two-stroke fuel stabilizer for any small engines being put away (snowblower, generator, lawnmower if not winterized). $8/bottle, used twice — once before storage, once when refilling for spring.

Driveway markers (the bright orange fiberglass kind) for the plow operator. $20 for 25 markers. Set them at the edges of your driveway and around obstacles before the first plow run. **Trap:** the homeowner who skips markers and ends up with $500-$2,000 in damage to landscape stones, mailboxes, or buried sprinkler heads from misjudged plow runs.

A pair of ice cleats or YakTrax for boots ($30-50). Vermont winters have a lot of unplanned outdoor moments — getting the mail, retrieving wood, walking to the truck. Once the icy walking starts (mid-December typically), cleats prevent the slip-and-fall that becomes a $5,000 emergency room visit.

**Worth knowing:** the pre-winter shopping list is mostly insurance. Most items are <$100; collectively they prevent $5,000-15,000 in winter-emergency costs.`,
    },
  ],

  faq: [
    {
      question: 'When should I book a Vermont heat pump install for next year?',
      answer: 'July or earlier. Calling in November for a January install is calling for the also-rans — the good contractors are fully booked through December and into spring with prior-year bookings. The strong installers fill 80%+ of their schedule from prior-year deposits.',
    },
    {
      question: 'How do I winterize my Vermont second home properly?',
      answer: "The sequence: shut off main water, drain interior plumbing, blow out lines with compressed air or hire a plumber, pour RV-grade antifreeze in every trap drain, set thermostat to 50°F minimum, disconnect outdoor hoses. Hire a plumber for the first close-down to learn the sequence; $300-500 for the visit.",
    },
    {
      question: 'When should I top off oil or propane?',
      answer: "By November 15, tanks should be at 75-80%. Vermont fuel prices are typically lowest in late August through mid-October. Lock a fixed price in September. Don't run below 25% in November-December — delivery delays turn $300 fills into emergency calls.",
    },
    {
      question: 'My heat pump was installed in October. Is there anything I should check before deep winter?',
      answer: "Run the heat pump aggressively the week after install to test all modes including low-temperature operation. If something feels wrong, call the contractor immediately — they're available now, less so in mid-December. Vermont heat pumps designed for -15°F operation should be verified before the first 0°F night.",
    },
    {
      question: 'When does the EVT rebate pot run out for 2026?',
      answer: "Historically late November or early December. By November 15, contact your contractor and ask for written confirmation that the EVT rebate paperwork has been submitted and acknowledged. The EVT acknowledgment is what locks the rebate to the project — without it, you're dependent on contractor record-keeping.",
    },
  ],

  factIds: [
    'evt-ducted-heat-pump-rebate',
    'evt-weatherization-standard-tier',
    'vt-heating-degree-days',
    'vt-cost-handyman-rate',
    'vt-cost-heat-pump-ducted',
  ],

  relatedGuideSlugs: [
    'winterizing-vermont-seasonal-home',
    'winterizing-lake-house-vermont',
    'heat-pump-rebates-vermont',
    'vermont-home-renovation-winter',
    'how-to-find-contractor-vermont',
  ],

  relatedTownSlugs: ['stowe-vt', 'st-johnsbury-vt', 'burlington-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
