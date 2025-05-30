import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/firebase"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function SignIn({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const token = await result.user.getIdToken()
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex justify-center items-center min-h-screen px-4", className)} {...props}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Continue with Google"
              )}
            </Button>

            <div className="relative text-center">
              <span className="bg-white px-2 text-sm text-muted-foreground relative z-10">
                Or sign in with email
              </span>
              <div className="absolute left-0 top-1/2 w-full border-t -z-10" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </form>

            <p className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <a href="/sign-up" className="underline underline-offset-4 text-primary hover:text-primary/80">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
        <div className="text-muted-foreground text-xs text-center px-6 pb-4 pt-2">
          By continuing, you agree to our{" "}
          <a href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>.
        </div>
      </Card>
    </div>
  )
}
