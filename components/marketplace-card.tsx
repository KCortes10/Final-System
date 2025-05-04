"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, ExternalLink, Star, X, ZoomIn, Check, Lock, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { saveAs } from 'file-saver'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Wallet, Building2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

interface MarketplaceCardProps {
  id: string
  src: string
  alt: string
  authorName: string
  externalUrl: string
  downloadUrl: string
  price: number
  rating: string
  title: string
  isUserUpload?: boolean
  filename?: string
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

export function MarketplaceCard({
  id,
  src,
  alt,
  authorName,
  externalUrl,
  downloadUrl,
  price,
  rating,
  title,
  isUserUpload = false,
  filename
}: MarketplaceCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [paymentStep, setPaymentStep] = useState<'details' | 'confirmation'>('details')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiration: '',
    cvv: '',
    gcashNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
  })
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false)

  // Check if user is authenticated and if there's a pending purchase
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Check for pending purchase
    const pendingPurchaseStr = localStorage.getItem('pendingPurchase');
    if (pendingPurchaseStr && token) {
      try {
        const pendingPurchase = JSON.parse(pendingPurchaseStr);
        
        // If this is the image that was pending purchase, show the purchase dialog
        if (pendingPurchase.id === id) {
          // Short timeout to ensure component is fully mounted
          setTimeout(() => {
            setShowPurchaseDialog(true);
            // Clear the pending purchase
            localStorage.removeItem('pendingPurchase');
          }, 500);
        }
      } catch (e) {
        console.error("Error parsing pending purchase:", e);
      }
    }
  }, [id]);

  // Check if image was previously downloaded or purchased
  useEffect(() => {
    const downloadedImages = JSON.parse(localStorage.getItem('downloadedImages') || '[]')
    setIsDownloaded(downloadedImages.includes(id))
    
    const purchasedImages = JSON.parse(localStorage.getItem('purchasedImages') || '[]')
    setIsPurchased(purchasedImages.includes(id))
  }, [id])

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Handle payment confirmation
  const handleConfirmPayment = () => {
    setPaymentStep('confirmation');
  }

  // Handle starting purchase process
  const handleInitiatePurchase = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      alert("You need to sign in or create an account to make a purchase.");
      
      // Save item info to localStorage to remember what they were buying
      localStorage.setItem('pendingPurchase', JSON.stringify({
        id,
        title,
        price,
        currency: '₱'
      }));
      
      router.push(`/auth/login?returnUrl=${returnUrl}&action=purchase`);
      return;
    }
    
    // User is authenticated, show purchase dialog
    setShowPurchaseDialog(true);
  }

  // Handle purchase completion
  const handleCompletePurchase = () => {
    try {
      // Store image ID in localStorage to mark as purchased
      const purchasedImages = JSON.parse(localStorage.getItem('purchasedImages') || '[]');
      
      if (!purchasedImages.includes(id)) {
        purchasedImages.push(id);
        localStorage.setItem('purchasedImages', JSON.stringify(purchasedImages));
      }
      
      // Update UI state
      setIsPurchased(true);
      setShowPurchaseDialog(false);
      setShowPurchaseSuccess(true);
      
      // Clear any pending purchase from localStorage
      localStorage.removeItem('pendingPurchase');
      
      // After 3 seconds, hide the success message
      setTimeout(() => {
        setShowPurchaseSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error completing purchase:", error);
      alert("There was a problem completing your purchase. Please try again.");
    }
  };

  // Handle direct download or purchase button click
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if image is purchased
    if (!isPurchased) {
      // Start purchase process, which checks authentication
      handleInitiatePurchase();
      return
    }
    
    try {
      // Fetch the image first
      const imageUrl = isUserUpload ? src : downloadUrl;
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Generate a filename
      const filename = `searchit-image-${id}.jpg`
      
      // Use file-saver to save the image
      saveAs(blob, filename)
      
      // Mark as downloaded
      const downloadedImages = JSON.parse(localStorage.getItem('downloadedImages') || '[]')
      if (!downloadedImages.includes(id)) {
        downloadedImages.push(id)
        localStorage.setItem('downloadedImages', JSON.stringify(downloadedImages))
        setIsDownloaded(true)
        
        // Show success message and offer to view profile
        setTimeout(() => {
          if (confirm('Image downloaded successfully! Would you like to view your profile to see all your downloaded images?')) {
            router.push('/profile');
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error downloading image:", error)
      alert("Sorry, we couldn't download this image. Please try again later.")
    }
  }

  // Preview handler
  const handleOpenPreview = () => {
    setShowPreview(true)
  }

  // Close preview handler
  const handleClosePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPreview(false)
  }

  // Prevent click propagation in the modal content
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Add to cart handler - renamed for clarity
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // If already purchased, no need to add to cart
    if (isPurchased) {
      alert(`You've already purchased "${title}"!`)
      return
    }
    
    // Start purchase process, which checks authentication
    handleInitiatePurchase();
  }

  return (
    <>
      <Card
        className="overflow-hidden border-violet-200 hover:border-violet-400 transition-colors dark:border-violet-800 dark:hover:border-violet-600 cursor-pointer"
        onClick={handleOpenPreview}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div 
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Add watermark if not purchased */}
            <Image
              src={src}
              alt={alt || 'Marketplace image'}
              fill
              className={`object-cover transition-transform duration-700 hover:filter hover:brightness-105 ${!isPurchased ? 'filter brightness-90' : ''} ${isHovered ? 'scale-110' : 'hover:scale-110'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Fallback to a generic image if there's an error loading the actual image
                target.src = getFallbackImageUrl(id);
              }}
            />
            {!isPurchased && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-3xl opacity-30 rotate-[-30deg]">
                  PREVIEW
                </div>
              </div>
            )}
            <div 
              className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-2 transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex justify-end">
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className={`h-8 w-8 rounded-full ${isPurchased ? (isDownloaded ? 'bg-green-500/50 hover:bg-green-600/60' : 'bg-black/30 hover:bg-violet-500/50') : 'bg-gray-500/50 hover:bg-gray-600/60'} text-white transition-all duration-300 ease-in-out hover:scale-110`}
                    title={isPurchased ? (isDownloaded ? "Already downloaded" : "Download image") : "Purchase required to download"}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(e)
                    }}
                  >
                    {isPurchased ? (isDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />) : <Lock className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full bg-black/30 hover:bg-violet-500/50 text-white transition-all duration-300 ease-in-out hover:scale-110"
                    title="Enlarge image"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenPreview()
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium truncate">
              {title}
            </h3>
            <div className="flex flex-col gap-2">
              <Badge className="pointer-events-none w-fit bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                ₱{price}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              <span>{rating}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">By {authorName}</div>
              {isUserUpload && (
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  User Upload
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            className={`w-full ${isPurchased ? 'bg-green-600 hover:bg-green-700' : 'bg-violet-600 hover:bg-violet-700'} text-white hover:scale-105 transition-all duration-300 ease-in-out group`}
            onClick={handleAddToCart}
            data-purchase-button="true"
            id={`purchase-button-${id}`}
          >
            {isPurchased ? (
              <>
                <Check className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Purchased
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Purchase Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Image Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" 
          onClick={handleClosePreview}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] mx-4"
            onClick={handleModalContentClick}
          >
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-12 right-0 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 z-10 transition-all duration-300 ease-in-out hover:scale-110"
              onClick={handleClosePreview}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="relative aspect-auto w-full h-[70vh] rounded-lg overflow-hidden bg-gray-900">
              <Image
                src={downloadUrl || src}
                alt={alt || 'Preview image'}
                fill
                className={`object-contain ${!isPurchased ? 'filter brightness-90' : ''}`}
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
                quality={90}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Fallback to a generic image if there's an error loading the actual image
                  target.src = getFallbackImageUrl(id);
                }}
              />
              {!isPurchased && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-5xl opacity-30 rotate-[-30deg]">
                    PREVIEW ONLY
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-white">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-300">By {authorName}</p>
                {isUserUpload && filename && (
                  <p className="text-xs text-gray-400">File: {filename}</p>
                )}
              </div>
              <div className="flex gap-2">
                {isPurchased ? (
                  <Button
                    variant="outline"
                    className={`group ${isDownloaded ? 'bg-green-600/50 border-green-700 hover:bg-green-700/70' : 'bg-black/50 border-gray-700 hover:bg-violet-600/70'} text-white hover:text-white hover:scale-105 transition-all duration-300 ease-in-out`}
                    onClick={handleDownload}
                  >
                    {isDownloaded ? 
                      <><Check className="h-4 w-4 mr-2 group-hover:animate-bounce" />Downloaded</> : 
                      <><Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />Download</>
                    }
                  </Button>
                ) : (
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white hover:scale-105 transition-all duration-300 ease-in-out group"
                    onClick={handleInitiatePurchase}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                    Purchase - ₱{price}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={(open) => {
        if (!open) {
          setPaymentStep('details');
          setPaymentMethod('credit-card');
        }
        setShowPurchaseDialog(open);
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-0 py-2">
            <DialogTitle className="text-center text-xl mb-1">Complete Your Purchase</DialogTitle>
            <DialogDescription className="text-center text-sm">
              {paymentStep === 'details' ? 'Select your payment method' : 'Confirm payment details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
              <Image 
                src={src} 
                alt={title} 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-xs text-muted-foreground">By {authorName}</p>
              </div>
              <div className="text-lg font-bold text-violet-600">₱{price}</div>
            </div>
            
            {paymentStep === 'details' ? (
              <>
                <div className="bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg mb-3">
                  <h4 className="font-medium text-sm mb-1">What you'll get:</h4>
                  <ul className="text-xs space-y-1">
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      Full resolution image
                    </li>
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      Commercial usage rights
                    </li>
                    <li className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      Download instantly after purchase
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3 mb-3">
                  <h4 className="font-medium text-sm">Select Payment Method</h4>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-2">
                    <div className={`flex items-center space-x-2 border p-2 rounded-lg ${paymentMethod === 'credit-card' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <label htmlFor="credit-card" className="flex items-center gap-2 text-sm font-medium leading-none w-full cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        <span>Credit Card</span>
                      </label>
                    </div>
                    
                    <div className={`flex items-center space-x-2 border p-2 rounded-lg ${paymentMethod === 'gcash' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                      <RadioGroupItem value="gcash" id="gcash" />
                      <label htmlFor="gcash" className="flex items-center gap-2 text-sm font-medium leading-none w-full cursor-pointer">
                        <Wallet className="h-4 w-4" />
                        <span>GCash</span>
                      </label>
                    </div>
                    
                    <div className={`flex items-center space-x-2 border p-2 rounded-lg ${paymentMethod === 'bank-transfer' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                      <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                      <label htmlFor="bank-transfer" className="flex items-center gap-2 text-sm font-medium leading-none w-full cursor-pointer">
                        <Building2 className="h-4 w-4" />
                        <span>Bank Transfer</span>
                      </label>
                    </div>
                  </RadioGroup>
                  
                  {/* Credit Card Form */}
                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label htmlFor="nameOnCard" className="text-xs font-medium">Name on Card</label>
                        <input
                          type="text"
                          id="nameOnCard"
                          name="nameOnCard"
                          value={formData.nameOnCard}
                          onChange={handleInputChange}
                          className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cardNumber" className="text-xs font-medium">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="4242 4242 4242 4242"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label htmlFor="expiration" className="text-xs font-medium">Expiration Date</label>
                          <input
                            type="text"
                            id="expiration"
                            name="expiration"
                            value={formData.expiration}
                            onChange={handleInputChange}
                            className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="text-xs font-medium">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* GCash Form */}
                  {paymentMethod === 'gcash' && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label htmlFor="gcashNumber" className="text-xs font-medium">GCash Number</label>
                        <input
                          type="text"
                          id="gcashNumber"
                          name="gcashNumber"
                          value={formData.gcashNumber}
                          onChange={handleInputChange}
                          className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="+63 XXX XXX XXXX"
                          required
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-xs">
                        <p className="font-medium mb-1">How to pay with GCash:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Enter your registered GCash number</li>
                          <li>You'll receive a verification code via SMS</li>
                          <li>Confirm payment in your GCash app</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  
                  {/* Bank Transfer Form */}
                  {paymentMethod === 'bank-transfer' && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <label htmlFor="bankName" className="text-xs font-medium">Bank Name</label>
                        <input
                          type="text"
                          id="bankName"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="Enter your bank name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="bankAccountName" className="text-xs font-medium">Account Name</label>
                        <input
                          type="text"
                          id="bankAccountName"
                          name="bankAccountName"
                          value={formData.bankAccountName}
                          onChange={handleInputChange}
                          className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="bankAccountNumber" className="text-xs font-medium">Account Number</label>
                        <input
                          type="text"
                          id="bankAccountNumber"
                          name="bankAccountNumber"
                          value={formData.bankAccountNumber}
                          onChange={handleInputChange}
                          className="w-full h-8 mt-1 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-800 dark:border-gray-700"
                          placeholder="XXXX XXXX XXXX XXXX"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <Check className="h-4 w-4" /> Payment Details Confirmed
                  </h4>
                  <div className="mt-2 space-y-1 text-xs">
                    <p><span className="font-medium">Amount:</span> ₱{price}</p>
                    <p><span className="font-medium">Payment Method:</span> {
                      paymentMethod === 'credit-card' ? 'Credit Card' : 
                      paymentMethod === 'gcash' ? 'GCash' : 'Bank Transfer'
                    }</p>
                    {paymentMethod === 'credit-card' && (
                      <p><span className="font-medium">Card:</span> **** **** **** {formData.cardNumber.slice(-4)}</p>
                    )}
                    {paymentMethod === 'gcash' && (
                      <p><span className="font-medium">GCash Number:</span> {formData.gcashNumber}</p>
                    )}
                    {paymentMethod === 'bank-transfer' && (
                      <>
                        <p><span className="font-medium">Bank:</span> {formData.bankName}</p>
                        <p><span className="font-medium">Account:</span> **** {formData.bankAccountNumber.slice(-4)}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="border-t border-b py-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-sm">Total Payment:</span>
                    <span className="text-violet-600">₱{price}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-0">
            {paymentStep === 'details' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPurchaseDialog(false)}
                  className="flex-1 text-sm py-1 h-9"
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-violet-600 hover:bg-violet-700 text-white flex-1 text-sm py-1 h-9"
                  onClick={handleConfirmPayment}
                  disabled={
                    (paymentMethod === 'credit-card' && (!formData.nameOnCard || !formData.cardNumber || !formData.expiration || !formData.cvv)) ||
                    (paymentMethod === 'gcash' && !formData.gcashNumber) ||
                    (paymentMethod === 'bank-transfer' && (!formData.bankAccountName || !formData.bankAccountNumber || !formData.bankName))
                  }
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setPaymentStep('details')}
                  className="flex-1 text-sm py-1 h-9"
                >
                  Back
                </Button>
                <Button 
                  className="bg-violet-600 hover:bg-violet-700 text-white flex-1 text-sm py-1 h-9"
                  onClick={handleCompletePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Complete Purchase - ₱${price}`}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success notification */}
      {showPurchaseSuccess && (
        <div className="fixed inset-x-0 bottom-0 mb-4 px-4 flex justify-center z-50 animate-fade-in-up">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-600" />
            <span className="font-medium">
              Thank you for your purchase! You can now download "{title}" anytime.
            </span>
          </div>
        </div>
      )}
    </>
  )
} 