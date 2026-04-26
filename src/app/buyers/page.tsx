import type { Metadata } from 'next'
import { PropertyReportInner } from '@/app/seasonal-home-report/page'

export const metadata: Metadata = {
  title: 'Vermont property check for buyers \u2014 know what you\'re walking into',
  description: 'Buying a Vermont property? Type the address. We\'ll tell you the flood, septic, shoreland, and zoning issues to factor into your offer \u2014 in plain English.',
  alternates: { canonical: 'https://alderprojects.com/buyers' },
  openGraph: {
    title: 'Vermont property check for buyers',
    description: 'Type the address. Get the boring-but-important stuff before you make an offer.',
    url: 'https://alderprojects.com/buyers',
    siteName: 'Alder Projects',
    type: 'website',
  },
}

export default function BuyersPage() {
  return <PropertyReportInner mode="buyer" />
}
