import type { Metadata } from 'next'
import SeoPage from '@/components/SeoPage'

export const metadata: Metadata = {
  title: "General Contractors Vermont | Alder Projects",
  description: "Find general contractors in Vermont for whole-home renovations, additions, and complex multi-trade projects. Post your project free.",
  alternates: { canonical: "https://alderprojects.com/general-contractors-vermont" },
}

const content = {
  h1: "General Contractors in Vermont",
  heroImg: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1",
  intro: "Find general contractors in Vermont for complex renovation projects, home additions, and whole-home remodels requiring multiple trades. Post your project free.",
  sections: [
  {
    "heading": "When to Use a General Contractor",
    "body": "A general contractor makes sense when your project involves multiple trades. Framing, plumbing, electrical, and finish work in the same project. GCs coordinate subcontractors, manage scheduling, and serve as your single point of contact. For kitchen remodels, additions, basement finishes, and whole-home renovations, a GC typically adds less cost than the time and complexity of managing trades yourself."
  },
  {
    "heading": "Vermont General Contractor Market",
    "body": "Vermont quality GC market is concentrated around Burlington, Montpelier, and the ski resort corridors. Good GCs in Vermont stay booked. Plan for a 6 to 12 week wait for project starts from top firms during peak season. The best signal is a portfolio of local work and references from similar projects you can actually call."
  }
],
  faqs: [
  {
    "q": "Do I need a general contractor or can I hire trades directly?",
    "a": "For single-trade work, hire that trade directly. For projects involving three or more trades, a general contractor almost always saves more than their markup costs in coordination and scheduling alone."
  },
  {
    "q": "How much does a general contractor charge in Vermont?",
    "a": "Vermont GCs typically charge a 15 to 25 percent markup on subcontractor and materials costs. Some work on a fixed-price contract. Get multiple bids and compare total project cost."
  },
  {
    "q": "How do I find a good general contractor in Vermont?",
    "a": "Word of mouth from neighbors with similar completed projects is the most reliable signal. Verify Vermont contractor registration at labor.vermont.gov and call at least two references from projects similar to yours."
  }
],
  ctaText: "Post Your Project Free â",
  internalLinks: [
  {
    "label": "Home additions Vermont",
    "href": "/home-additions-vermont"
  },
  {
    "label": "Kitchen remodeling Vermont",
    "href": "/kitchen-remodeling-vermont"
  },
  {
    "label": "Basement finishing Vermont",
    "href": "/basement-finishing-vermont"
  }
],
}

export default function Page() {
  return <SeoPage content={content} />
}
