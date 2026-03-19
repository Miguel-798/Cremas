const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log(`Fetching: ${API_URL}${endpoint}`);
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  console.log(`Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} - ${errorText}`);
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) {
    return [] as T;
  }
  
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

/**
 * Authenticated fetch wrapper — injects JWT token from Supabase session.
 * Falls back to unauthenticated fetch on 401 (redirects to /login).
 */
export async function authFetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Lazy import to avoid circular dependency issues
  const { authFetch } = await import("@/lib/authFetch")
  return authFetch<T>(`${API_URL}${endpoint}`, options)
}

// Types
export interface Cream {
  id: string;
  flavor_name: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreamWithStatus extends Cream {
  is_low_stock: boolean;
}

export interface CreamCreate {
  flavor_name: string;
  quantity: number;
}

export interface CreamAddStock {
  amount: number;
}

export interface Sale {
  id: string;
  cream_id: string;
  cream_name: string;
  quantity_sold: number;
  sold_at: string;
}

export interface SaleCreate {
  cream_id: string;
  quantity_sold: number;
}

export interface Reservation {
  id: string;
  cream_id: string;
  cream_name: string;
  quantity_reserved: number;
  reserved_for: string;
  customer_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ReservationCreate {
  cream_id: string;
  quantity_reserved: number;
  reserved_for: string;
  customer_name?: string;
}

export interface LowStockAlert {
  cream_id: string;
  flavor_name: string;
  current_quantity: number;
  threshold: number;
}

export interface LowStockResponse {
  alerts: LowStockAlert[];
  total: number;
}

// API Functions
export const creamsApi = {
  getAll: () => fetchApi<CreamWithStatus[]>("/creams"),
  getById: (id: string) => fetchApi<Cream>(`/creams/${id}`),
  create: (data: CreamCreate) =>
    fetchApi<Cream>("/creams", { method: "POST", body: JSON.stringify(data) }),
  addStock: (id: string, data: CreamAddStock) =>
    fetchApi<Cream>(`/creams/${id}/add-stock`, { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<void>(`/creams/${id}`, { method: "DELETE" }),
};

export const salesApi = {
  getAll: () => fetchApi<Sale[]>("/creamssales"),
  create: (id: string, data: SaleCreate) =>
    fetchApi<Sale>(`/creams/${id}/sell`, { method: "POST", body: JSON.stringify(data) }),
  getByCream: (id: string) => fetchApi<Sale[]>(`/creams/${id}/sales`),
};

export const reservationsApi = {
  create: (id: string, data: ReservationCreate) =>
    fetchApi<Reservation>(`/creams/${id}/reserve`, { method: "POST", body: JSON.stringify(data) }),
  getActive: () => fetchApi<Reservation[]>("/creams/reservations/active"),
  deliver: (id: string) =>
    fetchApi<{ message: string }>(`/creams/reservations/${id}/deliver`, { method: "POST" }),
  cancel: (id: string) =>
    fetchApi<{ message: string }>(`/creams/reservations/${id}/cancel`, { method: "POST" }),
};

export const alertsApi = {
  getLowStock: () => fetchApi<LowStockResponse>("/creams/low-stock"),
};
