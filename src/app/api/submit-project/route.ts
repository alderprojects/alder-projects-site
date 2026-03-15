import { NextRequest, NextResponse } from 'next/server'

// Vermont zip code -> county lookup
// Complete VT zip range map
const VT_ZIP_COUNTY: Record<string,string> = {
  // Addison
  '05401':'Chittenden','05402':'Chittenden','05403':'Chittenden','05404':'Chittenden',
  '05405':'Chittenden','05406':'Chittenden','05407':'Chittenden','05408':'Chittenden',
  '05439':'Chittenden','05440':'Franklin','05441':'Franklin','05442':'Lamoille',
  '05443':'Addison','05444':'Lamoille','05445':'Chittenden','05446':'Chittenden',
  '05447':'Franklin','05448':'Franklin','05449':'Chittenden','05450':'Franklin',
  '05451':'Chittenden','05452':'Chittenden','05453':'Chittenden','05454':'Franklin',
  '05455':'Franklin','05456':'Addison','05457':'Franklin','05458':'Grand Isle',
  '05459':'Grand Isle','05460':'Grand Isle','05461':'Chittenden','05462':'Chittenden',
  '05463':'Grand Isle','05464':'Lamoille','05465':'Chittenden','05466':'Addison',
  '05468':'Franklin','05469':'Addison','05470':'Addison','05471':'Essex',
  '05472':'Addison','05473':'Chittenden','05474':'Grand Isle','05475':'Franklin',
  '05476':'Orleans','05477':'Chittenden','05478':'Franklin','05479':'Orleans',
  '05481':'Franklin','05482':'Chittenden','05483':'Franklin','05485':'Lamoille',
  '05486':'Grand Isle','05487':'Addison','05488':'Franklin','05489':'Chittenden',
  '05491':'Addison','05492':'Franklin',
  // Washington
  '05601':'Washington','05602':'Washington','05603':'Washington','05604':'Washington',
  '05609':'Washington','05620':'Washington','05633':'Washington','05640':'Washington',
  '05641':'Washington','05647':'Washington','05648':'Washington','05649':'Washington',
  '05650':'Washington','05651':'Washington','05652':'Lamoille','05653':'Lamoille',
  '05654':'Washington','05655':'Lamoille','05656':'Lamoille','05657':'Lamoille',
  '05658':'Washington','05660':'Washington','05661':'Lamoille','05663':'Washington',
  '05664':'Washington','05665':'Lamoille','05666':'Washington','05667':'Washington',
  '05669':'Washington','05670':'Washington','05671':'Washington','05672':'Lamoille',
  '05673':'Washington','05674':'Washington','05675':'Washington','05676':'Washington',
  '05677':'Chittenden','05678':'Washington','05679':'Washington','05680':'Lamoille',
  '05681':'Lamoille','05682':'Chittenden',
  // Caledonia / Essex / Orleans
  '05819':'Caledonia','05820':'Orleans','05821':'Caledonia','05822':'Orleans',
  '05823':'Essex','05824':'Caledonia','05825':'Orleans','05826':'Caledonia',
  '05827':'Caledonia','05828':'Caledonia','05829':'Orleans','05830':'Essex',
  '05832':'Essex','05833':'Essex','05836':'Caledonia','05837':'Essex',
  '05838':'Caledonia','05839':'Orleans','05840':'Essex','05841':'Orleans',
  '05842':'Caledonia','05843':'Caledonia','05845':'Orleans','05846':'Essex',
  '05847':'Orleans','05848':'Essex','05849':'Caledonia','05850':'Caledonia',
  '05851':'Caledonia','05853':'Essex','05855':'Orleans','05857':'Orleans',
  '05858':'Essex','05859':'Orleans','05860':'Orleans','05861':'Orleans',
  '05862':'Orange','05863':'Caledonia','05866':'Orleans','05867':'Caledonia',
  '05868':'Orleans','05871':'Caledonia','05872':'Essex','05873':'Caledonia',
  '05874':'Orleans','05875':'Orleans','05876':'Caledonia','05878':'Orleans',
  // Orange
  '05001':'Windsor','05009':'Windsor','05030':'Windsor','05031':'Windsor',
  '05032':'Orange','05033':'Orange','05034':'Windsor','05035':'Windsor',
  '05036':'Orange','05037':'Windsor','05038':'Orange','05039':'Orange',
  '05040':'Orange','05041':'Orange','05042':'Caledonia','05043':'Orange',
  '05044':'Orange','05045':'Orange','05046':'Orange','05047':'Windsor',
  '05048':'Windsor','05049':'Windsor','05050':'Orange','05051':'Orange',
  '05052':'Windsor','05053':'Windsor','05054':'Windsor','05055':'Windsor',
  '05056':'Windsor','05058':'Orange','05059':'Windsor','05060':'Orange',
  '05061':'Orange','05062':'Windsor','05065':'Orange','05067':'Windsor',
  '05068':'Windsor','05069':'Orange','05070':'Windsor','05071':'Windsor',
  '05072':'Orange','05073':'Windsor','05074':'Orange','05075':'Orange',
  '05076':'Orange','05077':'Windsor','05079':'Orange',
  // Windsor / Windham
  '05101':'Windham','05141':'Windham','05142':'Windsor','05143':'Windsor',
  '05144':'Windsor','05146':'Windham','05148':'Windham','05149':'Windsor',
  '05150':'Windsor','05151':'Windsor','05152':'Bennington','05153':'Windsor',
  '05154':'Windham','05155':'Windham','05156':'Windsor','05158':'Windham',
  '05159':'Windsor','05160':'Windsor','05161':'Windsor',
  '05301':'Windham','05302':'Windham','05303':'Windham','05304':'Windham',
  '05340':'Windham','05341':'Windham','05342':'Windham','05343':'Windham',
  '05344':'Windham','05345':'Windham','05346':'Windham','05350':'Windham',
  '05351':'Windham','05352':'Bennington','05353':'Windham','05354':'Windham',
  '05355':'Windham','05356':'Windham','05357':'Windham','05358':'Windham',
  '05359':'Windsor','05360':'Windham','05361':'Windham','05362':'Windham',
  '05363':'Windham',
  // Bennington / Rutland
  '05201':'Bennington','05250':'Bennington','05251':'Bennington','05252':'Bennington',
  '05253':'Bennington','05254':'Bennington','05255':'Bennington','05257':'Bennington',
  '05260':'Bennington','05261':'Bennington','05262':'Bennington',
  '05701':'Rutland','05702':'Rutland','05730':'Rutland','05731':'Rutland',
  '05732':'Rutland','05733':'Addison','05734':'Addison','05735':'Rutland',
  '05736':'Rutland','05737':'Rutland','05738':'Rutland','05739':'Rutland',
  '05740':'Addison','05741':'Rutland','05742':'Rutland','05743':'Rutland',
  '05744':'Rutland','05745':'Rutland','05746':'Rutland','05747':'Rutland',
  '05748':'Addison','05749':'Addison','05750':'Rutland','05751':'Rutland',
  '05753':'Addison','05757':'Rutland','05758':'Rutland','05759':'Rutland',
  '05760':'Addison','05761':'Bennington','05762':'Rutland','05763':'Rutland',
  '05764':'Rutland','05765':'Rutland','05766':'Addison','05767':'Rutland',
  '05769':'Addison','05770':'Addison','05771':'Bennington','05772':'Rutland',
  '05773':'Bennington','05774':'Bennington','05775':'Bennington','05776':'Bennington',
  '05777':'Rutland','05778':'Addison',
}

function zipToCounty(zip: string): string {
  return VT_ZIP_COUNTY[zip?.trim()] || 'Unknown'
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const required = ['homeownerName','email','town','zipCode','propertyType','category','budgetBand','timeline','financingStatus','description']
    for (const f of required) {
      if (!b[f]) return NextResponse.json({ error: 'Missing: ' + f }, { status: 400 })
    }
    const now = new Date().toISOString()
    const leadId = 'LEAD-' + Date.now()
    // Derive county from zip — no need to ask the user
    const county = zipToCounty(b.zipCode)
    const row = [
      leadId, now, now, 'New',
      b.homeownerName, b.email, b.phone || '',
      b.town, b.zipCode, county,
      b.category, b.budgetBand, b.timeline, b.propertyType,
      b.financingStatus, b.plansReady || '', b.description,
    ]
    console.log('Lead:', leadId, b.homeownerName, b.town, county, b.category)
    const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, leadId, submittedAt: now, county, ...b })
      })
    }
    return NextResponse.json({ success: true, leadId }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
