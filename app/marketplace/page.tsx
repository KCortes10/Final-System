import { UnsplashImage, searchUnsplashImages, getRandomUnsplashImages } from "@/lib/unsplash"
import { MarketplaceResults } from "@/components/marketplace-results"
import { imageAPI } from "@/lib/api"

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

  // Fetch uploaded images from the backend API
  let uploadedImages = []
  try {
    // Fetch uploaded images with the same query/category filter
    let options = {}
    if (query) {
      options = { q: query }
    } else if (category && category !== "all") {
      options = { category: category }
    }
    
    const response = await imageAPI.getImages(options)
    
    // Convert uploaded images to match Unsplash format for component compatibility
    uploadedImages = response.images.map((image: any) => ({
      id: image.id,
      urls: {
        small: image.url,
        regular: image.url
      },
      alt_description: image.title,
      description: image.description,
      user: {
        name: "User Upload" // Since we don't have author name
      },
      links: {
        html: image.url
      },
      price: image.price || 0,
      rating: image.rating || "4.5",
      isUserUpload: true,
      filename: image.filename || "" // Add filename for search
    }))
  } catch (error) {
    console.error("Error fetching uploaded images:", error)
  }

  // Combine Unsplash images with uploaded images
  const allImages = [...uploadedImages, ...imagesWithPrices]

  return (
    <MarketplaceResults 
      images={allImages}
      query={query}
      category={category}
    />
  )
} 