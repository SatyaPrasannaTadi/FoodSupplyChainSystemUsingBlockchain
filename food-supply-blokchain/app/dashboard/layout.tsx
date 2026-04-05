"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Package, Truck, Store, Users, Shield, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        // Check for user in localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        } else {
            // Redirect to sign-in if no user found
            router.push("/sign-in")
        }
    }, [router])

    const handleSignOut = () => {
        localStorage.removeItem("user")
        router.push("/sign-in")
    }

    // Prevent hydration mismatch or flash by not rendering until mounted
    if (!mounted) return null
    if (!user) return null

    // Define navigation items based on roles
    const getNavItems = () => {
        // Normalize role (handle supplier vs distributor ambiguity)
        const role = user.role === 'supplier' ? 'distributor' : user.role

        switch (role) {
            case "producer":
                return [
                    { href: "/dashboard/producer", label: "Producer Dashboard", icon: ShoppingCart }
                ]
            case "distributor":
                return [
                    { href: "/dashboard/distributor", label: "Distributor Dashboard", icon: Truck }
                ]
            case "retailer":
                return [
                    { href: "/dashboard/retailer", label: "Retailer Dashboard", icon: Store }
                ]
            case "consumer":
                return [
                    { href: "/dashboard/consumer", label: "Consumer Portal", icon: Users }
                ]
            case "admin":
                return [
                    { href: "/dashboard/admin", label: "Admin Console", icon: Shield }
                ]
            default:
                return []
        }
    }

    const navItems = getNavItems()

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white p-6 flex flex-col fixed h-full z-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        FoodTrace
                    </h1>
                    <p className="text-emerald-100 text-sm mt-1">Supply Chain ({user.role})</p>
                </div>

                <nav className="space-y-2 flex-1">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors opacity-80 hover:opacity-100`}
                    >
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                    </Link>

                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors ${pathname === item.href ? "bg-emerald-700 font-semibold" : ""}`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-emerald-500/30">
                    <div className="p-4 bg-emerald-900/50 rounded-lg mb-4">
                        <p className="font-medium text-sm text-white truncate">{user.name}</p>
                        <p className="text-xs text-emerald-200 capitalize truncate">{user.email}</p>
                    </div>
                    <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-emerald-700 hover:text-white pl-2"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50 ml-64 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
