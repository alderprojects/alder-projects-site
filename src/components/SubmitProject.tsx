'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES=['Kitchen Remodel','Bathroom Renovation','Deck / Porch','Basement Finishing','Room Addition / Expansion','Roofing / Weatherization','Plumbing / HVAC','Electrical','Painting & Interior','Commercial Renovation','Other']
const BUDGET_BANDS=['Under $10,000','$10,000 – $25,000','$25,000 – $50,000','$50,000 – $100,000','$100,000 – $250,000','$250,000 – $500,000','Over $500,000','Not sure yet']
const TIMELINES=['Ready to start now','Within 1–3 months','Within 3–6 months','Within 6–12 months','Planning phase, 12+ months out','Flexible / not sure']
const PROPERTY_TYPES=['Single-family home','Multi-family / duplex','Condo / townhouse','Commercial property','Vacant land','Barn / agricultural','Other']
const FINANCING=['Cash / no financing needed','Pre-approved for financing','Exploring financing options','Not sure yet']
const JOURNEY_STAGES=['Exploring ideas','Making a plan (3–9 months out)','Ready to get project requests (within 90 days)']

type F={journeyStage:string;homeownerName:string;email:string;phone:string;town:string;zipCode:string;propertyType:string;category:string;budgetBand:string;timeline:string;financingStatus:string;plansReady:string;description:string}
const EMPTY:F={journeyStage:'',homeownerName:'',email:'',phone:'',town:'',zipCode:'',propertyType:'',category:'',budgetBand:'',timeline:'',financingStatus:'',plansReady:'',description:''}
const B:React.CSSProperties={width:'100%',backgroundColor:'rgba(45,74,42,0.4)',border:'1px solid rgba(122,155,111,0.25)',borderRadius:'2px',padding:'11px 14px',fontSize:'14px',color:'#F5EFE0',outline:'none',fontFamily:"'DM Sans',system-ui,sans-serif",boxSizing:'border-box' as const}
const L:React.CSSProperties={display:'block',fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase' as const,letterSpacing:'0.08em',color:'rgba(245,239,224,0.45)',marginBottom:'5px'}

export default function SubmitProject() {
  const router=useRouter()
  const [form,setForm]=useState<F>(EMPTY)
  const [status,setStatus]=useState<'idle'|'submitting'|'error'>('idle')
  const set=(k:keyof F)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setForm(p=>({...p,[k]:e.target.value}))
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setStatus('submitting')
    try{const r=await fetch('/api/submit-project',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});if(r.ok){router.push('/thanks')}else{setStatus('error')}}
    catch{setStatus('error')}
  }
  const Row2=({children}:{children:React.ReactNode})=>(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px'}}>{children}</div>)
  const Field=({label,req,children}:{label:string;req?:boolean;children:React.ReactNode})=>(<div><label style={L}>{label}{req?' *':''}</label>{children}</div>)
  const Sel=({val,onChange,placeholder,opts,required:req}:{val:string;onChange:any;placeholder:string;opts:string[];required?:boolean})=>(<select required={req} value={val} onChange={onChange} style={{...B,appearance:'none' as const}}><option value="" disabled>{placeholder}</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>)
  const isExploring=form.journeyStage==='Exploring ideas'
  return (
    <section id="submit-project" style={{backgroundColor:'#1C2B1A',padding:'clamp(56px,8vw,96px) 24px'}}>
      <div style={{maxWidth:'680px',margin:'0 auto'}}>
        <div style={{marginBottom:'36px'}}>
          <span style={{fontSize:'11px',fontFamily:'monospace',textTransform:'uppercase',letterSpacing:'0.1em',color:'#7A9B6F'}}>Free &middot; No Account Needed</span>
          <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(1.8rem,4vw,2.6rem)',fontWeight:600,color:'#F5EFE0',lineHeight:1.1,marginTop:'8px',marginBottom:'0'}}>Post your project request.</h2>
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <Field label="Where are you in your project?" req>
            <Sel required val={form.journeyStage} onChange={set('journeyStage')} placeholder="Select your stage…" opts={JOURNEY_STAGES} />
          </Field>
          {isExploring&&(<div style={{backgroundColor:'rgba(122,155,111,0.1)',border:'1px solid rgba(122,155,111,0.3)',borderRadius:'3px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}><p style={{color:'rgba(245,239,224,0.75)',fontSize:'13px',margin:0,lineHeight:1.5}}>Sounds like you&apos;re in early planning — our guide walks you through getting ready.</p><a href="/plan" style={{fontSize:'12px',fontFamily:'monospace',color:'#7A9B6F',textDecoration:'none',whiteSpace:'nowrap'}}>Start there &rarr;</a></div>)}
          <Row2><Field label="Your Name" req><input required type="text" placeholder="Jane Smith" value={form.homeownerName} onChange={set('homeownerName')} style={B}/></Field><Field label="Email" req><input required type="email" placeholder="jane@email.com" value={form.email} onChange={set('email')} style={B}/></Field></Row2>
          <Field label="Phone (optional)"><input type="tel" placeholder="(802) 555-0100" value={form.phone} onChange={set('phone')} style={B}/></Field>
          <Row2><Field label="Town" req><input required type="text" placeholder="Burlington, Stowe, Woodstock…" value={form.town} onChange={set('town')} style={B}/></Field><Field label="Zip Code" req><input required type="text" placeholder="05401" maxLength={5} value={form.zipCode} onChange={set('zipCode')} style={B}/></Field></Row2>
          <Field label="Property Type" req><Sel required val={form.propertyType} onChange={set('propertyType')} placeholder="Type of property…" opts={PROPERTY_TYPES}/></Field>
          <Field label="Project Type" req><Sel required val={form.category} onChange={set('category')} placeholder="What kind of work?" opts={CATEGORIES}/></Field>
          <Row2><Field label="Estimated Budget" req><Sel required val={form.budgetBand} onChange={set('budgetBand')} placeholder="Budget range…" opts={BUDGET_BANDS}/></Field><Field label="Timeline" req><Sel required val={form.timeline} onChange={set('timeline')} placeholder="When to start?" opts={TIMELINES}/></Field></Row2>
          <Row2><Field label="Financing Status"><Sel val={form.financingStatus} onChange={set('financingStatus')} placeholder="Financing situation…" opts={FINANCING}/></Field><Field label="Plans / Designs Ready?"><select value={form.plansReady} onChange={set('plansReady')} style={{...B,appearance:'none' as const}}><option value="">Select…</option><option value="Yes — stamped plans ready">Yes — stamped plans ready</option><option value="Preliminary drawings only">Preliminary drawings only</option><option value="No plans yet">No plans yet</option><option value="Not applicable">Not applicable</option></select></Field></Row2>
          <Field label="Project Description" req><textarea required rows={5} placeholder="Describe your project — scope, key details, site conditions, any special requirements…" value={form.description} onChange={set('description')} style={{...B,resize:'vertical'}}/></Field>
          <button type="submit" disabled={status==='submitting'} style={{padding:'15px 28px',backgroundColor:status==='submitting'?'rgba(200,115,42,0.5)':'#C8732A',color:'#FAF7F2',fontWeight:600,fontSize:'14px',border:'none',borderRadius:'2px',cursor:status==='submitting'?'not-allowed':'pointer',fontFamily:"'DM Sans',system-ui,sans-serif",marginTop:'4px'}}>
            {status==='submitting'?'Submitting…':'Submit Project Request →'}
          </button>
          {status==='error'&&<p style={{color:'#E87B7B',fontSize:'12px',fontFamily:'monospace',marginTop:'4px'}}>Something went wrong. Email hello@alderprojects.com directly.</p>}
          <p style={{color:'rgba(245,239,224,0.2)',fontSize:'11px',fontFamily:'monospace',marginTop:'4px'}}>We&apos;ll review your request and follow up by email within 1–2 business days. Your info is only shared with matched contractors.</p>
        </form>
      </div>
    </section>
  )
}