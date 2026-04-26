'use client'
import Link from 'next/link'
import type { ReactNode, CSSProperties } from 'react'

export type PostProjectButtonProps = {
  category?: string
  town?: string
  budget?: string
  timeline?: string
  description?: string
  source?: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
  variant?: 'primary' | 'secondary' | 'inline'
}

const VARIANTS: Record<NonNullable<PostProjectButtonProps['variant']>, CSSProperties> = {
  primary: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#C8732A',
    color: '#FAF7F2',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '2px',
    textDecoration: 'none',
  },
  secondary: {
    display: 'inline-block',
    padding: '10px 20px',
    border: '1px solid rgba(122,155,111,0.45)',
    color: 'rgba(245,239,224,0.8)',
    fontWeight: 500,
    fontSize: '14px',
    borderRadius: '2px',
    textDecoration: 'none',
    backgroundColor: 'transparent',
  },
  inline: {
    color: '#C8732A',
    fontWeight: 600,
    textDecoration: 'none',
  },
}

export function buildPostProjectUrl(params: Omit<PostProjectButtonProps, 'children' | 'className' | 'style' | 'variant'>): string {
  const sp = new URLSearchParams()
  if (params.source) sp.set('source', params.source)
  if (params.category) sp.set('category', params.category)
  if (params.town) sp.set('town', params.town)
  if (params.budget) sp.set('budget', params.budget)
  if (params.timeline) sp.set('timeline', params.timeline)
  if (params.description) sp.set('description', params.description)
  const qs = sp.toString()
  return qs ? '/?' + qs + '#submit-project' : '/#submit-project'
}

export default function PostProjectButton({
  category, town, budget, timeline, description, source,
  children = 'Post Your Project →',
  className, style, variant = 'primary',
}: PostProjectButtonProps) {
  const href = buildPostProjectUrl({ category, town, budget, timeline, description, source })
  const finalStyle = style ? { ...VARIANTS[variant], ...style } : VARIANTS[variant]
  return (
    <Link href={href} className={className} style={finalStyle}>{children}</Link>
  )
}
