import type React from "react"
import { ShieldCheck } from "lucide-react"

interface FoodTraceAuthLayoutProps {
  children: React.ReactNode
}

export function FoodTraceAuthLayout({ children }: FoodTraceAuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full">{children}</div>
      </div>

      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/blockchain-network.png')] opacity-10 bg-cover bg-center" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-primary-foreground mb-8">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary-foreground/10 backdrop-blur">
              <ShieldCheck className="size-6" />
            </div>
            <span className="text-2xl font-bold">Food Supply Chain</span>
          </div>

          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold text-primary-foreground text-balance">
              Blockchain-Powered Food Traceability
            </h1>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              producers, distributors, and retailers ensuring food safety and transparency through
              blockchain technology.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* <div className="grid grid-cols-3 gap-4 text-primary-foreground/90">
            <div>
              <div className="text-3xl font-bold text-primary-foreground">10K+</div>
              <div className="text-sm">Products Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm">Verified Producers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-foreground">99.9%</div>
              <div className="text-sm">Uptime</div>
            </div>
          </div> */}

          {/* <div className="border-t border-primary-foreground/20 pt-6">
            <blockquote className="text-primary-foreground/90 italic">
              "FoodTrace has completely transformed how we manage our supply chain. Complete transparency at every
              stage."
            </blockquote>
            <p className="text-sm text-primary-foreground/70 mt-2">— Sarah Johnson, Organic Valley Farms</p>
          </div> */}
        </div>

        <div className="absolute -bottom-24 -right-24 size-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 size-96 bg-secondary-foreground/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
