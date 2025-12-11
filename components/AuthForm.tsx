"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Gift } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/claim"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "Account not claimed. Please claim your account.") {
          setIsLogin(false)
          setError("Please claim your account to set a password.")
        } else if (data.error === "Account already claimed. Please login.") {
          setIsLogin(true)
          setError("Account already claimed. Please login.")
        } else {
          setError(data.error)
        }
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-white/10 ring-1 ring-white/20">
            <Gift className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <CardTitle className="text-center">Secret Santa</CardTitle>
        <CardDescription className="text-center">
          {isLogin ? "Enter your details to login" : "Claim your account & set password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Password" : "Set New Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-300 text-center bg-red-900/50 py-1 rounded border border-red-500/20">{error}</p>}
          </div>
          <Button className="w-full mt-6" type="submit" disabled={loading}>
            {loading ? "Loading..." : (isLogin ? "Login" : "Claim Account")}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-white/50 hover:text-white"
        >
          {isLogin ? "Need to claim account?" : "Already have an account?"}
        </Button>
      </CardFooter>
    </Card>
  )
}
