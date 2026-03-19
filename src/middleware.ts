import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // List of paths that require authentication
  const protectedPaths = ["/cremas", "/ventas", "/reservas"]
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Create a Supabase client configured to use cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow the request through
    // (development mode without Supabase set up)
    return NextResponse.next()
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
        })
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    // Preserve intended destination for post-login redirect
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - login and signup pages
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|signup).*)",
  ],
}
