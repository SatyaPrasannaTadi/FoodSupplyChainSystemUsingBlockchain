import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Register Product",
    description:
      "Producers register harvest details including origin, date, batch number, and quality certifications on the blockchain.",
    stakeholders: ["Farmers", "Producers"],
  },
  {
    step: "02",
    title: "Package & Transport",
    description:
      "Distributors record packaging information, storage conditions, transport routes, and delivery timestamps.",
    stakeholders: ["Distributors", "Logistics"],
  },
  {
    step: "03",
    title: "Verify & Stock",
    description:
      "Retailers receive shipments, verify blockchain records, inspect quality, and update inventory status.",
    stakeholders: ["Retailers", "Stores"],
  },
  {
    step: "04",
    title: "Consumer Access",
    description: "End consumers scan product QR codes to view complete supply chain history and verify authenticity.",
    stakeholders: ["Consumers", "End Users"],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="mb-2">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-balance">How FoodTrace Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A simple four-step process that ensures complete traceability without complex IoT integration.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {steps.map((item, index) => (
            <Card key={item.step} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="flex-shrink-0">
                  <div className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <CheckCircle2 className="size-5 text-primary flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.stakeholders.map((stakeholder) => (
                      <Badge key={stakeholder} variant="secondary">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute bottom-0 left-[2.5rem] w-0.5 h-6 bg-gradient-to-b from-primary to-transparent hidden md:block" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
