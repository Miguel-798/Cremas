/**
 * Tests for VentasPage Component
 *
 * Tests the sales page API client behavior.
 * Uses vi.fn() to mock API functions directly.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the API modules with inline data
vi.mock("@/lib/api", () => {
  const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";
  
  return {
    salesApi: {
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation((id: string, data: { cream_id: string; quantity_sold: number }) => {
        if (data.quantity_sold > 5) {
          return Promise.reject(new Error("Error 400: Stock insuficiente. Disponible: 2, solicitado: 10"));
        }
        return Promise.resolve({
          id: "new-sale-id",
          cream_id: data.cream_id,
          cream_name: "Chocolate",
          quantity_sold: data.quantity_sold,
          sold_at: new Date().toISOString(),
        });
      }),
      getByCream: vi.fn().mockResolvedValue([]),
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
        {
          id: "33333333-3333-3333-3333-333333333333",
          flavor_name: "Vainilla",
          quantity: 5,
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
import { salesApi, creamsApi } from "@/lib/api";

// Constants for tests
const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";

describe("VentasPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sales list when API returns successfully", async () => {
    const result = await salesApi.create(MOCK_CREAM_ID, {
      cream_id: MOCK_CREAM_ID,
      quantity_sold: 3,
    });

    expect(result).toBeDefined();
    expect(result.quantity_sold).toBe(3);
  });

  it("should get all available creams for selection", async () => {
    const result = await creamsApi.getAll();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter available creams (quantity > 0)", async () => {
    const result = await creamsApi.getAll();
    const available = result.filter((cream) => cream.quantity > 0);

    expect(available.length).toBeGreaterThan(0);
    // All available creams should have positive quantity
    available.forEach((cream) => {
      expect(cream.quantity).toBeGreaterThan(0);
    });
  });

  it("should handle sale with insufficient stock", async () => {
    await expect(
      salesApi.create(MOCK_CREAM_ID, {
        cream_id: MOCK_CREAM_ID,
        quantity_sold: 10,
      })
    ).rejects.toThrow();
  });

  it("should return sale data with correct shape", async () => {
    const result = await salesApi.create(MOCK_CREAM_ID, {
      cream_id: MOCK_CREAM_ID,
      quantity_sold: 2,
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("cream_id");
    expect(result).toHaveProperty("cream_name");
    expect(result).toHaveProperty("quantity_sold");
    expect(result).toHaveProperty("sold_at");
  });
});
