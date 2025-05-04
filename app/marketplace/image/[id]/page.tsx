import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  ArrowLeft,
  Heart,
  Share,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Star,
  User,
  Calendar,
  Shield,
  Eye,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ImageDetailPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

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
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900/30 dark:hover:text-violet-300"
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Add to favorites</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900/30 dark:hover:text-violet-300"
            >
              <Share className="h-5 w-5" />
              <span className="sr-only">Share</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden border border-violet-200 dark:border-violet-800">
              <Image
                src={`/placeholder.svg?height=800&width=800&text=Image ${id}`}
                alt={`Image ${id}`}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4">
              <Tabs defaultValue="details">
                <TabsList className="w-full bg-transparent border-b">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-violet-700 data-[state=active]:border-b-2 data-[state=active]:border-violet-700 dark:data-[state=active]:text-violet-300 dark:data-[state=active]:border-violet-300 rounded-none"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="license"
                    className="data-[state=active]:bg-transparent data-[state=active]:text-violet-700 data-[state=active]:border-b-2 data-[state=active]:border-violet-700 dark:data-[state=active]:text-violet-300 dark:data-[state=active]:border-violet-300 rounded-none"
                  >
                    License
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">Description</h3>
                      <p className="text-muted-foreground mt-2">
                        {id === 1 &&
                          "A breathtaking mountain landscape captured during golden hour, showcasing the majestic peaks and valleys with stunning natural lighting."}
                        {id === 2 &&
                          "Modern city skyline at dusk with illuminated skyscrapers reflecting in the water, creating a dramatic urban panorama."}
                        {id === 3 &&
                          "Serene ocean sunset with vibrant colors painting the sky and reflecting on the calm water surface."}
                        {id !== 1 &&
                          id !== 2 &&
                          id !== 3 &&
                          "High-quality professional photograph with excellent composition and lighting. Perfect for various commercial and personal projects."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Resolution</h4>
                        <p>5000 x 3333 px</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Format</h4>
                        <p>JPEG</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                        <p>12.4 MB</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Date Uploaded</h4>
                        <p>May 2, 2025</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-lg">Tags</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {id === 1 && (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              mountains
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              landscape
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              nature
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              scenic
                            </Badge>
                          </>
                        )}
                        {id === 2 && (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              city
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              skyline
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              urban
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              architecture
                            </Badge>
                          </>
                        )}
                        {id === 3 && (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              sunset
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              ocean
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              beach
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              seascape
                            </Badge>
                          </>
                        )}
                        {id !== 1 && id !== 2 && id !== 3 && (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              photography
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              professional
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              high-quality
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                            >
                              stock
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="license" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">Standard License</h3>
                      <p className="text-muted-foreground mt-2">
                        The Standard License grants you the right to use the image for personal and commercial projects
                        with the following conditions:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                        <li>Use in digital media (websites, apps, social media)</li>
                        <li>Use in printed materials (brochures, posters, books)</li>
                        <li>No redistribution or resale of the image as-is</li>
                        <li>Attribution is not required but appreciated</li>
                        <li>Unlimited number of projects</li>
                        <li>Worldwide usage rights</li>
                      </ul>
                    </div>

                    <div className="flex items-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-md">
                      <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2" />
                      <p className="text-sm">
                        This image includes a digital certificate of authenticity and usage rights.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div>
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {id === 1 && "Mountain Landscape"}
                      {id === 2 && "City Skyline"}
                      {id === 3 && "Ocean Sunset"}
                      {id === 4 && "Forest Path"}
                      {id === 5 && "Desert Dunes"}
                      {id === 6 && "Snowy Mountains"}
                      {id === 7 && "Tropical Beach"}
                      {id === 8 && "Autumn Forest"}
                      {id === 9 && "Waterfall Scene"}
                      {id > 9 && `Image ${id}`}
                    </h1>

                    <div className="flex items-center mt-2">
                      <div className="flex items-center text-amber-500 mr-4">
                        <Star className="h-4 w-4 fill-amber-500 mr-1" />
                        <span>{(4 + (id % 10) / 10).toFixed(1)}</span>
                        <span className="text-muted-foreground ml-1">(127 reviews)</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{1240 + id * 57} views</span>
                      </div>
                    </div>

                    <div className="flex items-center mt-4">
                      <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="font-medium">Photographer {id}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Member since January 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-b py-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                        ${(9.99 + (id - 1) * 5).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-12" asChild>
                        <Link href="/auth/login">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Link>
                      </Button>

                      <div className="text-center text-sm text-muted-foreground">
                        You must{" "}
                        <Link
                          href="/auth/login"
                          className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                          log in
                        </Link>{" "}
                        or{" "}
                        <Link
                          href="/auth/register"
                          className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                        >
                          register
                        </Link>{" "}
                        to purchase
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Payment Methods</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-3 flex items-center">
                        <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2" />
                        <span>Credit Card</span>
                      </div>
                      <div className="border rounded-md p-3 flex items-center">
                        <Smartphone className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2" />
                        <span>GCash</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-md flex items-center">
                      <Shield className="h-5 w-5 text-violet-600 dark:text-violet-400 mr-2 flex-shrink-0" />
                      <p className="text-sm">
                        Secure payment processing. Your financial information is never shared with sellers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <h3 className="font-medium text-lg mb-4">Similar Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => {
                  const similarId = ((id + i + 1) % 9) + 1
                  return (
                    <Link key={i} href={`/marketplace/image/${similarId}`} className="block">
                      <div className="relative aspect-square rounded-md overflow-hidden border border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-600 transition-colors">
                        <Image
                          src={`/placeholder.svg?height=200&width=200&text=Image ${similarId}`}
                          alt={`Similar Image ${similarId}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-1 text-sm font-medium truncate">
                        ${(9.99 + (similarId - 1) * 5).toFixed(2)}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
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
