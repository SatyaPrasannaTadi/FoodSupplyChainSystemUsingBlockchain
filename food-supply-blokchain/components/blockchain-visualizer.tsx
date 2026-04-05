"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sprout, Truck, Store, User, ChevronRight } from "lucide-react"

const stages = [
  {
    icon: Sprout,
    title: "Producer",
    description: "Farmers register harvest data",
    color: "text-primary bg-primary/10 border-primary/20",
  },
  {
    icon: Truck,
    title: "Distributor",
    description: "Package & transport records",
    color: "text-secondary bg-secondary/10 border-secondary/20",
  },
  {
    icon: Store,
    title: "Retailer",
    description: "Store receives & verifies",
    color: "text-accent bg-accent/10 border-accent/20",
  },
  {
    icon: User,
    title: "Consumer",
    description: "Scan QR to verify origin",
    color: "text-chart-4 bg-chart-4/10 border-chart-4/20",
  },
]

export function BlockchainVisualizer() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="mb-2">
            Supply Chain Flow
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Complete Transparency at Every Stage</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Each transaction is recorded as an immutable block on the blockchain, creating a tamper-proof record of your
            product's journey.
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon
              return (
                <div key={stage.title} className="relative">
                  <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="space-y-4">
                      <div
                        className={`mx-auto w-16 h-16 rounded-xl flex items-center justify-center border-2 ${stage.color}`}
                      >
                        <Icon className="size-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{stage.title}</h3>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Block {index + 1}
                      </Badge>
                    </div>
                  </Card>
                  {index < stages.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <div className="bg-background border rounded-full p-1">
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-12 p-6 rounded-lg bg-card border">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium">Live Blockchain Status</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Blocks</div>
                <div className="text-2xl font-bold">847,392</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg. Block Time</div>
                <div className="text-2xl font-bold">2.3s</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Network Hash Rate</div>
                <div className="text-2xl font-bold">99.9%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
