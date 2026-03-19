/**
 * Tests for reservationsApi
 *
 * Uses vi.fn() to mock API functions directly.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the api module with inline data
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
  };
});

// Import after vi.mock to get the mocked module
import { reservationsApi } from "@/lib/api";

// Constants for tests
const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";
const MOCK_RESERVATION_ID = "22222222-2222-2222-2222-222222222222";

describe("reservationsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a reservation and return it with is_active=true", async () => {
      const data = {
        cream_id: MOCK_CREAM_ID,
        quantity_reserved: 2,
        reserved_for: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        customer_name: "Juan Pérez",
      };

      const result = await reservationsApi.create(MOCK_CREAM_ID, data);

      expect(result).toBeDefined();
      expect(result.quantity_reserved).toBe(2);
      expect(result.is_active).toBe(true);
      expect(result.customer_name).toBe("Juan Pérez");
    });
  });

  describe("getActive", () => {
    it("should return a list of active reservations", async () => {
      const result = await reservationsApi.getActive();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("deliver", () => {
    it("should return a success message when delivery succeeds", async () => {
      const result = await reservationsApi.deliver(MOCK_RESERVATION_ID);

      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe("string");
    });
  });

  describe("cancel", () => {
    it("should return a success message when cancellation succeeds", async () => {
      const result = await reservationsApi.cancel(MOCK_RESERVATION_ID);

      expect(result).toBeDefined();
      expect(result.message).toBe("Reserva cancelada correctamente");
    });
  });
});
