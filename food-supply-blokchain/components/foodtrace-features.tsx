import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Eye, Fingerprint, Lock, QrCode, TrendingUp } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Authenticity",
    description:
      "Every product is authenticated through blockchain verification, eliminating counterfeit goods and ensuring genuine quality.",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description:
      "Track complete product journey from farm to table. See origin, handling, storage conditions, and delivery timestamps.",
  },
  {
    icon: Fingerprint,
    title: "Immutable Records",
    description:
      "Blockchain technology ensures all data is tamper-proof and permanently recorded, maintaining data integrity.",
  },
  {
    icon: Lock,
    title: "Secure Data",
    description:
      "Enterprise-grade encryption protects sensitive supply chain information while maintaining transparency where needed.",
  },
  {
    icon: QrCode,
    title: "QR Code Scanning",
    description:
      "Consumers can instantly scan product QR codes to view complete traceability information and verify authenticity.",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description:
      "Real-time insights into your supply chain performance, bottlenecks, and quality metrics for continuous improvement.",
  },
]

export function FoodTraceFeatures() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Powerful Features for Complete Traceability</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Everything you need to build trust, ensure safety, and maintain transparency throughout your food supply
            chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
