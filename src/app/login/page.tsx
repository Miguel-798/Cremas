"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react"
import { signIn } from "@/lib/auth-actions"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, refreshAuth } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  function validate() {
    const newErrors: { email?: string; password?: string } = {}
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de correo inválido"
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    return newErrors
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    
    const result = await signIn(formData)
    
    setIsSubmitting(false)

    if (result.error) {
      setSubmitError(result.error)
      return
    }

    // Refresh auth state and redirect
    await refreshAuth()
    router.push("/")
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-soft-lg border border-border/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-peach-400 to-peach-600 mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-muted-foreground">
              Accede a tu cuenta de Cremas
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors ${
                    errors.email
                      ? "border-destructive"
                      : "border-input hover:border-ring/50"
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors ${
                    errors.password
                      ? "border-destructive"
                      : "border-input hover:border-ring/50"
                  }`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-sm text-destructive flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-peach-500 to-peach-600 hover:from-peach-600 hover:to-peach-700 text-white font-semibold shadow-lg shadow-peach-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
