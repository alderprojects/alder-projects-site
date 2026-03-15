'use client'
import { useState } from 'react'

const CATEGORIES = ['Kitchen Remodel','Bathroom Renovation','Deck / Porch','Basement Finishing','Room Addition / Expansion','Roofing / Weatherization','Plumbing / HVAC','Electrical','Painting & Interior','Commercial Renovation','Other']
const BUDGET_BANDS = ['Under $10,000','$10,000 – $25,000','$25,000 – $50,000','$50,000 – $100,000','$100,000 – $250,000','$250,000 – $500,000','Over $500,000','Not sure yet']
const TIMELINES = ['Ready to start now','Within 1–3 months','Within 3–6 months','Within 6–12 months','Planning phase, 12+ months out','Flexible / not sure']
const PROPERTY_TYPES = ['Single-family home','Multi-family / duplex','Condo / townhouse','Commercial property','Vacant land','Barn / agricultural','Other']
const FINANCING = ['Cash / no financing needed','Pre-approved for financing','Exploring financing options','Not sure yet']
const COUNTIES = ['Addison','Bennington','Caledonia','Chittenden','Essex','Franklin','Grand Isle','Lamoille','Orange','Orleans','Rutland','Washington','Windham','Windsor']

type F = {
  homeownerName:string; email:string; phone:string; town:string; zipCode:string; county:string;
  propertyType:string; category:string; budgetBand:string; timeline:string;
  financingStatus:string; plansReady:string; description:string
}
const EMPTY:F = {homeownerName:'',email:'',phone:'',town:'',zipCode:'',county:'',propertyType:'',category:'',budgetBand:'',timeline:'',financingStatus:'',plansReady:'',description:''}

const B: React.CSSProperties = {width:'100%',backgroundColor:'rgba(45,74,42,0.4)',border:'1px solid rgba(122,155,111,0.25)',borderRadius:'2px',padding:'11px 14px',fontSize:'14px',color:'#F5EFE0',outline:'none',fontFamily:"'DM Sans',system-ui,sans-serif",boxSizing:'border-box'}
const L: React.CSSProperties = {display:'block',fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.08em',color:'rgba(245,239,224,0.45)',marginBottom:'5px'}

export default function SubmitProject() {
  const [form,setForm] = useState<F>(EMPTY)
  const [status,setStatus] = useState<'idle'|'submitting'|'success'|'error'>('idle')
  const set = (k:keyof F) => (e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm(p=>({...p,[k]:e.target.value}))

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setStatus('submitting')
    try {
      const r = await fetch('/api/submit-project',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
      setStatus(r.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }

  if (status==='success') return (
    <section id="submit-project" style={{padding:'80px 24px',backgroundColor:'#1C2B1A'}}>
      <div style={{maxWidth:'520px',margin:'0 auto',textAlign:'center'}}>
        <div style={{width:'52px',height:'52px',borderRadius:'50%',backgroundColor:'rgba(122,155,111,0.15)',border:'1px solid rgba(122,155,111,0.4)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',color:'#7A9B6F',fontSize:'22px'}}>&#10003;</div>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.4rem)',color:'#F5EFE0',fontWeight:600,marginBottom:'14px'}}>Project received.</h2>
        <p style={{color:'rgba(245,239,224,0.6)',fontSize:'16px',lineHeight:1.65}}>{"We'll match your project with qualified Vermont contractors and follow up at "}<strong style={{color:'#F5EFE0'}}>{form.email}</strong>{" within 48 hours."}</p>
        <p style={{color:'rgba(245,239,224,0.3)',fontSize:'12px',fontFamily:'monospace',marginTop:'20px'}}>Questions? hello@alderprojects.com</p>
      </div>
    </section>
  )

  const Row2 = ({children}:{children:React.ReactNode}) => <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>{children}</div>
  const Field = ({label,req,children}:{label:string;req?:boolean;children:React.ReactNode}) => <div><label style={L}>{label}{req?' *':''}</label>{children}</div>
  const Sel = ({val,onChange,placeholder,opts}:{val:string;onChange:any;placeholder:string;opts:string[]}) => (
    <select required value={val} onChange={onChange} style={{...B,appearance:'none' as const}}>
      <option value="" disabled>{placeholder}</option>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <section id="submit-project" style={{padding:'clamp(56px,8vw,96px) 24px',backgroundColor:'#1C2B1A'}}>
      <div style={{maxWidth:'1152px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'48px',alignItems:'start'}}>
        <div style={{position:'sticky',top:'100px'}}>
          <span style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7A9B6F'}}>Free · No Account Needed</span>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.8rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'10px',marginBottom:'14px'}}>Post your<br/><em style={{color:'#C8732A',fontStyle:'normal'}}>project.</em></h2>
          <p style={{color:'rgba(245,239,224,0.5)',fontSize:'15px',lineHeight:1.7,maxWidth:'360px',marginBottom:'28px'}}>{"Describe your build. We'll match you with 2–4 vetted Vermont contractors within 48 hours. Always free."}</p>
          {['Vetted Vermont contractors only','No spam or cold calls','You choose who to work with'].map(t=>(
            <div key={t} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
              <span style={{color:'#7A9B6F',fontSize:'13px'}}>&#10003;</span>
              <span style={{color:'rgba(245,239,224,0.5)',fontSize:'14px'}}>{t}</span>
            </div>
          ))}
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <Row2>
            <Field label="Your Name" req><input required type="text" placeholder="Jane Smith" value={form.homeownerName} onChange={set('homeownerName')} style={B}/></Field>
            <Field label="Email" req><input required type="email" placeholder="jane@email.com" value={form.email} onChange={set('email')} style={B}/></Field>
          </Row2>
          <Field label="Phone (optional)"><input type="tel" placeholder="(802) 555-0100" value={form.phone} onChange={set('phone')} style={B}/></Field>
          <Row2>
            <Field label="Town" req><input required type="text" placeholder="Stowe" value={form.town} onChange={set('town')} style={B}/></Field>
            <Field label="Zip Code" req><input required type="text" placeholder="05672" maxLength={5} value={form.zipCode} onChange={set('zipCode')} style={B}/></Field>
          </Row2>
          <Field label="County" req><Sel val={form.county} onChange={set('county')} placeholder="Select your county…" opts={COUNTIES}/></Field>
          <Field label="Property Type" req><Sel val={form.propertyType} onChange={set('propertyType')} placeholder="Type of property…" opts={PROPERTY_TYPES}/></Field>
          <Field label="Project Type" req><Sel val={form.category} onChange={set('category')} placeholder="What kind of work?" opts={CATEGORIES}/></Field>
          <Row2>
            <Field label="Estimated Budget" req><Sel val={form.budgetBand} onChange={set('budgetBand')} placeholder="Budget range…" opts={BUDGET_BANDS}/></Field>
            <Field label="Timeline" req><Sel val={form.timeline} onChange={set('timeline')} placeholder="When to start?" opts={TIMELINES}/></Field>
          </Row2>
          <Row2>
            <Field label="Financing Status" req><Sel val={form.financingStatus} onChange={set('financingStatus')} placeholder="Financing situation…" opts={FINANCING}/></Field>
            <Field label="Plans / Designs Ready?">
              <select value={form.plansReady} onChange={set('plansReady')} style={{...B,appearance:'none' as const}}>
                <option value="">Select…</option>
                <option value="Yes — stamped plans ready">Yes — stamped plans ready</option>
                <option value="Preliminary drawings only">Preliminary drawings only</option>
                <option value="No plans yet">No plans yet</option>
                <option value="Not applicable">Not applicable</option>
              </select>
            </Field>
          </Row2>
          <Field label="Project Description" req>
            <textarea required rows={5} placeholder="Describe your project — scope, key details, site conditions, any special requirements…" value={form.description} onChange={set('description')} style={{...B,resize:'vertical'}}/>
          </Field>
          <button type="submit" disabled={status==='submitting'} style={{padding:'15px 28px',backgroundColor:status==='submitting'?'rgba(200,115,42,0.5)':'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'14px',border:'none',borderRadius:'2px',cursor:status==='submitting'?'not-allowed':'pointer',fontFamily:"'DM Sans',system-ui,sans-serif",marginTop:'4px'}}>
            {status==='submitting' ? 'Submitting…' : 'Submit Project & Get Matched →'}
          </button>
          {status==='error' && <p style={{color:'#E87B7B',fontSize:'12px',fontFamily:'monospace',marginTop:'4px'}}>Something went wrong. Email hello@alderprojects.com directly.</p>}
          <p style={{color:'rgba(245,239,224,0.2)',fontSize:'11px',fontFamily:'monospace',marginTop:'4px'}}>Your info is only shared with matched contractors.</p>
        </form>
      </div>
    </section>
  )
}
