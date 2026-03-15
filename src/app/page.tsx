'use client'
import{useEffect}from'react'
import Nav from'@/components/Nav'
import Hero from'@/components/Hero'
import HowItWorks from'@/components/HowItWorks'
import ProjectTypes from'@/components/ProjectTypes'
import ForContractors from'@/components/ForContractors'
import SubmitProject from'@/components/SubmitProject'
import Footer from'@/components/Footer'
export default function Home(){
  useEffect(()=>{
    const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:0.12})
    document.querySelectorAll('.reveal').forEach(el=>obs.observe(el))
    return()=>obs.disconnect()
  },[])
  return(<main><Nav/><Hero/><HowItWorks/><ProjectTypes/><ForContractors/><SubmitProject/><Footer/></main>)
}
