import type { Metadata } from 'next'
import { PropertyReportInner } from '@/app/seasonal-home-report/page'

export const metadata: Metadata = {
  title: 'Vermont property check for owners \u2014 what your house actually needs',
  description: 'Already own a Vermont property? Type the address. We\'ll check the maps and tell you what to fix, what to ignore, and what\'s coming up.',
  alternates: { canonical: 'https://alderprojects.com/owners' },
  openGraph: {
    title: 'Vermont property check for owners',
    description: 'Type the address. Get the boring-but-important stuff before winter, before you renovate, before you list.',
    url: 'https://alderprojects.com/owners',
    siteName: 'Alder Projects',
    type: 'website',
  },
}

export default function OwnersPage() {
  return <PropertyReportInner mode="owner" />
}
