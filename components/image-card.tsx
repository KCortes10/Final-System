"use client"

import { Button } from "@/components/ui/button"
import { Download, ExternalLink, X, ZoomIn, Check } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { saveAs } from 'file-saver'

interface ImageCardProps {
  id: string
  src: string
  alt: string
  authorName: string
  externalUrl: string
  downloadUrl: string
}

export function ImageCard({
  id,
  src,
  alt,
  authorName,
  externalUrl,
  downloadUrl
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  // Check if image was previously downloaded
  useEffect(() => {
    const downloadedImages = JSON.parse(localStorage.getItem('downloadedImages') || '[]')
    setIsDownloaded(downloadedImages.includes(id))
  }, [id])

  // Direct download handler
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Fetch the image first
      const response = await fetch(downloadUrl)
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

  return (
    <>
      <div 
        className="relative aspect-square overflow-hidden rounded-md cursor-pointer hover:shadow-lg hover:shadow-violet-500/10 border border-muted hover:border-violet-300 dark:hover:border-violet-700 transition-all"
        onClick={handleOpenPreview}
      >
        <div 
          className="relative w-full h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={src}
            alt={alt || 'Image'}
            fill
            className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 filter brightness-105' : 'hover:scale-105'}`}
          />
          <div 
            className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-2 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex justify-end">
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`h-8 w-8 rounded-full ${isDownloaded ? 'bg-green-500/50 hover:bg-green-600/60' : 'bg-black/30 hover:bg-violet-500/50'} text-white transition-all duration-300 ease-in-out hover:scale-110`}
                  title={isDownloaded ? "Already downloaded" : "Download image"}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(e)
                  }}
                >
                  {isDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
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
            <div className="text-xs text-white truncate w-full mt-auto">
              Photo by {authorName}
            </div>
          </div>
        </div>
      </div>

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
                src={downloadUrl}
                alt={alt || 'Preview image'}
                fill
                className="object-contain transition-all duration-500 hover:scale-[1.02] hover:filter hover:brightness-110"
                sizes="(max-width: 768px) 100vw, 80vw"
                priority
                quality={90}
              />
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm text-gray-300">Photo by {authorName}</p>
              </div>
              <div className="flex gap-2">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 