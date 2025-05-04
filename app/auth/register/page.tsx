"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, ShoppingCart, Info } from "lucide-react"
import Link from "next/link"
import { authAPI } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get('returnUrl') || '/marketplace'
  const action = searchParams?.get('action') || ''
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      // Use the actual API register function
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password
      )

      console.log("Registration successful:", response)
      
      // Auto login after registration
      try {
        await authAPI.login(formData.email, formData.password)
      } catch (loginErr) {
        console.error("Auto-login failed after registration:", loginErr)
      }
      
      if (action === 'purchase' && pendingPurchase) {
        // Show success message
        alert(`Account created! You can now complete your purchase of "${pendingPurchase.title}".`)
        
        // Keep pendingPurchase in localStorage so marketplace can use it
        // It will be removed after purchase completion
        
        // Redirect to the return URL (marketplace page)
        router.push(returnUrl)
      } else {
        // Regular registration, just redirect
        router.push('/marketplace')
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.")
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
                <span>Create an account to purchase <strong>{pendingPurchase.title}</strong> for <strong>₱{pendingPurchase.price}</strong></span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your details to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-md text-sm dark:bg-blue-900/30 dark:text-blue-400 flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                <span>Demo mode: You can create an account with any details. Alternatively, you can log in with any email/password.</span>
              </div>
            
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border-violet-200 focus:border-violet-400 dark:border-violet-800 dark:focus:border-violet-600"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                    terms and conditions
                  </Link>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : action === 'purchase' ? "Create account & Continue Purchase" : "Create account"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href={`/auth/login${action ? `?action=${action}&returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
