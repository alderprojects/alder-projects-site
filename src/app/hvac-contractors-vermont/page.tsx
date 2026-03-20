import type { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: "HVAC Contractors Vermont | Alder Projects",
  description: "Find HVAC contractors in Vermont for heat pump installation, boiler replacement, and heating upgrades. Post your project free.",
  alternates: { canonical: "https://alderprojects.com/hvac-contractors-vermont" },
}

const content = {
  h1: "HVAC Contractors in Vermont",
  heroImg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  intro: "Find HVAC contractors in Vermont for heat pump installation, boiler replacement, ductless mini-splits, and whole-home heating upgrades. Post free and get matched with local contractors.",
  sections: [
  {
    "heading": "Heating in Vermont Homes",
    "body": "Vermont cold winters make heating system quality critical. Common Vermont HVAC projects include oil to heat pump conversions, propane boiler replacement, ductless mini-split installation for additions and older homes without ductwork, and radiant floor heating in renovation projects. Efficiency Vermont offers significant rebates for cold-climate heat pumps, often $1,000 to $3,000 per unit."
  },
  {
    "heading": "What to Expect",
    "body": "HVAC work in Vermont requires licensed contractors and typically requires mechanical permits. Heat pump installations have specific sizing and placement requirements for Vermont climate performance. Allow 2 to 6 weeks for scheduling depending on season."
  }
],
  faqs: [
  {
    "q": "Are there rebates for heat pumps in Vermont?",
    "a": "Yes. Efficiency Vermont offers rebates of $1,000 to $3,000 or more for qualifying cold-climate heat pumps. Combined with federal tax credits, the effective cost of a heat pump system is significantly reduced."
  },
  {
    "q": "How much does heat pump installation cost in Vermont?",
    "a": "A single-zone ductless mini-split runs $3,000 to $6,000 installed. A multi-zone system for a full home runs $12,000 to $30,000 depending on zones and equipment."
  },
  {
    "q": "Can a heat pump work in Vermont winters?",
    "a": "Modern cold-climate heat pumps are rated to minus 13 degrees Fahrenheit and work effectively in Vermont winters. They are a recommended primary heating solution for new construction and renovations."
  }
],
  ctaText: "Post Your Project Free â",
  internalLinks: [
  {
    "label": "Electrical contractors Vermont",
    "href": "/electrical-contractors-vermont"
  },
  {
    "label": "Home additions Vermont",
    "href": "/home-additions-vermont"
  },
  {
    "label": "Contractors in Chittenden County",
    "href": "/chittenden-county-vt"
  }
],
}

export default function Page() {
  return <SeoPage content={content} />
}
