import type { Metadata } from 'next'
import Calculator from './Calculator'
export const metadata: Metadata = {
  title: 'Vermont Renovation Cost Calculator | Alder Projects',
  description: 'Estimate your Vermont home renovation cost by project type, scope, and town. Real Vermont ranges — not national averages.',
  alternates: { canonical: 'https://alderprojects.com/calculator' },
}
export default function CalculatorPage() { return <Calculator /> }