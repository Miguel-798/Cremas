/**
 * Fetch wrapper that sends the Supabase JWT token.
 * Directly parses the Supabase auth cookie to get the access token.
 */
function getAccessToken(): string | undefined {
  if (typeof document === 'undefined') {
    console.log('authFetch: Not in browser')
    return undefined
  }
  
  console.log('authFetch: document.cookie =', document.cookie.substring(0, 100) + '...')
  
  const cookies = document.cookie.split(';')
  
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    
    const name = trimmed.substring(0, eqIndex)
    const value = trimmed.substring(eqIndex + 1)
    
    // Look for Supabase auth token cookie (format: sb-{id}-auth-token)
    if (name.includes('auth-token')) {
      console.log('authFetch: Found auth-token cookie!')
      try {
        // Supabase v2 prefixes the value with "base64-"
        let base64Value = value
        if (value.startsWith('base64-')) {
          base64Value = value.substring(7) // Remove "base64-" prefix
        }
        
        // Decode base64 and parse JSON
        const decoded = atob(base64Value)
        const data = JSON.parse(decoded)
        
        if (data.access_token) {
          console.log('authFetch: ✓ Found access_token!')
          return data.access_token
        }
      } catch (e) {
        console.log('authFetch: Failed to parse cookie:', e)
      }
    }
  }
  
  console.log('authFetch: No auth-token cookie found')
  return undefined
}

export async function authFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let token: string | undefined

  if (typeof window !== 'undefined') {
    token = getAccessToken()
    
    if (token) {
      console.log(`authFetch: ✓ Token found, sending with request`)
    } else {
      console.log(`authFetch: ✗ No token found`)
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  }

  const response = await fetch(endpoint, { ...options, headers })
  console.log(`authFetch: Response status: ${response.status}`)

  if (response.status === 401) {
    const errorText = await response.text()
    throw new Error(`Unauthorized: ${errorText}`)
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
