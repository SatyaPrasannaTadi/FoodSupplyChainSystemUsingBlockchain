import { FoodTraceAuthLayout } from "@/components/auth/foodtrace-auth-layout"
import { FoodTraceSignUp } from "@/components/auth/foodtrace-sign-up"

export default function SignUpPage() {
  return (
    <FoodTraceAuthLayout>
      <FoodTraceSignUp />
    </FoodTraceAuthLayout>
  )
}
