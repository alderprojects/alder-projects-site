'use client'
import { useState } from 'react'
import Link from 'next/link'

const TRADES = ['General Contractor','Carpenter / Finish Work','Kitchen & Bath Specialist','Deck & Outdoor Structures','Roofing','Plumbing','HVAC / Heating','Electrical','Painting & Interior','Basement Finishing','Masonry / Stonework','Insulation & Weatherization','Other']
const EXP = ['Under 2 years','2-5 years','5-10 years','10-20 years','20+ years']

type F = {
  name:string; businessName:string; email:string; phone:string
  trade:string; yearsExp:string; insured:string; serviceArea:string
}
const EMPTY:F = {name:'',businessName:'',email:'',phone:'',trade:'',yearsExp:'',insured:'',serviceArea:''}

const I: React.CSSProperties = {width:'100%',backgroundColor:'white',border:'1px solid rgba(28,43,26,0.18)',borderRadius:'3px',padding:'11px 14px',fontSize:'14px',color:'#1C2B1A',outline:'none',fontFamily:"'DM Sans',system-ui,sans-serif",boxSizing:'border-box' as const}
const L: React.CSSProperties = {display:'block',fontSize:'12px',fontWeight:500,color:'rgba(28,43,26,0.55)',marginBottom:'5px'}

export default function ContractorsPage() {
  const [form, setForm] = useState<F>(EMPTY)
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')

  const set = (k:keyof F) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(p => ({...p, [k]: e.target.value}))

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const r = await fetch('/api/contractors/apply', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
      setStatus(r.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }

  if (status === 'success') return (
    <div style={{minHeight:'100vh',backgroundColor:'#0D1A0B',display:'flex',flexDirection:'column'}}>
      <Header />
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 24px'}}>
        <div style={{maxWidth:'480px',textAlign:'center'}}>
          <div style={{width:'56px',height:'56px',borderRadius:'50%',backgroundColor:'rgba(122,155,111,0.15)',border:'1px solid rgba(122,155,111,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',color:'#7A9B6F',fontSize:'24px'}}>&#10003;</div>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'2rem',color:'#F5EFE0',fontWeight:600,marginBottom:'14px'}}>You&apos;re in.</h2>
          <p style={{color:'rgba(245,239,224,0.6)',fontSize:'16px',lineHeight:1.7}}>
            {"We'll review your application and send your approval to "}<strong style={{color:'#F5EFE0'}}>{form.email}</strong>{" shortly. Keep an eye out — leads for your area come in fast."}
          </p>
          <Link href="/" style={{display:'inline-block',marginTop:'32px',fontSize:'13px',fontFamily:'monospace',color:'rgba(245,239,224,0.4)',textDecoration:'none'}}>
            &larr; Back to alderprojects.com
          </Link>
        </div>
      </div>
    </div>
  )

  const Row2 = ({children}:{children:React.ReactNode}) => (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>{children}</div>
  )
  const Field = ({label,req,children}:{label:string;req?:boolean;children:React.ReactNode}) => (
    <div><label style={L}>{label}{req ? ' *' : ''}</label>{children}</div>
  )

  return (
    <div style={{minHeight:'100vh',backgroundColor:'#FAF7F2'}}>
      <Header />

      <div style={{backgroundColor:'#0D1A0B',padding:'clamp(48px,8vw,80px) 24px',borderBottom:'1px solid rgba(122,155,111,0.12)'}}>
        <div style={{maxWidth:'600px',margin:'0 auto',textAlign:'center'}}>
          <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.14em',textTransform:'uppercase',color:'#7A9B6F'}}>Apply to Join</span>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'10px',marginBottom:'14px'}}>
            Get matched with Vermont<br/><em style={{color:'#C8732A',fontStyle:'normal'}}>renovation leads.</em>
          </h1>
          <p style={{color:'rgba(245,239,224,0.5)',fontSize:'16px',lineHeight:1.7,maxWidth:'480px',margin:'0 auto 28px'}}>
            Pre-screened homeowner projects matched to your trade and service area. Pay a flat fee per lead to receive full contact details — no subscription, no revenue share.
          </p>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'24px'}}>
            {['Vermont contractors only','Pay per lead received','No cold outreach'].map(t => (
              <div key={t} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'#7A9B6F',fontSize:'13px'}}>&#10003;</span>
                <span style={{color:'rgba(245,239,224,0.55)',fontSize:'14px'}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:'600px',margin:'0 auto',padding:'clamp(40px,6vw,64px) 24px 80px'}}>
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
              {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Row2>
            <Field label="Years of Experience" req>
              <select required value={form.yearsExp} onChange={set('yearsExp')} style={{...I,appearance:'none' as const}}>
                <option value="" disabled>Select...</option>
                {EXP.map(e => <option key={e} value={e}>{e}</option>)}
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
            {status==='submitting' ? 'Submitting...' : 'Apply to Join →'}
          </button>

          {status==='error' && <p style={{color:'#C0392B',fontSize:'13px',fontFamily:'monospace'}}>Something went wrong. Email hello@alderprojects.com directly.</p>}
          <p style={{fontSize:'11px',fontFamily:'monospace',color:'rgba(28,43,26,0.3)',textAlign:'center'}}>Takes about 2 minutes. We review and respond within one business day.</p>
        </form>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header style={{backgroundColor:'#0D1A0B',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(122,155,111,0.12)'}}>
      <Link href="/" style={{display:'flex',alignItems:'center',gap:'10px',textDecoration:'none'}}>
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L4 28H10L13 21H19L22 28H28L16 2Z" fill="#7A9B6F"/>
          <path d="M14.5 16L16 12L17.5 16H14.5Z" fill="#C8732A"/>
        </svg>
        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'18px',fontWeight:600,color:'#F5EFE0'}}>Alder Projects</span>
        <span style={{fontSize:'11px',fontFamily:'monospace',color:'rgba(245,239,224,0.3)',marginLeft:'2px'}}>/ Contractors</span>
      </Link>
      <Link href="/" style={{fontSize:'12px',color:'rgba(245,239,224,0.4)',fontFamily:'monospace',textDecoration:'none'}}>
        &larr; Homeowner site
      </Link>
    </header>
  )
}
