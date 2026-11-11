"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  api,
  ApiError,
  clearStoredTokens,
  getStoredAccessToken,
  setStoredTokens,
} from "@/lib/api/client"
import type {
  AuthResponseDto,
  LoginDto,
  SignUpDto,
  UserResponseDto,
} from "@/lib/api/types"

interface AuthContextValue {
  user: UserResponseDto | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (dto: LoginDto) => Promise<AuthResponseDto>
  signUp: (dto: SignUpDto) => Promise<AuthResponseDto>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user, setUser] = React.useState<UserResponseDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Validação da sessão armazenada na inicialização do cliente
  React.useEffect(() => {
    let isMounted = true

    async function checkAuthSession() {
      const token = getStoredAccessToken()
      if (!token) {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const userData = await api.auth.me()
        if (isMounted) {
          setUser(userData)
        }
      } catch (err) {
        console.warn("Sessão expirada ou inválida:", err)
        clearStoredTokens()
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void checkAuthSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = React.useCallback(
    async (dto: LoginDto): Promise<AuthResponseDto> => {
      setIsLoading(true)
      try {
        const authData = await api.auth.login(dto)
        setStoredTokens(authData.accessToken, authData.refreshToken)
        setUser(authData.user)
        toast.success(`Bem-vindo de volta, ${authData.user.email}!`)
        return authData
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          throw new Error("E-mail ou senha incorretos.")
        }
        if (err instanceof Error) {
          throw err
        }
        throw new Error("Falha ao autenticar. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const signUp = React.useCallback(
    async (dto: SignUpDto): Promise<AuthResponseDto> => {
      setIsLoading(true)
      try {
        const authData = await api.auth.signUp(dto)
        if (authData.accessToken) {
          setStoredTokens(authData.accessToken, authData.refreshToken)
          setUser(authData.user)
          toast.success("Conta criada com sucesso!")
        } else {
          toast.success("Conta criada! Verifique seu e-mail para confirmar seu cadastro.")
        }
        return authData
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          throw new Error("Este e-mail já está cadastrado no sistema.")
        }
        if (err instanceof Error) {
          throw err
        }
        throw new Error("Não foi possível criar a conta. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = React.useCallback(async () => {
    setIsLoading(true)
    try {
      await api.auth.logout().catch(() => {})
    } finally {
      clearStoredTokens()
      setUser(null)
      setIsLoading(false)
      toast.info("Você saiu da sua conta.")
      router.push("/login")
    }
  }, [router])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      signUp,
      logout,
    }),
    [user, isLoading, login, signUp, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthRouteGuard() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  React.useEffect(() => {
    if (isLoading) return

    const isAuthRoute = pathname === "/login" || pathname === "/cadastro"
    const isPublicRoute = isAuthRoute || pathname?.startsWith("/design-system")

    if (!user && !isPublicRoute) {
      router.push("/login")
    } else if (user && isAuthRoute) {
      router.push("/")
    }
  }, [user, isLoading, pathname, router])

  return null
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
