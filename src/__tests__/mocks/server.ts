/**
 * Node.js Setup for API Tests
 *
 * Configures MSW to intercept fetch calls in Node.js environment.
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Create MSW server for Node.js
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

// Reset handlers after each test (in case tests modify them)
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

export { server };
