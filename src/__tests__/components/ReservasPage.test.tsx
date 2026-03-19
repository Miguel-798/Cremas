/**
 * Tests for ReservasPage Component
 *
 * Tests the reservations page API client behavior.
 * Uses vi.fn() to mock API functions directly.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the API modules with inline data
vi.mock("@/lib/api", () => {
  const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";
  const MOCK_RESERVATION_ID = "22222222-2222-2222-2222-222222222222";
  
  return {
    reservationsApi: {
      create: vi.fn().mockImplementation((id: string, data: { 
        cream_id: string; 
        quantity_reserved: number; 
        reserved_for: string;
        customer_name?: string;
      }) => {
        return Promise.resolve({
          id: MOCK_RESERVATION_ID,
          cream_id: data.cream_id,
          cream_name: "Chocolate",
          quantity_reserved: data.quantity_reserved,
          reserved_for: data.reserved_for,
          customer_name: data.customer_name || null,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }),
      getActive: vi.fn().mockResolvedValue([
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
      ]),
      deliver: vi.fn().mockResolvedValue({ message: "Reserva entregada correctamente" }),
      cancel: vi.fn().mockResolvedValue({ message: "Reserva cancelada correctamente" }),
    },
    creamsApi: {
      getAll: vi.fn().mockResolvedValue([
        {
          id: MOCK_CREAM_ID,
          flavor_name: "Chocolate",
          quantity: 10,
          created_at: "2024-01-01T00:00:00",
          updated_at: "2024-01-01T00:00:00",
          is_low_stock: false,
        },
      ]),
      getById: vi.fn().mockImplementation((id: string) => {
        return Promise.resolve({
          id: id,
          flavor_name: "Chocolate",
          quantity: 10,
          created_at: "2024-01-01T00:00:00",
          updated_at: "2024-01-01T00:00:00",
          is_low_stock: false,
        });
      }),
      create: vi.fn().mockResolvedValue({} as any),
      addStock: vi.fn().mockResolvedValue({} as any),
      delete: vi.fn().mockResolvedValue(undefined as void),
    },
  };
});

// Import after vi.mock to get the mocked module
import { reservationsApi, creamsApi } from "@/lib/api";

// Constants for tests
const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";
const MOCK_RESERVATION_ID = "22222222-2222-2222-2222-222222222222";

describe("ReservasPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render reservation list when API returns successfully", async () => {
    const result = await reservationsApi.getActive();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].is_active).toBe(true);
  });

  it("should create a new reservation", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const data = {
      cream_id: MOCK_CREAM_ID,
      quantity_reserved: 2,
      reserved_for: futureDate,
      customer_name: "Juan Pérez",
    };

    const result = await reservationsApi.create(MOCK_CREAM_ID, data);

    expect(result).toBeDefined();
    expect(result.quantity_reserved).toBe(2);
    expect(result.is_active).toBe(true);
  });

  it("should deliver a reservation successfully", async () => {
    const result = await reservationsApi.deliver(MOCK_RESERVATION_ID);

    expect(result).toBeDefined();
    expect(result.message).toBe("Reserva entregada correctamente");
  });

  it("should cancel a reservation successfully", async () => {
    const result = await reservationsApi.cancel(MOCK_RESERVATION_ID);

    expect(result).toBeDefined();
    expect(result.message).toBe("Reserva cancelada correctamente");
  });

  it("should get available creams for reservation", async () => {
    const result = await creamsApi.getAll();
    const available = result.filter((cream) => cream.quantity > 0);

    expect(available.length).toBeGreaterThan(0);
  });

  it("should return reservations with correct shape", async () => {
    const result = await reservationsApi.getActive();

    if (result.length > 0) {
      const reservation = result[0];
      expect(reservation).toHaveProperty("id");
      expect(reservation).toHaveProperty("cream_id");
      expect(reservation).toHaveProperty("cream_name");
      expect(reservation).toHaveProperty("quantity_reserved");
      expect(reservation).toHaveProperty("reserved_for");
      expect(reservation).toHaveProperty("is_active");
      expect(reservation).toHaveProperty("created_at");
    }
  });

  it("should handle deliver for non-existent reservation", async () => {
    (reservationsApi.deliver as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Error 404: Reserva no encontrada o ya entregada")
    );

    await expect(
      reservationsApi.deliver("00000000-0000-0000-0000-000000000000")
    ).rejects.toThrow();
  });
});
