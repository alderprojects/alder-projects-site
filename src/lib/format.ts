// Price formatting helpers used everywhere prices are displayed.

export function formatPrice(usd: number): string {
  return `$${usd.toFixed(2)}`
}

export function formatPriceRange(low: number, high: number): string {
  if (low === high) return formatPrice(low)
  return `${formatPrice(low)}–${formatPrice(high)}`
}
