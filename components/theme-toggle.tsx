"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-violet-400 hover:bg-violet-900/30 transition-all hover:scale-110 rounded-full"
      >
        <div className="h-5 w-5" />
        <span className="sr-only">Loading theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-violet-400 hover:bg-violet-900/30 transition-all hover:scale-110 rounded-full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
