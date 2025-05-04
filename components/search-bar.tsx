"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Mic, Search, X, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const suggestions = [
  "nature photography",
  "city skylines",
  "beautiful landscapes",
  "dogs",
  "cats",
  "wildlife",
  "architecture",
  "food photography",
]

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize the search query from URL parameters if available
  useEffect(() => {
    const queryParam = searchParams?.get("q")
    if (queryParam) {
      setQuery(queryParam)
    }
  }, [searchParams])

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearSearch = (e: React.MouseEvent) => {
    e.stopPropagation()
    setQuery("")
  }
  
  // Speech recognition simulation
  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // This is just a simulation - in a real app, you would use the Web Speech API
      setTimeout(() => {
        setQuery(suggestions[Math.floor(Math.random() * suggestions.length)]);
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between border-2 px-3 sm:pl-4 sm:pr-4 py-5 sm:py-7 text-left font-normal rounded-xl sm:rounded-2xl
              backdrop-blur-sm bg-white/5 dark:bg-black/5
              border-violet-200 dark:border-violet-800/50
              shadow-[0_4px_20px_rgba(142,85,255,0.1)] dark:shadow-[0_4px_20px_rgba(142,85,255,0.08)]
              transition-all duration-300 ease-in-out
              hover:border-violet-400 focus:border-violet-500 
              dark:hover:border-violet-600 dark:focus:border-violet-500 
              hover:shadow-[0_8px_25px_rgba(142,85,255,0.15)] dark:hover:shadow-[0_8px_25px_rgba(142,85,255,0.12)]
              focus:shadow-[0_0_0_2px_rgba(142,85,255,0.4)]
              pulse-shadow"
            >
              <div className="flex w-full items-center gap-2 sm:gap-3">
                <div className="flex h-6 sm:h-8 w-6 sm:w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/70 transition-colors group-hover:bg-violet-200 dark:group-hover:bg-violet-800 animate-shimmer">
                  <Search className="h-3 sm:h-4 w-3 sm:w-4 text-violet-600 dark:text-violet-300" />
                </div>
                <input
                  placeholder="Search for images..."
                  className="flex-1 bg-transparent outline-none text-base sm:text-lg placeholder:text-muted-foreground"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex gap-1 sm:gap-2 items-center">
                {query && (
                  <span 
                    className="flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/70 cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors hover:rotate-90 transition-transform duration-300"
                    onClick={clearSearch}
                  >
                    <X className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-violet-600 dark:text-violet-300" />
                  </span>
                )}
                <span 
                  className={`flex h-6 sm:h-7 w-6 sm:w-7 items-center justify-center rounded-full ${isListening ? 'bg-red-100 dark:bg-red-900/70 scale-110' : 'bg-violet-100 dark:bg-violet-900/70'} cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-800 transition-all duration-300 hover:scale-110`}
                  onClick={toggleListening}
                >
                  <Mic className={`h-3 sm:h-3.5 w-3 sm:w-3.5 ${isListening ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-violet-600 dark:text-violet-300'}`} />
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></span>
                  )}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[calc(100vw-2rem)] sm:w-full p-0 rounded-xl border-violet-200 dark:border-violet-800/50 backdrop-blur-md bg-white/80 dark:bg-black/80 shadow-[0_8px_30px_rgba(142,85,255,0.12)] dark:shadow-[0_8px_30px_rgba(142,85,255,0.1)]" 
            align="start"
          >
            <Command className="rounded-lg bg-transparent">
              <CommandInput placeholder="Search for images..." value={query} onValueChange={setQuery} />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      onSelect={() => {
                        setQuery(suggestion)
                        setOpen(false)
                        router.push(`/search?q=${encodeURIComponent(suggestion)}`)
                      }}
                      className="hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-900/40 dark:hover:text-violet-300 transition-colors flex items-center gap-2"
                    >
                      <Search className="h-3 sm:h-4 w-3 sm:w-4 text-muted-foreground" />
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex w-full sm:w-auto sm:ml-4 mt-2 sm:mt-0">
          <Button
            className="w-full sm:w-auto rounded-xl sm:rounded-full px-4 sm:px-5 py-5 sm:py-7 
            shadow-sm bg-gradient-to-r from-violet-600 to-violet-500 border-0
            hover:from-violet-500 hover:to-violet-400 text-white 
            transition-all duration-300 ease-in-out 
            hover:shadow-[0_8px_20px_rgba(142,85,255,0.25)] active:scale-95
            relative overflow-hidden group"
            onClick={handleSearch}
            type="submit"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-400/0 via-violet-400/40 to-violet-400/0 group-hover:animate-shimmer"></span>
            <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 mr-2 animate-pulse" style={{ animationDuration: '3s' }} />
            <span className="font-medium">Search</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
