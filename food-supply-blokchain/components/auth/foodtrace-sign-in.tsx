"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sprout, Truck, Store, User, ShieldCheck } from "lucide-react"

const roles = [
  { value: "producer", label: "Producer", icon: Sprout, description: "Farmers & Suppliers" },
  { value: "distributor", label: "Distributor", icon: Truck, description: "Logistics & Transport" },
  { value: "retailer", label: "Retailer", icon: Store, description: "Stores & Markets" },
  { value: "consumer", label: "Consumer", icon: User, description: "End Users" },
]

export function FoodTraceSignIn() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("https://foodsupplychainsystemusingblockchain-xaa5.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      console.log(data)

      if (!res.ok || !data || !data.token) {
        throw new Error(data.msg || "Login failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // customized redirection based on role could happen here if needed
      const role = data.role === 'supplier' ? 'distributor' : data.user.role
      router.push("/dashboard/" + data.user.role)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Sign in to FoodTrace</CardTitle>
        <CardDescription className="text-center">Select your role and enter your credentials</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Select Your Role</Label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${selectedRole === role.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-transparent"
                      }`}
                  >
                    <Icon
                      className={`size-6 ${selectedRole === role.value ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="text-center">
                      <div className="text-sm font-medium">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={!selectedRole || loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/sign-up" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
