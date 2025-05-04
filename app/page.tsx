import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchBar } from "@/components/search-bar"
import { Sparkles, ImageIcon, ShoppingCart, Zap, Heart } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/70 relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-40 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '15s' }} />
      
      {/* Header with animated logo and theme toggle */}
      <header className="container z-10 flex items-center justify-between py-4 sm:py-6 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 transition-all duration-300 hover:scale-105">
          <div className="flex h-8 sm:h-10 w-8 sm:w-10 items-center justify-center rounded-full bg-violet-900/50 backdrop-blur-sm shadow-lg shadow-violet-500/10 transition-all duration-300 ease-in-out group-hover:bg-violet-800/70 group-hover:shadow-violet-500/20">
            <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-violet-400 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:text-violet-300" />
          </div>
          <span className="text-lg sm:text-xl font-bold">SearchIt</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="container flex flex-1 flex-col items-center justify-center relative z-10 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto space-y-8 sm:space-y-16">
          {/* Enhanced logo and title with animation */}
          <div className="flex flex-col items-center space-y-4 sm:space-y-8">
            <div className="group flex items-center gap-3 sm:gap-4 transition-all duration-500 hover:scale-105">
              <div className="flex h-14 sm:h-20 w-14 sm:w-20 items-center justify-center rounded-2xl bg-violet-900/40 backdrop-blur-md border border-violet-800/20 shadow-lg shadow-violet-500/20 
                  transition-all duration-500 ease-in-out 
                  group-hover:bg-violet-800/60 group-hover:shadow-xl group-hover:shadow-violet-500/30
                  group-hover:border-violet-700/30 group-hover:rounded-3xl
                  animate-shimmer">
                <Sparkles className="h-7 sm:h-10 w-7 sm:w-10 text-violet-300 transition-all duration-500 ease-in-out group-hover:text-violet-200 group-hover:scale-110" />
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/70">
                Search<span className="relative bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-500 dark:from-violet-400 dark:to-purple-400">
                  It
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-400 rounded-full animate-ping"></span>
                </span>
              </h1>
            </div>
            <p className="text-base sm:text-xl text-center max-w-lg text-muted-foreground px-2">
              Discover beautiful images with our fast and intelligent
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-500 dark:from-violet-400 dark:to-purple-400 mx-1 hover:animate-pulse inline-block transition-all duration-300">
                image search engine
              </span>.
            </p>
          </div>

          {/* Enhanced search bar with animation */}
          <div className="w-full transform hover:scale-[1.01] transition-all duration-300 ease-in-out px-2 sm:px-0">
            <SearchBar />
          </div>

          {/* Enhanced feature cards with hover effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl px-2 sm:px-4">
            <div className="group flex flex-col items-center p-4 sm:p-6 text-center rounded-2xl backdrop-blur-md bg-white/5 dark:bg-black/5 border border-violet-200/20 dark:border-violet-800/20 
                shadow-sm hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 ease-in-out hover:bg-white/10 dark:hover:bg-black/10
                hover:transform hover:scale-105">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/70 mb-3 sm:mb-4
                  group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors">
                <ImageIcon className="h-5 sm:h-6 w-5 sm:w-6 text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Beautiful Images</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Access millions of high-quality photos from professionals around the world</p>
            </div>
            
            <div className="group flex flex-col items-center p-4 sm:p-6 text-center rounded-2xl backdrop-blur-md bg-white/5 dark:bg-black/5 border border-violet-200/20 dark:border-violet-800/20 
                shadow-sm hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 ease-in-out hover:bg-white/10 dark:hover:bg-black/10
                hover:transform hover:scale-105">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/70 mb-3 sm:mb-4
                  group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors">
                <Zap className="h-5 sm:h-6 w-5 sm:w-6 text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Intelligent Search</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Our AI-powered search understands what you're looking for</p>
            </div>
            
            <div className="group flex flex-col items-center p-4 sm:p-6 text-center rounded-2xl backdrop-blur-md bg-white/5 dark:bg-black/5 border border-violet-200/20 dark:border-violet-800/20 
                shadow-sm hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 ease-in-out hover:bg-white/10 dark:hover:bg-black/10
                hover:transform hover:scale-105 col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/70 mb-3 sm:mb-4
                  group-hover:bg-violet-200 dark:group-hover:bg-violet-800 transition-colors">
                <ShoppingCart className="h-5 sm:h-6 w-5 sm:w-6 text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Marketplace</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Buy and sell premium images through our integrated marketplace</p>
            </div>
          </div>

          {/* Enhanced action buttons with improved animations */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center w-full px-6">
            <Button 
              className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-full 
                  shadow-md shadow-violet-500/20
                  transition-all duration-300 ease-in-out 
                  hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105
                  active:scale-95 group"
              asChild
            >
              <Link href="/search" className="flex items-center justify-center gap-2">
                <ImageIcon className="h-4 sm:h-5 w-4 sm:w-5 transition-transform group-hover:rotate-6" />
                <span className="font-medium">Explore Images</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-300 
                  hover:bg-violet-50 dark:hover:bg-violet-900/40 
                  hover:text-violet-700 dark:hover:text-violet-200 
                  hover:border-violet-400 dark:hover:border-violet-600 
                  rounded-full shadow-md shadow-violet-500/10
                  transition-all duration-300 ease-in-out
                  hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105
                  active:scale-95 group"
              asChild
            >
              <Link href="/marketplace" className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 transition-transform group-hover:rotate-6" />
                <span className="font-medium">Marketplace</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Enhanced footer */}
      <footer className="py-6 sm:py-8 relative z-10">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-violet-200/20 dark:border-violet-800/20 pt-4 sm:pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-6 sm:h-8 w-6 sm:w-8 items-center justify-center rounded-full bg-violet-900/30 backdrop-blur-sm">
                <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 text-violet-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium">SearchIt © 2025</span>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground order-3 sm:order-2">
              Made with <Heart className="h-3 w-3 inline text-red-500 animate-pulse" /> by Kemily Cortes
            </div>
            
            <a 
              href="https://github.com/KCortes10/Final-System" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1 hover:underline order-2 sm:order-3"
            >
              <span>View project on</span>
              <span className="font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
