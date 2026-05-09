// v7.2.7 — small tag overlaid on category-fallback images so buyers
// can tell when an image is a category illustration rather than a
// specific product photo.
//
// Renders only when the imageUrl points to /product-images/categories/
// (SVG fallbacks). Pexels-sourced webps live alongside manufacturer
// webps and aren't visually distinguishable at runtime without a
// build-time manifest; that's a v7.3+ refinement.

interface Props {
  imageUrl: string
}

export default function CategoryTag({ imageUrl }: Props) {
  if (!imageUrl.includes('/categories/')) return null
  return (
    <span className="absolute bottom-1 right-1 text-[10px] uppercase tracking-wide bg-black/60 text-white px-1.5 py-0.5 rounded">
      Category
    </span>
  )
}
