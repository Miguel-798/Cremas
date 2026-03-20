/**
 * Fetch wrapper that adds JSON headers.
 * Auth is disabled on backend for now.
 */
export async function authFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  }

  const response = await fetch(endpoint, { ...options, headers })

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
