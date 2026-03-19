/**
 * MSW Browser Setup
 *
 * Configures MSW to intercept requests in the browser environment.
 * This file is used by component tests.
 */
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
