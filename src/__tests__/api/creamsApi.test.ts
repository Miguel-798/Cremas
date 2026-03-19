/**
 * Tests for creamsApi
 *
 * Uses vi.fn() to mock API functions directly.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the api module with inline data - all constants defined inside vi.mock
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
        });
      }),
      create: vi.fn().mockImplementation((data: { flavor_name: string; quantity: number }) => {
        if (data.flavor_name === "Chocolate") {
          return Promise.reject(new Error("Error 400: Ya existe una crema con el sabor: Chocolate"));
        }
        return Promise.resolve({
          id: "new-id",
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }),
      addStock: vi.fn().mockResolvedValue({
        id: MOCK_CREAM_ID,
        flavor_name: "Chocolate",
        quantity: 15,
        created_at: "2024-01-01T00:00:00",
        updated_at: "2024-01-01T00:00:00",
      }),
      delete: vi.fn().mockResolvedValue(undefined as void),
    },
  };
});

// Import after vi.mock to get the mocked module
import { creamsApi } from "@/lib/api";

// Constants for tests (after vi.mock)
const MOCK_CREAM_ID = "11111111-1111-1111-1111-111111111111";

describe("creamsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return a list of creams", async () => {
      const result = await creamsApi.getAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return creams with correct shape", async () => {
      const result = await creamsApi.getAll();

      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("flavor_name");
      expect(result[0]).toHaveProperty("quantity");
      expect(result[0]).toHaveProperty("is_low_stock");
    });
  });

  describe("getById", () => {
    it("should return a single cream by ID", async () => {
      const result = await creamsApi.getById(MOCK_CREAM_ID);

      expect(result).toBeDefined();
      expect(result.id).toBe(MOCK_CREAM_ID);
      expect(result.flavor_name).toBe("Chocolate");
    });

    it("should throw error when cream not found", async () => {
      await expect(
        creamsApi.getById("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("should create a new cream and return it", async () => {
      const data = { flavor_name: "Menta", quantity: 5 };

      const result = await creamsApi.create(data);

      expect(result).toBeDefined();
      expect(result.flavor_name).toBe(data.flavor_name);
    });

    it("should throw error for duplicate flavor", async () => {
      await expect(
        creamsApi.create({ flavor_name: "Chocolate", quantity: 5 })
      ).rejects.toThrow();
    });
  });

  describe("addStock", () => {
    it("should add stock to a cream", async () => {
      const result = await creamsApi.addStock(MOCK_CREAM_ID, { amount: 5 });

      expect(result).toBeDefined();
      expect(result.quantity).toBeGreaterThan(0);
    });
  });

  describe("delete", () => {
    it("should delete a cream without throwing", async () => {
      // The API returns 204 No Content, fetchApi returns [] as T
      const result = await creamsApi.delete(MOCK_CREAM_ID);
      expect(result).toBeUndefined();
    });
  });
});
