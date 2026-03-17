import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
          const b = await req.json()
          const required = ['name','email','phone','trade','yearsExp','insured','serviceArea']
          for (const f of required) {
                  if (!b[f]) return NextResponse.json({ error: 'Missing: ' + f }, { status: 400 })
          }
          const now = new Date().toISOString()
          const contractorId = 'CT-' + Date.now()
          const webhook = process.env.CONTRACTOR_WEBHOOK_URL
          if (webhook) {
                  await fetch(webhook, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                        type: 'contractor',
                                        contractorId,
                                        submittedAt: now,
                                        status: 'Pending',
                                        name: b.name,
                                        businessName: b.businessName || '',
                                        email: b.email,
                                        phone: b.phone,
                                        trade: b.trade,
                                        yearsExp: b.yearsExp,
                                        insured: b.insured,
                                        serviceArea: b.serviceArea,
                            })
                  })
               i m}p
      o r t   {r eNteuxrtnR eNqeuxetsRte,s pNoenxsteR.ejsspoonn(s{e  s}u cfcreosms :' nterxute/,s ecrovnetrr'a
               c
               teoxrpIodr t} ,a s{y nsct aftuunsc:t i2o0n0  P}O)S
      T ( r}e qc:a tNcehx t(Reerqru)e s{t
                                        )   { 
                                          c otnrsyo l{e
                                                      . e r r ocro(nesrtr )b
                                                        =   a wraeittu rrne qN.ejxstoRne(s)p
                                                      o n s e .cjosnosnt( {r eeqruriorre:d  '=S e[r'vnearm ee'r,r'oerm'a i}l,' ,{' pshtoanteu's,:' t5r0a0d e}'),
                                          ' y e}a
                                          r}sExp','insured','serviceArea']
      for (const f of required) {
              if (!b[f]) return NextResponse.json({ error: 'Missing: ' + f }, { status: 400 })
      }
      const now = new Date().toISOString()
      const contractorId = 'CT-' + Date.now()
      const webhook = process.env.CONTRACTOR_WEBHOOK_URL
      if (webhook) {
              await fetch(webhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                                    type: 'contractor',
                                    contractorId,
                                    submittedAt: now,
                                    status: 'Pending',
                                    name: b.name,
                                    businessName: b.businessName || '',
                                    email: b.email,
                                    phone: b.phone,
                                    trade: b.trade,
                                    yearsExp: b.yearsExp,
                                    insured: b.insured,
                                    serviceArea: b.serviceArea,
                        })
              })
      }
      return NextResponse.json({ success: true, contractorId }, { status: 200 })
} catch (err) {
      console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
}
}
