import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SearchIt - Image Search Engine",
  description: "A modern image search engine with dark and light mode themes",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem 
          themes={['light', 'dark']}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
