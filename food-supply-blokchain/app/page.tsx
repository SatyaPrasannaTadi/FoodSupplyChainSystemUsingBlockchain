import { FoodTraceHeader } from "@/components/foodtrace-header"
import { FoodTraceHero } from "@/components/foodtrace-hero"
import { BlockchainVisualizer } from "@/components/blockchain-visualizer"
import { FoodTraceFeatures } from "@/components/foodtrace-features"
import { HowItWorks } from "@/components/how-it-works"
import { FoodTraceFooter } from "@/components/foodtrace-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <FoodTraceHeader />
      <main className="flex-1">
        <FoodTraceHero />
        <BlockchainVisualizer />
        <FoodTraceFeatures />
        <HowItWorks />
      </main>
      {/* <FoodTraceFooter /> */}
    </div>
  )
}
