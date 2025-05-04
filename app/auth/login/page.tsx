"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, ShoppingCart, Info } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/marketplace'
  const action = searchParams?.get('action') || ''
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [pendingPurchase, setPendingPurchase] = useState<any>(null)

  // Check for pending purchase
  useEffect(() => {
    const storedPurchase = localStorage.getItem('pendingPurchase')
    if (storedPurchase && action === 'purchase') {
      try {
        setPendingPurchase(JSON.parse(storedPurchase))
      } catch (err) {
        console.error("Error parsing pending purchase:", err)
      }
    }
  }, [action])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Use the actual API login function
      const response = await authAPI.login(email, password)
      console.log("Login successful:", response)
      
      if (action === 'purchase' && pendingPurchase) {
        // Show success message
        alert(`Login successful! You can now complete your purchase of "${pendingPurchase.title}".`)
        
        // Keep pendingPurchase in localStorage so marketplace can use it
        // It will be removed after purchase completion
        
        // Redirect to the return URL (marketplace page)
        router.push(returnUrl)
      } else {
        // Regular login, just redirect
        router.push(returnUrl)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to login. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-xl font-bold">SearchIt</span>
          </Link>
        </div>

        <Card className="border-violet-200 dark:border-violet-800">
          {action === 'purchase' && pendingPurchase && (
            <div className="flex items-center justify-center bg-violet-50 dark:bg-violet-900/20 p-3 -mb-2 rounded-t-md">
              <div className="flex items-center text-sm">
                <ShoppingCart className="h-4 w-4 mr-2 text-violet-600 dark:text-violet-400" />
                <span>Sign in to purchase <strong>{pendingPurchase.title}</strong> for <strong>₱{pendingPurchase.price}</strong></span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-md text-sm dark:bg-blue-900/30 dark:text-blue-400 flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                <span>Demo mode: Any email and password combination will work. Feel free to make one up or create a new account.</span>
              </div>
            
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : action === 'purchase' ? "Sign in & Continue Purchase" : "Sign in"}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href={`/auth/register${action ? `?action=${action}&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
