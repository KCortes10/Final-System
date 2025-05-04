"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Upload, ImageIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { imageAPI } from "@/lib/api"
import Image from "next/image"

export default function UploadPage() {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("File type not allowed. Please upload jpg, jpeg, png, gif or webp files only.");
        e.target.value = ''; // Reset the input
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large. Maximum allowed size is 10MB.");
        e.target.value = ''; // Reset the input
        return;
      }
      
      setImageFile(file)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!imageFile) {
      setError("Please select an image to upload")
      return
    }

    if (!title) {
      setError("Please provide a title for your image")
      return
    }

    if (!category) {
      setError("Please select a category for your image")
      return
    }
    
    if (!price) {
      setError("Please set a price for your image")
      return
    }

    setIsLoading(true)

    try {
      // Use the actual API upload function
      const response = await imageAPI.uploadImage(imageFile, {
        title,
        description,
        category,
        price
      })

      console.log("Upload successful:", response)
      
      // Redirect to marketplace after successful upload
      router.push('/marketplace')
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
              <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-lg font-bold">SearchIt</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Your Image</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Card className="border-violet-200 dark:border-violet-800">
                  <CardHeader>
                    <CardTitle>Image Preview</CardTitle>
                    <CardDescription>Upload a high-quality image to sell on the marketplace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="border-2 border-dashed border-violet-200 dark:border-violet-800 rounded-lg p-4 text-center hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="space-y-4">
                        <div className="mx-auto w-full aspect-square relative bg-muted rounded-md overflow-hidden">
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="Image preview"
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <ImageIcon className="h-16 w-16 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">No image selected</p>
                              <p className="text-xs text-muted-foreground">Supported formats: JPG, JPEG, PNG, GIF, WEBP</p>
                              <p className="text-xs text-muted-foreground mt-1">Max size: 10MB</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-center">
                          <Input 
                            id="image-upload" 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/30"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {imageFile ? "Change Image" : "Select Image"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-violet-200 dark:border-violet-800">
                  <CardHeader>
                    <CardTitle>Image Details</CardTitle>
                    <CardDescription>Provide information about your image and set a price</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a descriptive title"
                        className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your image in detail"
                        className="min-h-[100px] border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                      >
                        <SelectTrigger
                          id="category"
                          className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nature">Nature</SelectItem>
                          <SelectItem value="architecture">Architecture</SelectItem>
                          <SelectItem value="people">People</SelectItem>
                          <SelectItem value="animals">Animals</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₱)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₱</span>
                        <Input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="pl-8 border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Set a price in Philippine Peso for others to purchase your image
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Methods</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer">
                          <input type="checkbox" id="gcash" className="h-4 w-4 accent-violet-600" />
                          <Label htmlFor="gcash" className="cursor-pointer">
                            GCash
                          </Label>
                        </div>
                        <div className="border rounded-md p-3 flex items-center space-x-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer">
                          <input type="checkbox" id="card" className="h-4 w-4 accent-violet-600" />
                          <Label htmlFor="card" className="cursor-pointer">
                            Credit Card
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? "Uploading..." : "Upload and List for Sale"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-4">
        <div className="container">
          <div className="text-center text-sm text-muted-foreground">© 2025 SearchIt. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
