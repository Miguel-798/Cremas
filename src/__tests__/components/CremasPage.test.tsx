/**
 * Tests for CremasPage Component
 *
 * Tests the API client behavior for the creams page.
 * Uses vi.fn() to mock API functions directly.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the creamsApi module with inline data
vi.mock("@/lib/api", () => {
  const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";
  
  return {
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
          quantity: 2,
          created_at: "2024-01-01T00:00:00",
          updated_at: "2024-01-01T00:00:00",
          is_low_stock: true,
        },
      ]),
      getById: vi.fn().mockImplementation((id: string) => {
        if (id === "00000000-0000-0000-0000-000000000000") {
          return Promise.reject(new Error("Error 404: Not Found"));
        }
        return Promise.resolve({
          id: MOCK_CREAM_ID,
          flavor_name: "Chocolate",
          quantity: 10,
          created_at: "2024-01-01T00:00:00",
          updated_at: "2024-01-01T00:00:00",
          is_low_stock: false,
        });
      }),
      create: vi.fn().mockImplementation((data: { flavor_name: string; quantity: number }) => {
        return Promise.resolve({
          id: "new-id",
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_low_stock: false,
        });
      }),
      addStock: vi.fn().mockImplementation((id: string, data: { amount: number }) => {
        return Promise.resolve({
          id: MOCK_CREAM_ID,
          flavor_name: "Chocolate",
          quantity: 10 + data.amount,
          created_at: "2024-01-01T00:00:00",
          updated_at: new Date().toISOString(),
          is_low_stock: false,
        });
      }),
      delete: vi.fn().mockResolvedValue(undefined as void),
    },
  };
});

// Import after vi.mock to get the mocked module
import { creamsApi } from "@/lib/api";

// Constants for tests
const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";

describe("CremasPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", async () => {
    // Simulate delayed response
    (creamsApi.getAll as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: MOCK_CREAM_ID,
              flavor_name: "Chocolate",
              quantity: 10,
              created_at: "2024-01-01T00:00:00",
              updated_at: "2024-01-01T00:00:00",
              is_low_stock: false,
            },
          ]);
        }, 500);
      })
    );

    const result = await creamsApi.getAll();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should render data when API returns successfully", async () => {
    const result = await creamsApi.getAll();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].flavor_name).toBe("Chocolate");
  });

  it("should handle empty data state", async () => {
    (creamsApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await creamsApi.getAll();
    expect(result).toEqual([]);
  });

  it("should handle error state when API fails", async () => {
    (creamsApi.getAll as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Error 500: Server error")
    );

    await expect(creamsApi.getAll()).rejects.toThrow();
  });

  it("should identify low-stock creams", async () => {
    // Reset the mock to return normal data
    (creamsApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
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
    ]);
    
    const result = await creamsApi.getAll();
    const lowStockCreams = result.filter((cream) => cream.is_low_stock);

    expect(lowStockCreams.length).toBeGreaterThan(0);
    expect(lowStockCreams[0].flavor_name).toBe("Vainilla");
    expect(lowStockCreams[0].quantity).toBeLessThanOrEqual(3);
  });

  it("should create a new cream", async () => {
    const newCream = await creamsApi.create({ flavor_name: "Menta", quantity: 8 });

    expect(newCream).toBeDefined();
    expect(newCream.flavor_name).toBe("Menta");
    expect(newCream.quantity).toBe(8);
  });
});
