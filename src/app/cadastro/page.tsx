import type { Metadata } from "next"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Cadastrar · LifePilot AI",
  description: "Crie sua conta para começar a planejar suas mudanças com IA.",
}

export default function CadastroPage() {
  return <AuthForm mode="signup" />
}
