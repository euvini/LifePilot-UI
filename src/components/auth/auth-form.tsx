"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff, Lock, Mail, RefreshCw } from "lucide-react"

import { BrandLogoIcon } from "@/components/icons/duotone"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

interface AuthFormProps {
  mode: "login" | "signup"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { login, signUp } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const isLogin = mode === "login"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (!isLogin && password.length < 6) {
      setErrorMessage("A senha deve conter no mínimo 6 caracteres.")
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("As senhas informadas não coincidem.")
      return
    }

    setIsSubmitting(true)
    try {
      if (isLogin) {
        await login({ email: email.trim(), password })
      } else {
        await signUp({ email: email.trim(), password })
      }
      router.push("/")
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro inesperado. Tente novamente."
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-canvas p-4 tablet:p-6">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-2xl border border-border bg-surface p-6 shadow-sm tablet:p-8">
        {/* Cabeçalho de Marca (Paper Botanical Calm) */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border-[1.8px] border-primary bg-primary-soft">
              <BrandLogoIcon />
            </div>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              {isLogin ? "Entrar na sua conta" : "Criar sua conta"}
            </h1>
            <p className="font-sans text-xs text-ink-muted">
              {isLogin
                ? "Acesse seus planos de mudança e copiloto de IA."
                : "Comece seu planejamento residencial assistido por IA."}
            </p>
          </div>
        </div>

        {/* Alerta de Erro */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível continuar</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo de E-mail */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-email"
              className="font-sans text-xs font-bold tracking-wider text-ink-secondary uppercase"
            >
              E-mail
            </label>
            <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-canvas">
              <Mail className="size-4 shrink-0 text-ink-muted" />
              <input
                id="auth-email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="auth-password"
                className="font-sans text-xs font-bold tracking-wider text-ink-secondary uppercase"
              >
                Senha
              </label>
              {!isLogin && (
                <span className="font-mono text-[10px] text-ink-muted">
                  mín. 6 caracteres
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-canvas">
              <Lock className="size-4 shrink-0 text-ink-muted" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-ink-muted transition-colors hover:text-ink"
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Campo de Confirmação de Senha (apenas Cadastro) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-confirm-password"
                className="font-sans text-xs font-bold tracking-wider text-ink-secondary uppercase"
              >
                Confirmar Senha
              </label>
              <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-3.5 py-2.5 focus-within:border-primary focus-within:bg-canvas">
                <Lock className="size-4 shrink-0 text-ink-muted" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full bg-transparent font-sans text-sm text-ink outline-none placeholder:text-ink-muted"
                />
              </div>
            </div>
          )}

          {/* Botão de Envio */}
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full gap-2 text-sm font-bold shadow-xs"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="size-4 animate-spin text-icon-mint" />
                <span>{isLogin ? "Entrando..." : "Criando conta..."}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Entrar na Conta" : "Criar Conta Gratuita"}</span>
                <ArrowRight className="size-4 text-icon-mint" />
              </>
            )}
          </Button>
        </form>

        {/* Rodapé: Alternador entre Login e Cadastro */}
        <div className="flex flex-col items-center gap-2 border-t border-border pt-4 text-center">
          {isLogin ? (
            <p className="font-sans text-xs text-ink-secondary">
              Não tem uma conta ainda?{" "}
              <Link
                href="/cadastro"
                className="font-bold text-primary underline underline-offset-4 hover:text-primary-strong"
              >
                Cadastre-se gratuitamente →
              </Link>
            </p>
          ) : (
            <p className="font-sans text-xs text-ink-secondary">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="font-bold text-primary underline underline-offset-4 hover:text-primary-strong"
              >
                Fazer login →
              </Link>
            </p>
          )}

          <Link
            href="/design-system"
            className="font-mono text-[10px] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Design System v1.0
          </Link>
        </div>
      </div>
    </div>
  )
}
