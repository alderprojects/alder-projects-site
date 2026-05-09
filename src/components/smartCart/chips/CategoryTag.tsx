// v7.2.7 — small tag overlaid on category-fallback images so buyers
// can tell when an image is a category illustration rather than a
// specific product photo.
// v7.2.9 — extended to classify AI-illustrated and stock-photo
// images via the build-time image-source manifest (keyed by image URL).

import { getImageSource, getImageSourceLabel } from '@/lib/smart-cart-images'

interface Props {
  imageUrl: string
}

export default function CategoryTag({ imageUrl }: Props) {
  const source = getImageSource(imageUrl)
  const label = getImageSourceLabel(source)
  if (!label) return null
  return (
    <span className="absolute bottom-1 right-1 text-[10px] uppercase tracking-wide bg-black/60 text-white px-1.5 py-0.5 rounded">
      {label}
    </span>
  )
}
