/**
 * Node.js Setup for All Tests
 *
 * Starts MSW server for Node.js environment.
 * This file is auto-loaded by vitest.config.ts
 */
import { server } from "./mocks/server";

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

// Reset handlers after each test (in case tests modify them)
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
