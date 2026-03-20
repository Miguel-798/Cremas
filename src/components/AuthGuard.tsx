"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

interface AuthGuardProps {
  children: ReactNode
  publicRoutes?: string[]
}

export function AuthGuard({ children, publicRoutes = ["/login", "/signup"] }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // If not logged in and not on a public route, redirect to login
    if (!user && typeof window !== "undefined") {
      const isPublicRoute = publicRoutes.some(route => 
        window.location.pathname.startsWith(route)
      )
      if (!isPublicRoute) {
        router.push("/login")
      }
    }
  }, [user, isLoading, router, publicRoutes])

  // Show nothing while loading or if not authorized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-600 rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
