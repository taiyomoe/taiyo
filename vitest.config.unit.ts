import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    silent: "passed-only",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.spec.ts"],
          // Files share their worker's modules: a file that changes global state must restore it.
          isolate: false,
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: "web-dom",
          include: ["apps/web/src/**/__tests__/**/*.test.tsx"],
          environment: "happy-dom",
          // Hooks keep state at module level: each file gets fresh modules and a fresh DOM.
          isolate: true,
        },
      },
    ],
  },
})
