import { UnsplashImage, searchUnsplashImages, getRandomUnsplashImages } from "@/lib/unsplash"
import { MarketplaceResults } from "@/components/marketplace-results"

// Make the page use server side rendering
export const dynamic = 'force-dynamic'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string; page?: string }
}) {
  const query = searchParams?.q || ""
  const category = searchParams?.category || "all"
  const page = searchParams?.page ? parseInt(searchParams.page) : 1

  // Fetch images from Unsplash API based on category
  let images: UnsplashImage[] = []
  
  try {
    if (query) {
      // If there's a search query, use that
      const results = await searchUnsplashImages(query, page, 12)
      images = results.results
    } else if (category && category !== "all") {
      // Otherwise use the selected category
      const results = await searchUnsplashImages(category, page, 12)
      images = results.results
    } else {
      // Get random images if no query or category
      images = await getRandomUnsplashImages(12)
    }
  } catch (error) {
    console.error("Error fetching images:", error)
  }

  // Generate random prices for the marketplace images
  const imagesWithPrices = images.map(image => ({
    ...image,
    price: Math.floor(Math.random() * 50) + 5, // Random price between $5 and $54
    rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
  }))

  return (
    <MarketplaceResults 
      images={imagesWithPrices}
      query={query}
      category={category}
    />
  )
}
