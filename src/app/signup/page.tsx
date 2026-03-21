"use client"

import { useState, useEffect, type FormEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { UserPlus, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

export default function SignupPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = "/"
    }
  }, [user, authLoading])

  function validate() {
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Formato de correo inválido"
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Por favor confirma tu contraseña"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
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
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    setIsSubmitting(false)

    if (error) {
      setSubmitError(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-soft-lg border border-border/50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-matcha-100  mb-4">
              <CheckCircle className="w-8 h-8 text-matcha-600 " />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              ¡Registro exitoso!
            </h1>
            <p className="text-muted-foreground mb-6">
              Hemos enviado un correo de confirmación a{" "}
              <span className="font-medium text-foreground">{email}</span>.
              <br />
              Por favor revisa tu bandeja de entrada para verificar tu cuenta.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-peach-500 to-peach-600 hover:from-peach-600 hover:to-peach-700 text-white font-semibold shadow-lg shadow-peach-500/25 transition-all"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </main>
    )
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-matcha-400 to-matcha-600 mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Crear Cuenta
            </h1>
            <p className="mt-2 text-muted-foreground">
              Regístrate para gestionar tu inventario
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
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
                    errors.email ? "border-destructive" : "border-input hover:border-ring/50"
                  }`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors ${
                    errors.password ? "border-destructive" : "border-input hover:border-ring/50"
                  }`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors ${
                    errors.confirmPassword ? "border-destructive" : "border-input hover:border-ring/50"
                  }`}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                />
              </div>
              {errors.confirmPassword && (
                <p id="confirm-error" className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-matcha-500 to-matcha-600 hover:from-matcha-600 hover:to-matcha-700 text-white font-semibold shadow-lg shadow-matcha-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
