import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Frontend test runner config. Mirrors the `@` and `declarations` aliases from
 * vite.config.js so tests import production modules exactly as the app does.
 * The DOM environment is supplied by the `test` script's `--environment jsdom`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // The sandbox reports a constrained CPU count; pin a single fork so
    // tinypool never sees minThreads > maxThreads.
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
