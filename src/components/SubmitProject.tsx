'use client'
import { useState } from 'react'
const PT = ['New Home Construction','Home Renovation','Addition / Expansion','Commercial Build-Out','Roofing / Weatherization','Deck / Porch','Plumbing / HVAC','Electrical','Other']
const VT = ['Addison','Bennington','Caledonia','Chittenden','Essex','Franklin','Grand Isle','Lamoille','Orange','Orleans','Rutland','Washington','Windham','Windsor']
export default function SubmitProject() {
  const [form, setForm] = useState({name:'',email:'',county:'',projectType:'',description:''})
  const [status, setStatus] = useState('idle')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm(p => ({...p,[k]:e.target.value}))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('submitting')
    await new Promise(r => setTimeout(r, 1200))
    setStatus('success')
  }
  if (status === 'success') return (
    <section id="submit-project" className="py-28 bg-[#1C2B1A]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-display text-4xl text-[#F5EFE0] font-semibold mb-4">Project Received!</h2>
        <p className="text-[#F5EFE0]/60 text-lg">We’ll match your project with qualified Vermont contractors within 48 hours. Check your inbox at <strong className="text-[#F5EFE0]">{form.email}</strong>.</p>
      </div>
    </section>
  )
  const ic = 'w-full bg-[#2D4A2A]/50 border border-[#7A9B6F]/25 focus:border-[#C8732A] focus:outline-none text-[#F5EFE0] placeholder-[#F5EFE0]/25 rounded-sm px-4 py-3 text-sm transition-colors'
  return (
    <section id="submit-project" className="py-28 bg-[#1C2B1A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="sticky top-32">
            <span className="text-[#7A9B6F] text-xs font-mono uppercase tracking-widest">Free · No Account Needed</span>
            <h2 className="mt-3 font-display text-5xl md:text-6xl text-[#F5EFE0] font-semibold leading-[1.05]">Post your<br/><em className="text-[#C8732A]">project.</em></h2>
            <p className="mt-6 text-[#F5EFE0]/50 text-lg font-light leading-relaxed">Fill in the details and we’ll match you with 2–4 qualified Vermont contractors within 48 hours. Always free.</p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required type="text" placeholder="Your Name" value={form.name} onChange={set('name')} className={ic} />
              <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} className={ic} />
            </div>
            <select required value={form.county} onChange={set('county')} className={ic}>
              <option value="" disabled>Select county…</option>
              {VT.map(c => <option key={c}>{c}</option>)}
            </select>
            <select required value={form.projectType} onChange={set('projectType')} className={ic}>
              <option value="" disabled>Project type…</option>
              {PT.map(p => <option key={p}>{p}</option>)}
            </select>
            <textarea required rows={5} placeholder="Describe your project…" value={form.description} onChange={set('description')} className={ic + ' resize-none'} />
            <button type="submit" disabled={status==='submitting'} className="mt-2 w-full py-4 bg-[#C8732A] hover:bg-[#A84E1A] disabled:opacity-60 text-[#FAF7F2] font-semibold text-sm rounded-sm transition-all">
              {status === 'submitting' ? 'Submitting…' : 'Submit Project & Get Matched →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
