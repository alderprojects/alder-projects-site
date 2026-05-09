'use client'

// v7.2.7 — product thumbnail with 404 fallback.
//
// Uses a plain <img> rather than next/image so the same component
// works for raster (manufacturer/Pexels webp) and SVG category icons
// without next/image's per-domain config. onError swaps to the
// default category icon if the primary file 404s.

import { useState } from 'react'
import { DEFAULT_IMAGE_URL } from '@/lib/smart-cart-images'

interface Props {
  src: string
  alt: string
  className?: string
}

export default function ProductImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false)
  const finalSrc = failed ? DEFAULT_IMAGE_URL : src
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
