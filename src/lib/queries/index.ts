/**
 * React Query hooks — centralized, typed wrappers around API calls.
 *
 * Query keys:
 *   ["creams"]         — all creams list
 *   ["creams", id]     — single cream by ID
 *   ["sales"]          — all sales list
 *   ["alerts"]         — low-stock alerts
 *   ["reservations"]   — active reservations
 *
 * staleTime defaults:
 *   60 000 ms (60 s) for list/detail queries
 *   30 000 ms (30 s) for sales (higher churn)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  creamsApi,
  alertsApi,
  reservationsApi,
  salesApi,
  Cream,
  CreamWithStatus,
  CreamCreate,
  CreamAddStock,
  LowStockResponse,
  Reservation,
  ReservationCreate,
  Sale,
  SaleCreate,
} from "@/lib/api";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const queryKeys = {
  creams: {
    all: () => ["creams"] as const,
    detail: (id: string) => ["creams", id] as const,
  },
  sales: {
    all: () => ["sales"] as const,
    byCream: (id: string) => ["sales", id] as const,
  },
  alerts: {
    all: () => ["alerts"] as const,
  },
  reservations: {
    all: () => ["reservations"] as const,
  },
} as const;

// ─── Cream Queries ────────────────────────────────────────────────────────────

export function useCreams() {
  return useQuery({
    queryKey: queryKeys.creams.all(),
    queryFn: creamsApi.getAll,
    staleTime: 60 * 1000,
  });
}

export function useCream(id: string) {
  return useQuery({
    queryKey: queryKeys.creams.detail(id),
    queryFn: () => creamsApi.getById(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  });
}

// ─── Alert Queries ───────────────────────────────────────────────────────────

export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts.all(),
    queryFn: alertsApi.getLowStock,
    staleTime: 60 * 1000,
  });
}

// ─── Reservation Queries ─────────────────────────────────────────────────────

export function useReservations() {
  return useQuery({
    queryKey: queryKeys.reservations.all(),
    queryFn: reservationsApi.getActive,
    staleTime: 60 * 1000,
  });
}

// ─── Sales Queries ────────────────────────────────────────────────────────────

export function useSales() {
  return useQuery({
    queryKey: queryKeys.sales.all(),
    queryFn: salesApi.getAll,
    staleTime: 30 * 1000, // 30 s — higher churn than cream data
  });
}

export function useSalesByCream(id: string) {
  return useQuery({
    queryKey: queryKeys.sales.byCream(id),
    queryFn: () => salesApi.getByCream(id),
    staleTime: 30 * 1000,
    enabled: !!id,
  });
}

// ─── Cream Mutations ──────────────────────────────────────────────────────────

export function useCreateCream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreamCreate) => creamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.all() });
    },
  });
}

export function useAddStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      creamsApi.addStock(id, { amount }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.detail(id) });
    },
  });
}

export function useDeleteCream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.all() });
    },
  });
}

export function useSellCream() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SaleCreate }) =>
      salesApi.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all() });
    },
  });
}

// ─── Reservation Mutations ────────────────────────────────────────────────────

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReservationCreate }) =>
      reservationsApi.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.all() });
    },
  });
}

export function useDeliverReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.deliver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.creams.all() });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all() });
    },
  });
}
