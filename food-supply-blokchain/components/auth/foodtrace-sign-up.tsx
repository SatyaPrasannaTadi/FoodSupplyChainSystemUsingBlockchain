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

export function FoodTraceSignUp() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check for empty fields (though 'required' attribute handles this in UI, this is for extra safety)
    if (!formData.name || !formData.email || !formData.organization || !formData.password || !formData.confirmPassword || !selectedRole) {
      setError("All fields are required")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.email.endsWith("@gmail.com")) {
      setError("Email must be a @gmail.com address")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          password: formData.password,
          role: selectedRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.msg || "Registration failed")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard/" + selectedRole)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create your account</CardTitle>
        <CardDescription className="text-center">Join the FoodTrace network and start tracking</CardDescription>
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                type="text"
                placeholder="Company or farm name"
                value={formData.organization}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={!selectedRole || loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
