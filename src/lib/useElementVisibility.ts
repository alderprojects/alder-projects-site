'use client'

import { useEffect, useRef } from 'react'

// useElementVisibility wires an IntersectionObserver to the returned
// ref and fires onVisible() exactly once when the element first
// crosses the threshold. Used by RecommendationStrip + AccessoryKit
// to fire the analytics view-event only when the surface actually
// enters the viewport (not on every page render).
//
// Threshold is 0..1 — share of the element area that must be visible.
// 0.5 = at least half the element on screen.

export function useElementVisibility<T extends HTMLElement = HTMLElement>(
  threshold: number,
  onVisible: () => void
) {
  const ref = useRef<T | null>(null)
  const fired = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!ref.current || fired.current) return
    if (typeof IntersectionObserver === 'undefined') {
      // No IO support (very old browsers / SSR-time eval) — fire once
      // so analytics aren't silently lost.
      fired.current = true
      onVisible()
      return
    }
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true
            onVisible()
            observer.disconnect()
          }
        }
      },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold, onVisible])

  return ref
}
