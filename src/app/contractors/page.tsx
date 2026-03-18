'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TRADES=['General Contractor','Carpenter / Finish Work','Kitchen & Bath Specialist','Deck & Outdoor Structures','Roofing','Plumbing','HVAC / Heating','Electrical','Painting & Interior','Basement Finishing','Masonry / Stonework','Insulation & Weatherization','Other']
const EXP=['Under 2 years','2-5 years','5-10 years','10-20 years','20+ years']
type F={name:string;businessName:string;email:string;phone:string;trade:string;yearsExp:string;insured:string;serviceArea:string}
const EMPTY:F={name:'',businessName:'',email:'',phone:'',trade:'',yearsExp:'',insured:'',serviceArea:''}
const I:React.CSSProperties={width:'100%',backgroundColor:'white',border:'1px solid rgba(28,43,26,0.18)',borderRadius:'3px',padding:'11px 14px',fontSize:'14px',color:'#1C2B1A',outline:'none',fontFamily:"'DM Sans',system-ui,sans-serif",boxSizing:'border-box' as const}
const L:React.CSSProperties={display:'block',fontSize:'12px',fontWeight:500,color:'rgba(28,43,26,0.55)',marginBottom:'5px'}

export default function ContractorsPage() {
  const router=useRouter()
  const [form,setForm]=useState<F>(EMPTY)
  const [status,setStatus]=useState<'idle'|'submitting'|'error'>('idle')
  const set=(k:keyof F)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setForm(p=>({...p,[k]:e.target.value}))
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setStatus('submitting')
    try{const r=await fetch('/api/contractors/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});if(r.ok){router.push('/contractors/welcome')}else{setStatus('error')}}
    catch{setStatus('error')}
  }
  const Row2=({children}:{children:React.ReactNode})=>(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>{children}</div>)
  const Field=({label,req,children}:{label:string;req?:boolean;children:React.ReactNode})=>(<div><label style={L}>{label}{req?' *':''}</label>{children}</div>)
  const faqs=[
    {q:'What do I see before deciding to accept a project request?',a:'Project type, town, scope description, and budget range. Full contact details are only released when you accept.'},
    {q:'What does a project request cost?',a:'A flat fee only when you accept. No subscription, no monthly charge, no fee for requests you decline.'},
    {q:'How are homeowners screened?',a:'Every submission is reviewed before it reaches you. We filter out vague or low-quality requests manually.'},
    {q:'Do I have to take every request?',a:'No. Each request is your call. There is no penalty for declining.'},
    {q:'What is the difference from Angi or HomeAdvisor?',a:'We do not sell the same request to every contractor on the platform. A small, matched set of contractors sees each project request — and you see details before paying anything.'},
  ]
  return (
    <div style={{minHeight:'100vh',backgroundColor:'#FAF7F2'}}>
      <header style={{backgroundColor:'#0D1A0B',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(122,155,111,0.12)'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none"><path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/><path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/></svg>
          <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'18px',fontWeight:600,color:'#F5EFE0'}}>Alder Projects</span>
          <span style={{fontSize:'11px',fontFamily:'monospace',color:'rgba(245,239,224,0.3)',marginLeft:'2px'}}>/ Contractors</span>
        </Link>
        <Link href="/" style={{fontSize:'12px',color:'rgba(245,239,224,0.4)',fontFamily:'monospace',textDecoration:'none'}}>&larr; Homeowner site</Link>
      </header>
      <div style={{backgroundColor:'#0D1A0B',padding:'clamp(48px,8vw,80px) 24px',borderBottom:'1px solid rgba(122,155,111,0.12)'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',textAlign:'center'}}>
          <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.14em',textTransform:'uppercase',color:'#7A9B6F'}}>For Vermont Contractors</span>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'10px',marginBottom:'14px'}}>
            Work with homeowners<br/><em style={{color:'#C8732A',fontStyle:'normal'}}>who are ready.</em>
          </h1>
          <p style={{color:'rgba(245,239,224,0.5)',fontSize:'16px',lineHeight:1.7,maxWidth:'480px',margin:'0 auto'}}>
            Alder Projects sends you project details before you commit to anything. You decide what fits your schedule and your trade.
          </p>
        </div>
      </div>
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'clamp(40px,6vw,64px) 24px 80px'}}>
        <div style={{marginBottom:'40px',padding:'28px 32px',backgroundColor:'white',borderRadius:'4px',border:'1px solid rgba(28,43,26,0.1)'}}>
          <p style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#C8732A',marginBottom:'12px'}}>How It Works</p>
          <p style={{fontSize:'15px',lineHeight:1.75,color:'rgba(28,43,26,0.75)',marginBottom:'16px'}}>
            Homeowners submit their project — scope, location, budget range, and timeline. We review each submission. If it matches your trade and service area, you see the project details. You decide whether to accept. You only pay when you do.
          </p>
          <p style={{fontSize:'13px',fontWeight:600,color:'#1C2B1A',marginBottom:'10px'}}>What you see before accepting:</p>
          <ul style={{margin:0,padding:'0 0 0 16px',color:'rgba(28,43,26,0.7)',fontSize:'14px',lineHeight:2}}>
            <li>Project type and scope description</li><li>Town and general location</li><li>Budget range and timeline</li>
          </ul>
          <p style={{marginTop:'18px',fontSize:'13px',fontFamily:'monospace',color:'rgba(28,43,26,0.45)',borderTop:'1px solid rgba(28,43,26,0.08)',paddingTop:'14px'}}>
            No subscription &middot; No monthly fee &middot; No cold leads &middot; Your first three project requests are free
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'14px',marginBottom:'40px'}}>
          {[{t:'You see details first',b:'Review the project before you pay for anything.'},{t:'No bidding wars',b:'A small matched set sees each request — not the whole platform.'},{t:'Vermont contractors only',b:'No out-of-state competition. Built for Vermont trades.'}].map(item=>(
            <div key={item.t} style={{padding:'20px',backgroundColor:'white',borderRadius:'3px',border:'1px solid rgba(28,43,26,0.08)'}}>
              <div style={{color:'#7A9B6F',fontSize:'16px',marginBottom:'6px'}}>&#10003;</div>
              <p style={{fontWeight:600,fontSize:'13px',color:'#1C2B1A',marginBottom:'4px'}}>{item.t}</p>
              <p style={{fontSize:'12px',color:'rgba(28,43,26,0.55)',lineHeight:1.55,margin:0}}>{item.b}</p>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'48px'}}>
          <p style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'rgba(28,43,26,0.4)',marginBottom:'16px'}}>Common Questions</p>
          {faqs.map((faq,i)=>(
            <div key={i} style={{borderTop:'1px solid rgba(28,43,26,0.08)',padding:'16px 0'}}>
              <p style={{fontWeight:600,fontSize:'14px',color:'#1C2B1A',marginBottom:'6px'}}>{faq.q}</p>
              <p style={{fontSize:'14px',color:'rgba(28,43,26,0.6)',lineHeight:1.65,margin:0}}>{faq.a}</p>
            </div>
          ))}
        </div>
        <div style={{borderTop:'2px solid #C8732A',paddingTop:'36px'}}>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'1.8rem',fontWeight:600,color:'#1C2B1A',marginBottom:'6px'}}>Apply to Join</h2>
          <p style={{fontSize:'14px',color:'rgba(28,43,26,0.5)',marginBottom:'28px'}}>We review every application and follow up by email within one business day.</p>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <Row2>
              <Field label="Your Name" req><input required type="text" placeholder="Jane Smith" value={form.name} onChange={set('name')} style={I}/></Field>
              <Field label="Business Name"><input type="text" placeholder="Smith Contracting LLC" value={form.businessName} onChange={set('businessName')} style={I}/></Field>
            </Row2>
            <Row2>
              <Field label="Email" req><input required type="email" placeholder="jane@smithcontracting.com" value={form.email} onChange={set('email')} style={I}/></Field>
              <Field label="Phone" req><input required type="tel" placeholder="(802) 555-0100" value={form.phone} onChange={set('phone')} style={I}/></Field>
            </Row2>
            <Field label="Primary Trade" req>
              <select required value={form.trade} onChange={set('trade')} style={{...I,appearance:'none' as const}}>
                <option value="" disabled>Select your primary trade...</option>
                {TRADES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Row2>
              <Field label="Years of Experience" req>
                <select required value={form.yearsExp} onChange={set('yearsExp')} style={{...I,appearance:'none' as const}}>
                  <option value="" disabled>Select...</option>
                  {EXP.map(e=><option key={e} value={e}>{e}</option>)}
                </select>
              </Field>
              <Field label="Fully Insured?" req>
                <select required value={form.insured} onChange={set('insured')} style={{...I,appearance:'none' as const}}>
                  <option value="" disabled>Select...</option>
                  <option value="Yes">Yes — liability + workers comp</option>
                  <option value="Liability only">Liability only</option>
                  <option value="No">Not currently insured</option>
                </select>
              </Field>
            </Row2>
            <Field label="Towns / Service Area" req>
              <textarea required rows={2} placeholder="e.g. Burlington, South Burlington, Williston, Shelburne, Essex..." value={form.serviceArea} onChange={set('serviceArea')} style={{...I,resize:'vertical'}}/>
            </Field>
            <button type="submit" disabled={status==='submitting'} style={{padding:'16px 32px',backgroundColor:status==='submitting'?'rgba(200,115,42,0.35)':'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'15px',border:'none',borderRadius:'3px',cursor:status==='submitting'?'not-allowed':'pointer',fontFamily:"'DM Sans',system-ui,sans-serif",marginTop:'8px'}}>
              {status==='submitting'?'Submitting...':'Apply to Join →'}
            </button>
            {status==='error'&&<p style={{color:'#C0392B',fontSize:'13px',fontFamily:'monospace'}}>Something went wrong. Email hello@alderprojects.com directly.</p>}
          </form>
        </div>
      </div>
    </div>
  )
}