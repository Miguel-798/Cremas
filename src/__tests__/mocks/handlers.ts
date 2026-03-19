/**
 * MSW Request Handlers
 *
 * Mock API responses for frontend tests.
 * Uses msw v2 REST API handlers.
 */
import { http, HttpResponse } from "msw";
import { UUID } from "crypto";

// Helper to generate a valid UUID-like string
const uuid = () => "00000000-0000-0000-0000-000000000000".replace(/0/g, () => Math.floor(Math.random() * 10).toString());

export const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";
export const MOCK_RESERVATION_ID = "22222222-2222-2222-2222-222222222222";

export const mockCreams = [
  {
    id: MOCK_CREAM_ID,
    flavor_name: "Chocolate",
    quantity: 10,
    created_at: "2024-01-01T00:00:00",
    updated_at: "2024-01-01T00:00:00",
    is_low_stock: false,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    flavor_name: "Vainilla",
    quantity: 2,
    created_at: "2024-01-01T00:00:00",
    updated_at: "2024-01-01T00:00:00",
    is_low_stock: true,
  },
];

export const mockSales = [
  {
    id: "44444444-4444-4444-4444-444444444444",
    cream_id: MOCK_CREAM_ID,
    cream_name: "Chocolate",
    quantity_sold: 3,
    sold_at: "2024-01-15T14:30:00",
  },
];

export const mockReservations = [
  {
    id: MOCK_RESERVATION_ID,
    cream_id: MOCK_CREAM_ID,
    cream_name: "Chocolate",
    quantity_reserved: 2,
    reserved_for: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    customer_name: "Juan Pérez",
    is_active: true,
    created_at: "2024-01-01T00:00:00",
  },
];

export const mockLowStockResponse = {
  alerts: [
    {
      cream_id: "33333333-3333-3333-3333-333333333333",
      flavor_name: "Vainilla",
      current_quantity: 2,
      threshold: 3,
    },
  ],
  total: 1,
};

export const handlers = [
  // GET /creams - return list of creams
  http.get("/creams", () => {
    return HttpResponse.json(mockCreams);
  }),

  // GET /creams/:id - return single cream
  http.get(`/creams/${MOCK_CREAM_ID}`, () => {
    return HttpResponse.json(mockCreams[0]);
  }),

  // GET /creams/:id (not found)
  http.get("/creams/00000000-0000-0000-0000-000000000000", () => {
    return HttpResponse.json({ detail: "Crema no encontrada" }, { status: 404 });
  }),

  // POST /creams - create cream
  http.post("/creams", async ({ request }) => {
    const body = await request.json() as { flavor_name: string; quantity: number };
    return HttpResponse.json(
      {
        id: uuid(),
        flavor_name: body.flavor_name,
        quantity: body.quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // POST /creams - reject duplicate
  http.post("/creams", async ({ request }) => {
    const body = await request.json() as { flavor_name: string };
    if (body.flavor_name === "Chocolate") {
      return HttpResponse.json(
        { detail: "Ya existe una crema con el sabor: Chocolate" },
        { status: 400 }
      );
    }
    return HttpResponse.json({ id: uuid(), flavor_name: body.flavor_name, quantity: 0 });
  }),

  // POST /creams/:id/sell - register sale
  http.post(`/creams/${MOCK_CREAM_ID}/sell`, async ({ request }) => {
    const body = await request.json() as { cream_id: string; quantity_sold: number };
    return HttpResponse.json({
      id: uuid(),
      cream_id: body.cream_id,
      cream_name: "Chocolate",
      quantity_sold: body.quantity_sold,
      sold_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  // POST /creams/:id/sell - insufficient stock
  http.post(`/creams/${MOCK_CREAM_ID}/sell`, async () => {
    return HttpResponse.json(
      { detail: "Stock insuficiente. Disponible: 2, solicitado: 10" },
      { status: 400 }
    );
  }),

  // POST /creams/:id/reserve - create reservation
  http.post(`/creams/${MOCK_CREAM_ID}/reserve`, async ({ request }) => {
    const body = await request.json() as {
      cream_id: string;
      quantity_reserved: number;
      reserved_for: string;
      customer_name?: string;
    };
    return HttpResponse.json({
      id: MOCK_RESERVATION_ID,
      cream_id: body.cream_id,
      cream_name: "Chocolate",
      quantity_reserved: body.quantity_reserved,
      reserved_for: body.reserved_for,
      customer_name: body.customer_name || null,
      is_active: true,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  // POST /creams/reservations/:id/deliver - deliver reservation
  http.post(`/creams/reservations/${MOCK_RESERVATION_ID}/deliver`, () => {
    return HttpResponse.json({ message: "Reserva entregada correctamente" });
  }),

  // GET /creams/reservations/active - get active reservations
  http.get("/creams/reservations/active", () => {
    return HttpResponse.json(mockReservations);
  }),

  // GET /creams/low-stock - get low stock alerts
  http.get("/creams/low-stock", () => {
    return HttpResponse.json(mockLowStockResponse);
  }),

  // POST /creams/:id/add-stock - add stock
  http.post(`/creams/${MOCK_CREAM_ID}/add-stock`, async ({ request }) => {
    const body = await request.json() as { amount: number };
    return HttpResponse.json({
      ...mockCreams[0],
      quantity: mockCreams[0].quantity + body.amount,
    });
  }),

  // DELETE /creams/:id - delete cream
  http.delete(`/creams/${MOCK_CREAM_ID}`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /creams/sales - get all sales
  http.get("/creamssales", () => {
    return HttpResponse.json(mockSales);
  }),

  // GET /creams/:id/sales - get sales by cream
  http.get(`/creams/${MOCK_CREAM_ID}/sales`, () => {
    return HttpResponse.json(mockSales);
  }),
];
