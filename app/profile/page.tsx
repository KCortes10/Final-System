"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles, Download, ShoppingCart, User, Upload, X, ZoomIn, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { authAPI } from "@/lib/api"
import { UnsplashImage } from "@/lib/unsplash"
import { saveAs } from 'file-saver'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Helper function to get demo images by ID
const getDemoImageUrl = (id: string) => {
  // Map known IDs to specific Unsplash photo IDs that are reliable
  const demoImageMap: Record<string, string> = {
    'D21SWrnHof8': 'photo-1556740738-b6a63e27c4df',
    'jJT2r2n7lYA': 'photo-1579202673506-ca3ce28943ef',
    'dru_DMY20ic': 'photo-1587590227264-0ac64ce63ce8',
    'z7PAkCMy2Fw': 'photo-1541343672885-9be56236302a',
    'ambot': 'photo-1560800589-3d88290dd749',
    // Add fallbacks for any other IDs
  };

  // Use the mapped ID if available, or a fallback from predefined list
  if (demoImageMap[id]) {
    return `https://images.unsplash.com/${demoImageMap[id]}`;
  }
  
  // Fallback to a predefined set of reliable Unsplash photos
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

export default function ProfilePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("purchased")
  const [purchasedImages, setPurchasedImages] = useState<any[]>([])
  const [downloadedImages, setDownloadedImages] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [showImageDetails, setShowImageDetails] = useState(false)

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if not authenticated
      router.push('/auth/login?returnUrl=/profile');
      return;
    }

    setIsAuthenticated(true);
    
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setUsername(response.user.username);
        setEmail(response.user.email);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Token might be invalid, redirect to login
        localStorage.removeItem('token');
        router.push('/auth/login?returnUrl=/profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Get downloaded, purchased, and uploaded images
  useEffect(() => {
    // Parse image IDs from localStorage
    const downloadedIds = JSON.parse(localStorage.getItem('downloadedImages') || '[]');
    const purchasedIds = JSON.parse(localStorage.getItem('purchasedImages') || '[]');
    
    // We need to fetch actual image data for each ID
    const fetchImagesData = async () => {
      try {
        const purchasedImagesData = [];
        const downloadedImagesData = [];
        
        // Fetch actual image data for each purchased ID
        for (const id of purchasedIds) {
          try {
            // First try to get from backend API (user uploads)
            const apiResponse = await fetch(`/api/uploads/${id}/metadata`);
            
            if (apiResponse.ok) {
              // It's a user upload
              const imageData = await apiResponse.json();
              purchasedImagesData.push({
                id: imageData.id,
                urls: {
                  small: imageData.url,
                  regular: imageData.url
                },
                description: imageData.title,
                title: imageData.title,
                user: {
                  name: "User Upload"
                },
                isUserUpload: true
              });
            } else {
              // It might be an Unsplash image
              const unsplashImage = {
                id,
                urls: {
                  small: getDemoImageUrl(id),
                  regular: getDemoImageUrl(id)
                },
                description: `Image ${id.substring(0, 8)}`,
                user: {
                  name: "Unsplash Artist"
                },
                isUnsplash: true
              };
              purchasedImagesData.push(unsplashImage);
            }
          } catch (error) {
            console.error(`Error fetching image data for ID ${id}:`, error);
            // Add a placeholder for the image that couldn't be fetched
            purchasedImagesData.push({
              id,
              urls: {
                small: getDemoImageUrl(id),
                regular: getDemoImageUrl(id)
              },
              description: `Image ${id.substring(0, 8)}`,
              user: {
                name: "Unknown"
              }
            });
          }
        }
        
        // Do the same for downloaded images
        for (const id of downloadedIds) {
          try {
            // First try to get from backend API (user uploads)
            const apiResponse = await fetch(`/api/uploads/${id}/metadata`);
            
            if (apiResponse.ok) {
              // It's a user upload
              const imageData = await apiResponse.json();
              downloadedImagesData.push({
                id: imageData.id,
                urls: {
                  small: imageData.url,
                  regular: imageData.url
                },
                description: imageData.title,
                title: imageData.title,
                user: {
                  name: "User Upload"
                },
                isUserUpload: true
              });
            } else {
              // It might be an Unsplash image
              const unsplashImage = {
      id,
      urls: {
                  small: getDemoImageUrl(id),
                  regular: getDemoImageUrl(id)
      },
      description: `Image ${id.substring(0, 8)}`,
      user: {
        name: "Unsplash Artist"
                },
                isUnsplash: true
              };
              downloadedImagesData.push(unsplashImage);
            }
          } catch (error) {
            console.error(`Error fetching image data for ID ${id}:`, error);
            // Add a placeholder for the image that couldn't be fetched
            downloadedImagesData.push({
              id,
              urls: {
                small: getDemoImageUrl(id),
                regular: getDemoImageUrl(id)
              },
              description: `Image ${id.substring(0, 8)}`,
              user: {
                name: "Unknown"
              }
            });
          }
        }
        
        setPurchasedImages(purchasedImagesData);
        setDownloadedImages(downloadedImagesData);
        
      } catch (error) {
        console.error("Error fetching images data:", error);
      }
    };
    
    // Don't use demo images, just fetch the actual data
    if (purchasedIds.length > 0 || downloadedIds.length > 0) {
      fetchImagesData();
    }
    
    // Fetch user uploaded images if authenticated
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUserUploads = async () => {
        try {
          const userId = localStorage.getItem('userId');
          
          if (userId) {
            // Use Next.js API route which will proxy to the backend
            const response = await fetch(`/api/uploads/user?userId=${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
              const mappedImages = data.images.map((img: any) => {
                // Ensure we have a full URL for the image (fallback to a demo if issues)
                let imageUrl = img.url || img.thumbnail_url;
                
                // Check if the URL is relative or doesn't have a scheme/host
                if (imageUrl && !imageUrl.startsWith('http')) {
                  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                  imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }
                
                // If still no valid URL, use a demo image
                if (!imageUrl) {
                  imageUrl = getDemoImageUrl(img.id);
                }
                
                return {
                  ...img,
                  urls: {
                    small: imageUrl,
                    regular: imageUrl
                  }
                };
              });
              setUploadedImages(mappedImages || []);
            }
          }
        } catch (error) {
          console.error("Error fetching user uploads:", error);
        }
      };
      
      fetchUserUploads();
    }
  }, []);

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  // Handle image download
  const handleDownloadImage = async (image: any) => {
    try {
      // Generate a filename based on image title or ID
      const filename = `searchit-image-${image.title ? image.title.replace(/\s+/g, '-').toLowerCase() : image.id}.jpg`;
      
      // Get the appropriate URL to download
      const downloadUrl = image.isUserUpload ? image.urls.regular : image.urls.regular;
      
      // Use file-saver to properly download the image
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      saveAs(blob, filename);
      
      // Mark as downloaded if it's not already
      const downloadedImages = JSON.parse(localStorage.getItem('downloadedImages') || '[]');
      if (!downloadedImages.includes(image.id)) {
        downloadedImages.push(image.id);
        localStorage.setItem('downloadedImages', JSON.stringify(downloadedImages));
        
        // Update the state so UI reflects the change
        setDownloadedImages(prev => {
          // Only add the image if it's not already in the array
          if (!prev.some(img => img.id === image.id)) {
            return [...prev, image];
          }
          return prev;
        });
      }
      
      // Show success message
      alert(`Image "${image.title || image.description || 'Image'}" downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Sorry, we couldn't download this image. Please try again later.");
    }
  };

  // View image details
  const handleViewDetails = (image: any) => {
    setSelectedImage(image)
    setShowImageDetails(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
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

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/30"
              asChild
            >
              <Link href="/marketplace">
                <ShoppingCart className="h-4 w-4" />
                <span>Marketplace</span>
              </Link>
            </Button>
            <Button 
              className="hidden sm:flex bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 text-xl">
                      {username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-1">{username}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{email}</p>
                  <div className="grid grid-cols-2 w-full gap-2 mb-4">
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-md text-center">
                      <div className="font-bold text-lg">{purchasedImages.length}</div>
                      <div className="text-xs text-muted-foreground">Purchased</div>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-md text-center">
                      <div className="font-bold text-lg">{downloadedImages.length}</div>
                      <div className="text-xs text-muted-foreground">Downloaded</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/marketplace">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Browse Marketplace
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold mb-6">My Images</h1>
            
            <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="purchased" className="flex gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Purchased Images
                </TabsTrigger>
                <TabsTrigger value="downloaded" className="flex gap-2">
                  <Download className="h-4 w-4" />
                  Downloaded Images
                </TabsTrigger>
                <TabsTrigger value="uploaded" className="flex gap-2">
                  <Upload className="h-4 w-4" />
                  My Uploads for Sale
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="purchased" className="mt-0">
                {purchasedImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden border-violet-200 hover:border-violet-400 transition-colors dark:border-violet-800 dark:hover:border-violet-600">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={image.urls.small}
                            alt={image.description || 'Purchased image'}
                            fill
                            className="object-cover transition-transform hover:scale-105 cursor-pointer"
                            onClick={() => handleViewDetails(image)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Fallback to a generic image if there's an error loading the actual image
                              target.src = getDemoImageUrl(image.id);
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {image.description || `Image ${image.id.substring(0, 8)}`}
                            </p>
                            <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full dark:bg-green-900/40 dark:text-green-300">
                              Purchased
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Button 
                            variant="outline" 
                            className="w-1/2"
                            onClick={() => handleViewDetails(image)}
                          >
                            View Details
                          </Button>
                          <Button 
                            className="w-1/2 bg-violet-600 hover:bg-violet-700 text-white"
                            onClick={() => handleDownloadImage(image)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-10 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No purchased images yet</h3>
                    <p className="text-muted-foreground mb-4">
                      When you purchase images from the marketplace, they'll appear here.
                    </p>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                      <Link href="/marketplace">Explore Marketplace</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="downloaded" className="mt-0">
                {downloadedImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {downloadedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden border-violet-200 hover:border-violet-400 transition-colors dark:border-violet-800 dark:hover:border-violet-600">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={image.urls.small}
                            alt={image.description || 'Downloaded image'}
                            fill
                            className="object-cover transition-transform hover:scale-105 cursor-pointer"
                            onClick={() => handleViewDetails(image)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Fallback to a generic image if there's an error loading the actual image
                              target.src = getDemoImageUrl(image.id);
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {image.description || `Image ${image.id.substring(0, 8)}`}
                            </p>
                            <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
                              Downloaded
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Button 
                            variant="outline" 
                            className="w-1/2"
                            onClick={() => handleViewDetails(image)}
                          >
                            View Details
                          </Button>
                          <Button 
                            className="w-1/2 bg-violet-600 hover:bg-violet-700 text-white"
                            onClick={() => handleDownloadImage(image)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-10 text-center">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No downloaded images yet</h3>
                    <p className="text-muted-foreground mb-4">
                      When you download images, they'll appear here for easy reference.
                    </p>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                      <Link href="/marketplace">Browse Images</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="uploaded" className="mt-0">
                {uploadedImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {uploadedImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden border-violet-200 hover:border-violet-400 transition-colors dark:border-violet-800 dark:hover:border-violet-600">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={image.thumbnail_url || image.url || `https://source.unsplash.com/${image.id}/400x300`}
                            alt={image.title || 'Uploaded image'}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Fallback to a generic image if there's an error loading the actual image
                              target.src = getDemoImageUrl(image.id);
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {image.title || `Image ${image.id.substring(0, 8)}`}
                            </p>
                            <div className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full dark:bg-violet-900/40 dark:text-violet-300">
                              ₱{image.price || '0'}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(`/marketplace?image=${image.id}`, '_blank')}
                          >
                            View in Marketplace
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-10 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No images for sale yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your images to the marketplace to start selling them.
                    </p>
                    <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                      <Link href="/marketplace">Go to Marketplace</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

      {/* Image Details Modal */}
      <Dialog open={showImageDetails} onOpenChange={setShowImageDetails}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-y-auto">
          {selectedImage && (
            <div>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-xl font-bold">
                  {selectedImage.description || `Image ${selectedImage.id.substring(0, 8)}`}
                </DialogTitle>
              </DialogHeader>
              
              <div className="relative w-full h-[60vh] max-h-[60vh] bg-gray-900">
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setShowImageDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="absolute inset-0 flex items-center justify-center">
                <Image
                    src={selectedImage.urls.regular || selectedImage.urls.small}
                    alt={selectedImage.description || selectedImage.title || 'Image details'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                  quality={90}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Fallback to a generic image if there's an error loading the actual image
                      target.src = getDemoImageUrl(selectedImage.id);
                    }}
                />
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Image Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium">ID:</dt>
                        <dd className="text-sm">{selectedImage.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium">Artist:</dt>
                        <dd className="text-sm">{selectedImage.user.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium">Status:</dt>
                        <dd className="text-sm">
                          {downloadedImages.some(img => img.id === selectedImage.id) ? (
                            <span className="text-blue-600">Downloaded</span>
                          ) : purchasedImages.some(img => img.id === selectedImage.id) ? (
                            <span className="text-green-600">Purchased</span>
                          ) : (
                            "Available"
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">License Information</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Commercial usage rights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Full resolution image</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Unlimited downloads</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowImageDetails(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={() => handleDownloadImage(selectedImage)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 