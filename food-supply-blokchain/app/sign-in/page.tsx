import { FoodTraceAuthLayout } from "@/components/auth/foodtrace-auth-layout"
import { FoodTraceSignIn } from "@/components/auth/foodtrace-sign-in"

export default function SignInPage() {
  return (
    <FoodTraceAuthLayout>
      <FoodTraceSignIn />
    </FoodTraceAuthLayout>
  )
}
