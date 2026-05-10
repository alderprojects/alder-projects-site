'use client'

// v7.2.11 — product thumbnail with subtle source label.
//
// Replaces the heavy v7.2.9 CategoryTag overlay (which used uppercase
// "ILLUSTRATION" / "STOCK" / "CATEGORY" labels that hurt buyer trust).
// Now: only category-fallback (SVG) images get a small, lowercase
// "representative" tag. Real photos, AI illustrations, and Pexels
// stock all render unmarked — they're visual content, not warnings.

import { useState } from 'react'
import {
  DEFAULT_IMAGE_URL,
  getImageSource,
} from '@/lib/smart-cart-images'

interface Props {
  src: string
  alt: string
  className?: string
  /** Show the small "representative" tag for fallback images. */
  showRepresentativeTag?: boolean
}

export default function ProductImage({
  src,
  alt,
  className,
  showRepresentativeTag = true,
}: Props) {
  const [failed, setFailed] = useState(false)
  const finalSrc = failed ? DEFAULT_IMAGE_URL : src
  const isFallback = getImageSource(finalSrc) === 'svg_fallback'
  return (
    <div className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
      {showRepresentativeTag && isFallback && (
        <span className="absolute bottom-1 right-1 text-[9px] tracking-wide bg-white/80 text-[#1a1f1a]/65 px-1 rounded">
          representative
        </span>
      )}
    </div>
  )
}
