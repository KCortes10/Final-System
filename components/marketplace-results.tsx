"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Search, Upload, Grid, List, Filter, Star, Download, ExternalLink, X, User, Lock, Eye, EyeOff, ShoppingCart } from "lucide-react"
import { UnsplashImage } from "@/lib/unsplash"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { MarketplaceCard } from "@/components/marketplace-card"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { authAPI, imageAPI } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Define a type for marketplace images with all required and optional properties
type MarketplaceImage = UnsplashImage & { 
  price: number; 
  rating: string; 
  isUserUpload?: boolean;
  filename?: string;
}

interface MarketplaceResultsProps {
  images: MarketplaceImage[]
  query: string
  category: string
}

export function MarketplaceResults({
  images,
  query,
  category
}: MarketplaceResultsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [uploadPrice, setUploadPrice] = useState("")
  const [uploadCategory, setUploadCategory] = useState("nature")
  
  // Price filter states
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [sortOption, setSortOption] = useState<string>("popular")
  const [filteredImages, setFilteredImages] = useState<MarketplaceImage[]>(images)

  useEffect(() => {
    // Initialize states from URL parameters
    const minPriceParam = searchParams?.get("minPrice")
    const maxPriceParam = searchParams?.get("maxPrice")
    const sortParam = searchParams?.get("sort")
    
    if (minPriceParam) setMinPrice(minPriceParam)
    if (maxPriceParam) setMaxPrice(maxPriceParam)
    if (sortParam) setSortOption(sortParam)
    
    // Apply filters based on URL parameters
    applyFilters(
      minPriceParam ? parseInt(minPriceParam) : null,
      maxPriceParam ? parseInt(maxPriceParam) : null,
      sortParam || "popular"
    )
  }, [images, searchParams])

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload(); // Reload to update UI based on auth state
  };

  // Apply all filters and sort
  const applyFilters = (min: number | null = null, max: number | null = null, sort: string = sortOption) => {
    let result = [...images]
    
    // Apply search filter if query exists (client-side filtering for uploaded images by filename)
    if (query) {
      const searchLower = query.toLowerCase();
      // Also filter by filename for user uploads (in addition to server-side filtering)
      result = result.filter(img => 
        (img.alt_description && img.alt_description.toLowerCase().includes(searchLower)) || 
        (img.description && img.description.toLowerCase().includes(searchLower)) ||
        (img.isUserUpload && img.filename && img.filename.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply price range filter
    if (min !== null) {
      result = result.filter(img => img.price >= min)
    }
    
    if (max !== null) {
      result = result.filter(img => img.price <= max)
    }
    
    // Apply sorting
    switch (sort) {
      case "popular":
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        break
      case "recent":
        // Assuming the first items are most recent
        // In a real app, you'd sort by creation date
        break
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
    }
    
    setFilteredImages(result)
  }

  // Handle price filter apply
  const handleApplyPriceFilter = () => {
    const min = minPrice ? parseInt(minPrice) : null
    const max = maxPrice ? parseInt(maxPrice) : null
    
    // Update URL with filter parameters
    const params = new URLSearchParams(searchParams as any)
    if (min) params.set("minPrice", min.toString())
    else params.delete("minPrice")
    
    if (max) params.set("maxPrice", max.toString())
    else params.delete("maxPrice")
    
    // Keep existing parameters
    if (category && category !== "all") params.set("category", category)
    if (query) params.set("q", query)
    if (sortOption !== "popular") params.set("sort", sortOption)
    
    // Navigate with the new parameters
    router.push(`/marketplace?${params.toString()}`)
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value)
    
    // Update URL with sort parameter
    const params = new URLSearchParams(searchParams as any)
    if (value !== "popular") params.set("sort", value)
    else params.delete("sort")
    
    // Keep existing parameters
    if (category && category !== "all") params.set("category", category)
    if (query) params.set("q", query)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    
    // Navigate with the new parameters
    router.push(`/marketplace?${params.toString()}`)
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadFile(file)
    
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("File type not allowed. Please upload jpg, jpeg, png, gif or webp files only.");
        e.target.value = ''; // Reset the input
        setUploadFile(null);
        setUploadPreview(null);
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size too large. Maximum allowed size is 10MB.");
        e.target.value = ''; // Reset the input
        setUploadFile(null);
        setUploadPreview(null);
        return;
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setUploadPreview(null)
    }
  }

  // Handle sign in submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      alert("Email and password are required")
      return
    }

    setIsLoading(true)

    try {
      // Use the actual auth API
      console.log("Attempting login with:", email)
      const response = await authAPI.login(email, password)
      console.log("Login successful:", response)
      setShowSignInModal(false)
      setEmail("")
      setPassword("")
      // You could add a toast notification here
      window.location.reload() // Reload to update UI based on auth state
    } catch (err) {
      console.error("Login error details:", err)
      let errorMsg = "Failed to sign in. Please check your credentials."
      if (err instanceof Error) {
        errorMsg = err.message || errorMsg
      }
      alert(`Login failed: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle upload submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadFile) {
      alert("Please select an image to upload")
      return
    }

    if (!uploadTitle) {
      alert("Please provide a title for your image")
      return
    }
    
    if (!uploadPrice) {
      alert("Please set a price for your image")
      return
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      alert("You must be logged in to upload images. Please sign in first.")
      setShowUploadModal(false)
      setShowSignInModal(true)
      return
    }

    setIsLoading(true)

    try {
      // Use the actual API upload function
      console.log("Attempting to upload image:", {
        title: uploadTitle,
        description: uploadDescription,
        category: uploadCategory,
        price: uploadPrice,
        fileSize: uploadFile.size,
        fileType: uploadFile.type
      })
      
      // Create FormData with proper price field
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription || '');
      formData.append('category', uploadCategory);
      formData.append('price', uploadPrice);
      
      // Import API_BASE_URL
      const API_BASE_URL = '/api';
      
      // Try using the imageAPI utility first, which has better error handling
      try {
        const uploadResult = await imageAPI.uploadImage(uploadFile, {
          title: uploadTitle,
          description: uploadDescription || '',
          category: uploadCategory,
          price: uploadPrice
        });
        
        console.log("Upload successful via imageAPI:", uploadResult);
        
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle("");
        setUploadDescription("");
        setUploadPreview(null);
        setUploadPrice("");
        setUploadCategory("nature");
        
        // Show success message
        alert('Your image has been uploaded to the marketplace for sale!');
        
        // Reload to show the new image
        window.location.reload();
        return;
      } catch (apiError) {
        console.error("Failed to upload via imageAPI, trying direct fetch:", apiError);
        
        // Fall back to direct fetch approach
        try {
          // Call the backend directly as fallback
          const response = await fetch(`/api/uploads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
            let errorMessage = 'Failed to upload image';
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              // If response is not JSON, try to get text
              try {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
              } catch {
                // If we can't get response text either, use status
                errorMessage = `Failed to upload image: ${response.status} ${response.statusText}`;
              }
            }
            throw new Error(errorMessage);
      }
      
      const data = await response.json();
          console.log("Upload successful via direct fetch:", data);

          setShowUploadModal(false);
          setUploadFile(null);
          setUploadTitle("");
          setUploadDescription("");
          setUploadPreview(null);
          setUploadPrice("");
          setUploadCategory("nature");
      
      // Show success message
      alert('Your image has been uploaded to the marketplace for sale!');
      
      // Reload to show the new image
          window.location.reload();
        } catch (fetchError) {
          console.error("Direct fetch upload error:", fetchError);
          throw fetchError; // Re-throw to be caught by outer catch
        }
      }
    } catch (err) {
      console.error("Upload error details:", err)
      let errorMsg = "Failed to upload image. Please try again."
      if (err instanceof Error) {
        errorMsg = err.message || errorMsg
      }
      alert(`Upload failed: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get fallback image URL
  const getFallbackImageUrl = (id: string) => {
    // Fallback to a predefined set of reliable images
    const fallbackImages = [
      'https://images.unsplash.com/photo-1575936123452-b67c3203c357',
      'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43',
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6',
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec',
      'https://images.unsplash.com/photo-1524293581917-878a6d017c71'
    ];
    
    // Use a hash of the ID to pick a consistent image for a given ID
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbackImages.length;
    return fallbackImages[index];
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-lg font-bold">SearchIt</span>
          </Link>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <form action="/marketplace" method="GET">
                <Input
                  name="q"
                  placeholder="Search marketplace..."
                  className="pl-10 border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  defaultValue={query}
                />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/30"
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  setShowSignInModal(true);
                  alert("You must be logged in to upload images.");
                } else {
                  setShowUploadModal(true);
                }
              }}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-300"
                asChild
              >
                <Link href="/profile">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Profile</span>
                </Link>
              </Button>
            )}
            <Button 
              className="hidden sm:flex bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => isLoggedIn ? handleSignOut() : setShowSignInModal(true)}
            >
              {isLoggedIn ? "Sign out" : "Sign in"}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Image Marketplace</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="sm:hidden border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/30"
              onClick={() => {
                const token = localStorage.getItem('token');
                if (!token) {
                  setShowSignInModal(true);
                  alert("You must be logged in to upload images.");
                } else {
                  setShowUploadModal(true);
                }
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
            >
              <Grid className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 space-y-6">
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Categories</h3>
                <Tabs defaultValue={category} orientation="vertical" className="w-full">
                  <TabsList className="bg-transparent flex flex-col h-auto items-start p-0 space-y-1">
                    <TabsTrigger
                      value="all"
                      className="w-full justify-start px-2 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300"
                      asChild
                    >
                      <Link href="/marketplace?category=all">All Images</Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="nature"
                      className="w-full justify-start px-2 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300"
                      asChild
                    >
                      <Link href="/marketplace?category=nature">Nature</Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="architecture"
                      className="w-full justify-start px-2 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300"
                      asChild
                    >
                      <Link href="/marketplace?category=architecture">Architecture</Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="people"
                      className="w-full justify-start px-2 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300"
                      asChild
                    >
                      <Link href="/marketplace?category=people">People</Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="animals"
                      className="w-full justify-start px-2 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300"
                      asChild
                    >
                      <Link href="/marketplace?category=animals">Animals</Link>
                    </TabsTrigger>
                    <TabsTrigger
                      value="travel"
                      className="w-full justify-start px-2 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 dark:data-[state=active]:bg-violet-900/40 dark:data-[state=active]:text-violet-300"
                      asChild
                    >
                      <Link href="/marketplace?category=travel">Travel</Link>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-price">Min</Label>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min={0}
                        className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-price">Max</Label>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="1000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min={0}
                        className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300 ease-in-out hover:scale-105"
                    onClick={handleApplyPriceFilter}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-4">Sort By</h3>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600">
                    <SelectValue placeholder="Most Popular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4">
            {filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map((image) => (
                  <MarketplaceCard
                    key={image.id}
                    id={image.id}
                    src={image.urls.small}
                    alt={image.alt_description || image.description || "Marketplace image"}
                    authorName={image.user.name}
                    externalUrl={image.links.html}
                    downloadUrl={image.urls.regular}
                    price={image.price}
                    rating={image.rating}
                    title={image.alt_description || image.description || "Beautiful image"}
                    isUserUpload={image.isUserUpload || false}
                    filename={image.filename}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900/50 mb-4">
                  <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">No images found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any images matching your criteria. Try adjusting your search or explore other categories.
                </p>
                <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                  <Link href="/marketplace">Browse all images</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 border-t">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            Made with ❤️ by Kemily Cortes
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <Dialog open={showSignInModal} onOpenChange={setShowSignInModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl mb-2">Sign in to SearchIt</DialogTitle>
            <DialogDescription className="text-center">
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignInSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="email" 
                  placeholder="Enter your email" 
                  type="email" 
                  className="pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="password" 
                  placeholder="Enter your password" 
                  type={showPassword ? "text" : "password"} 
                  className="pl-10 pr-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded text-violet-600 focus:ring-violet-500" />
                <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
              </div>
              <button type="button" className="text-sm text-violet-600 hover:text-violet-500">
                Forgot password?
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <button type="button" className="text-violet-600 hover:text-violet-500 font-medium">
                Create an account
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader className="px-0 py-2 sticky top-0 bg-background z-10">
            <DialogTitle className="text-center text-2xl mb-1">Upload New Image</DialogTitle>
            <DialogDescription className="text-center">
              Share your images with the SearchIt marketplace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-violet-700 dark:text-violet-400 font-medium">Upload Image</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 border-violet-300 dark:border-violet-700 dark:hover:border-violet-600"
                >
                  {uploadPreview ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={uploadPreview} 
                        alt="Upload preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-violet-500 dark:text-violet-400" />
                      <p className="mb-2 text-sm text-violet-600 dark:text-violet-400 font-semibold">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: JPG, JPEG, PNG, GIF, WEBP
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        (MAX. 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    required={!uploadFile}
                  />
                </label>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="title" className="text-violet-700 dark:text-violet-400 font-medium">Title</Label>
              <Input 
                id="title" 
                placeholder="Image title" 
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required 
                className="border-violet-300 focus:border-violet-500 dark:border-violet-800 dark:focus:border-violet-600"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description" className="text-violet-700 dark:text-violet-400 font-medium">Description</Label>
              <textarea 
                id="description" 
                placeholder="Image description" 
                className="min-h-16 w-full rounded-md border border-violet-300 focus:border-violet-500 dark:border-violet-800 dark:focus:border-violet-600 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="price" className="font-medium text-violet-700 dark:text-violet-400">
                Price (₱)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="Set a price in PHP (e.g. 1200)"
                value={uploadPrice}
                onChange={(e) => setUploadPrice(e.target.value)}
                min="1"
                required
                className="border-violet-300 focus:border-violet-500 dark:border-violet-800 dark:focus:border-violet-600"
              />
              <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                Set a price in Philippine Peso for others to purchase your image
              </p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="category" className="font-medium text-violet-700 dark:text-violet-400">
                Category
              </Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="border-violet-300 focus:border-violet-500 dark:border-violet-800 dark:focus:border-violet-600">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="people">People</SelectItem>
                  <SelectItem value="animals">Animals</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 sticky bottom-0 bg-background z-10">
              <Button 
                type="submit" 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-5 text-lg font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-600/30 transition-all duration-300 ease-in-out hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload for Sale"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 