'use client'
import { useState } from 'react'
import Link from 'next/link'

const TRADES = ['General Contractor','Carpenter / Finish Work','Kitchen & Bath Specialist','Deck & Outdoor Structures','Roofing','Plumbing','HVAC / Heating','Electrical','Painting & Interior','Basement Finishing','Masonry / Stonework','Insulation & Weatherization','Other']
const COUNTIES = ['Addison','Bennington','Caledonia','Chittenden','Essex','Franklin','Grand Isle','Lamoille','Orange','Orleans','Rutland','Washington','Windham','Windsor']
const EXP = ['1-2 years','3-5 years','6-10 years','10-20 years','20+ years']

type F = {
  name:string; businessName:string; email:string; phone:string
  trade:string; otherTrade:string; yearsExp:string; insured:string
  licenseNumber:string; counties:string[]; website:string; notes:string
}
const EMPTY:F = {name:'',businessName:'',email:'',phone:'',trade:'',otherTrade:'',yearsExp:'',insured:'',licenseNumber:'',counties:[],website:'',notes:''}

const I: React.CSSProperties = {width:'100%',backgroundColor:'white',border:'1px solid rgba(28,43,26,0.18)',borderRadius:'3px',padding:'11px 14px',fontSize:'14px',color:'#1C2B1A',outline:'none',fontFamily:"'DM Sans',system-ui,sans-serif",boxSizing:'border-box' as const}
const L: React.CSSProperties = {display:'block',fontSize:'12px',fontWeight:500,color:'rgba(28,43,26,0.55)',marginBottom:'5px'}

export default function ContractorsPage() {
  const [form, setForm] = useState<F>(EMPTY)
  const [status, setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')

  const set = (k:keyof F) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(p => ({...p, [k]: e.target.value}))

  const toggleCounty = (c:string) =>
    setForm(p => ({...p, counties: p.counties.includes(c) ? p.counties.filter(x=>x!==c) : [...p.counties, c]}))

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if (form.counties.length === 0) return
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
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'2rem',color:'#F5EFE0',fontWeight:600,marginBottom:'14px'}}>Application received.</h2>
          <p style={{color:'rgba(245,239,224,0.6)',fontSize:'16px',lineHeight:1.7}}>{"We'll review your application and reach out to "}<strong style={{color:'#F5EFE0'}}>{form.email}</strong>{" within a few business days."}</p>
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

      {/* Dark hero */}
      <div style={{backgroundColor:'#0D1A0B',padding:'clamp(48px,8vw,80px) 24px',borderBottom:'1px solid rgba(122,155,111,0.12)'}}>
        <div style={{maxWidth:'640px',margin:'0 auto',textAlign:'center'}}>
          <span style={{fontSize:'10px',fontFamily:'monospace',letterSpacing:'0.14em',textTransform:'uppercase',color:'#7A9B6F'}}>Apply to Join</span>
          <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'10px',marginBottom:'14px'}}>
            Get matched with Vermont<br/><em style={{color:'#C8732A',fontStyle:'normal'}}>renovation leads.</em>
          </h1>
          <p style={{color:'rgba(245,239,224,0.5)',fontSize:'16px',lineHeight:1.7,maxWidth:'480px',margin:'0 auto 28px'}}>
            Join Vermont&apos;s renovation network. Pre-screened homeowner projects matched to contractors by county and trade. No subscription — pay only when you win a job.
          </p>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:'24px'}}>
            {['Vermont contractors only','Pay per job won','2-4 leads per match'].map(t => (
              <div key={t} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'#7A9B6F',fontSize:'13px'}}>&#10003;</span>
                <span style={{color:'rgba(245,239,224,0.55)',fontSize:'14px'}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'clamp(40px,6vw,64px) 24px 80px'}}>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'28px'}}>

          {/* Section 1 */}
          <div>
            <p style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.12em',color:'#C8732A',marginBottom:'16px',paddingBottom:'10px',borderBottom:'1px solid rgba(28,43,26,0.1)'}}>01 — Contact Info</p>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <Row2>
                <Field label="Your Name" req><input required type="text" placeholder="Jane Smith" value={form.name} onChange={set('name')} style={I}/></Field>
                <Field label="Business Name"><input type="text" placeholder="Smith Contracting LLC" value={form.businessName} onChange={set('businessName')} style={I}/></Field>
              </Row2>
              <Row2>
                <Field label="Email" req><input required type="email" placeholder="jane@smithcontracting.com" value={form.email} onChange={set('email')} style={I}/></Field>
                <Field label="Phone" req><input required type="tel" placeholder="(802) 555-0100" value={form.phone} onChange={set('phone')} style={I}/></Field>
              </Row2>
              <Field label="Website (optional)"><input type="url" placeholder="https://smithcontracting.com" value={form.website} onChange={set('website')} style={I}/></Field>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <p style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.12em',color:'#C8732A',marginBottom:'16px',paddingBottom:'10px',borderBottom:'1px solid rgba(28,43,26,0.1)'}}>02 — Your Trade</p>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <Field label="Primary Trade" req>
                <select required value={form.trade} onChange={set('trade')} style={{...I,appearance:'none' as const}}>
                  <option value="" disabled>Select your primary trade...</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              {form.trade === 'Other' && (
                <Field label="Describe your trade" req>
                  <input required type="text" placeholder="e.g. Tile & Flooring" value={form.otherTrade} onChange={set('otherTrade')} style={I}/>
                </Field>
              )}
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
                    <option value="Yes — liability + workers comp">Yes — liability + workers comp</option>
                    <option value="Liability only">Liability only</option>
                    <option value="Not currently insured">Not currently insured</option>
                  </select>
                </Field>
              </Row2>
              <Field label="VT License / Registration # (if applicable)">
                <input type="text" placeholder="e.g. 057-0123456" value={form.licenseNumber} onChange={set('licenseNumber')} style={I}/>
              </Field>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <p style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.12em',color:'#C8732A',marginBottom:'8px',paddingBottom:'10px',borderBottom:'1px solid rgba(28,43,26,0.1)'}}>03 — Counties You Serve *</p>
            <p style={{fontSize:'13px',color:'rgba(28,43,26,0.45)',marginBottom:'14px'}}>Select all counties where you actively take on work.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:'8px'}}>
              {COUNTIES.map(county => (
                <label key={county} style={{display:'flex',alignItems:'center',gap:'8px',padding:'9px 12px',backgroundColor:form.counties.includes(county)?'#1C2B1A':'white',border:form.counties.includes(county)?'1px solid #1C2B1A':'1px solid rgba(28,43,26,0.15)',borderRadius:'3px',cursor:'pointer'}}>
                  <input type="checkbox" checked={form.counties.includes(county)} onChange={()=>toggleCounty(county)} style={{accentColor:'#C8732A',width:'14px',height:'14px'}}/>
                  <span style={{fontSize:'13px',fontWeight:500,color:form.counties.includes(county)?'#F5EFE0':'#1C2B1A'}}>{county}</span>
                </label>
              ))}
            </div>
            {form.counties.length===0 && <p style={{fontSize:'12px',color:'#C8732A',marginTop:'8px',fontFamily:'monospace'}}>Select at least one county to continue.</p>}
          </div>

          {/* Section 4 */}
          <div>
            <p style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.12em',color:'#C8732A',marginBottom:'16px',paddingBottom:'10px',borderBottom:'1px solid rgba(28,43,26,0.1)'}}>04 — Anything Else?</p>
            <Field label="Tell us about your business (optional)">
              <textarea rows={4} placeholder="Specialties, typical project size, certifications, what makes you stand out in Vermont..." value={form.notes} onChange={set('notes')} style={{...I,resize:'vertical'}}/>
            </Field>
          </div>

          <button
            type="submit"
            disabled={status==='submitting' || form.counties.length===0}
            style={{padding:'16px 32px',backgroundColor:status==='submitting'||form.counties.length===0?'rgba(200,115,42,0.35)':'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'15px',border:'none',borderRadius:'3px',cursor:status==='submitting'||form.counties.length===0?'not-allowed':'pointer',fontFamily:"'DM Sans',system-ui,sans-serif"}}
          >
            {status==='submitting' ? 'Submitting...' : 'Submit Application →'}
          </button>

          {status==='error' && <p style={{color:'#C0392B',fontSize:'13px',fontFamily:'monospace'}}>Something went wrong. Email hello@alderprojects.com directly.</p>}
          <p style={{fontSize:'11px',fontFamily:'monospace',color:'rgba(28,43,26,0.3)',textAlign:'center'}}>Applications reviewed manually. We&apos;ll be in touch within 2-3 business days.</p>
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
