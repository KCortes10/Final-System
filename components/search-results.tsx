"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Search, Upload } from "lucide-react"
import Link from "next/link"
import { SearchBar } from "@/components/search-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ImageCard } from "@/components/image-card"
import { UnsplashImage } from "@/lib/unsplash"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { authAPI, imageAPI } from "@/lib/api"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchResultsProps {
  images: UnsplashImage[]
  query: string
  page: number
  totalPages: number
  totalResults: number
  error: boolean
}

export function SearchResults({
  images,
  query,
  page,
  totalPages,
  totalResults,
  error
}: SearchResultsProps) {
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

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadFile(file)
    
    if (file) {
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
      
      // Call the backend directly to ensure price is included
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      console.log("Upload successful:", data);

      setShowUploadModal(false)
      setUploadFile(null)
      setUploadTitle("")
      setUploadDescription("")
      setUploadPreview(null)
      setUploadPrice("")
      setUploadCategory("nature")
      
      // Show success message
      alert('Your image has been uploaded to the marketplace for sale!');
      
      // Reload to show the new image in search results
      window.location.reload()

      // Update localStorage pending purchase to include currency
      const pendingPurchase = {
        id: data.id,
        title: data.title,
        price: data.price,
        currency: '₱'
      };
      localStorage.setItem('pendingPurchase', JSON.stringify(pendingPurchase));
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
              <form action="/search" method="GET">
                <Input
                  name="q"
                  placeholder="Search for images..."
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

      <main className="container flex-1 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {query ? `Image results for: ${query}` : 'Explore trending images'}
          </h1>
          <p className="text-muted-foreground hover:text-violet-600/70 dark:hover:text-violet-400/70 transition-colors">
            {query ? `Showing ${images.length} of ${totalResults} images` : `Showing ${images.length} trending images`}
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                id={image.id}
                src={image.urls.small}
                alt={image.alt_description || image.description || 'Image'}
                authorName={image.user.name}
                externalUrl={image.links.html}
                downloadUrl={image.urls.regular}
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
              {error
                ? "We're having trouble connecting to our image service. Please try again later."
                : query
                  ? "We couldn't find any images matching your search. Try a different search term."
                  : "We're having trouble loading trending images right now. Please try again later."}
            </p>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white"
              asChild
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        )}

        {query && totalPages > 1 && images.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {page > 1 && (
              <Button
                variant="outline"
                className="rounded-full border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-900/30 transition-transform hover:scale-105 hover:shadow-md hover:shadow-violet-500/20"
                asChild
              >
                <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = page <= 3 
                ? i + 1 
                : page + i - 2;
                
              if (pageNum <= totalPages && pageNum > 0) {
                return (
                  <Button
                    key={pageNum}
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${
                      pageNum === page
                        ? "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700"
                        : "border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-900/30"
                    } transition-transform hover:scale-110 hover:shadow-md hover:shadow-violet-500/20`}
                    asChild
                  >
                    <Link href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}>{pageNum}</Link>
                  </Button>
                );
              }
              return null;
            })}
            
            {page < totalPages && (
              <Button
                variant="outline"
                className="rounded-full border-violet-200 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-900/30 transition-transform hover:scale-105 hover:shadow-md hover:shadow-violet-500/20"
                asChild
              >
                <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        )}
      </main>

      <footer className="py-4">
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
                        SVG, PNG, JPG or GIF (MAX. 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
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