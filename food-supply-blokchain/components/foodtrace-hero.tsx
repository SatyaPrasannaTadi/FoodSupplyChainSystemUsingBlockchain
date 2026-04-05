import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingCart, Truck, Store, Users, Shield } from "lucide-react"

export function FoodTraceHero() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Track Your Food from Farm to Table
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent, secure, and immutable food supply chain tracking powered by blockchain technology
            </p>
          </div>

          {/* Dashboard Access */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto pt-8">
            <Link href="/dashboard/producer">
              <Button
                className="w-full h-auto flex-col gap-2 py-6 bg-emerald-600 hover:bg-emerald-700"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Producer</span>
              </Button>
            </Link>

            <Link href="/dashboard/distributor">
              <Button
                className="w-full h-auto flex-col gap-2 py-6 bg-blue-600 hover:bg-blue-700"
              >
                <Truck className="h-6 w-6" />
                <span>Supplier</span>
              </Button>
            </Link>

            <Link href="/dashboard/retailer">
              <Button
                className="w-full h-auto flex-col gap-2 py-6 bg-purple-600 hover:bg-purple-700"
              >
                <Store className="h-6 w-6" />
                <span>Retailer</span>
              </Button>
            </Link>

            <Link href="/dashboard/consumer">
              <Button
                className="w-full h-auto flex-col gap-2 py-6 bg-orange-600 hover:bg-orange-700"
              >
                <Users className="h-6 w-6" />
                <span>Consumer</span>
              </Button>
            </Link>

            <Link href="/dashboard/admin">
              <Button
                className="w-full h-auto flex-col gap-2 py-6 bg-gray-800 hover:bg-gray-900"
              >
                <Shield className="h-6 w-6" />
                <span>Admin</span>
              </Button>
            </Link>
          </div> */}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/dashboard/consumer">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Verify Product <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">247+</div>
              <div className="text-gray-600 mt-2">Products Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1,543</div>
              <div className="text-gray-600 mt-2">Blockchain Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">86+</div>
              <div className="text-gray-600 mt-2">Verified Partners</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
