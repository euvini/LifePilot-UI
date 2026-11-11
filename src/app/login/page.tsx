import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Entrar · LifePilot AI",
  description: "Acesse sua conta para visualizar e planejar suas mudanças com IA.",
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
