import { supabase } from "./supabase"

/**
 * Fetch wrapper that automatically injects the Supabase JWT token
 * from the current session into the Authorization header.
 *
 * On 401 responses, clears the session and redirects to /login.
 */
export async function authFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  }

  const response = await fetch(endpoint, { ...options, headers })

  if (response.status === 401) {
    await supabase.auth.signOut()
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error ${response.status}: ${errorText || response.statusText}`)
  }

  const text = await response.text()
  if (!text) return [] as unknown as T

  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}
