import stylex from "@stylexjs/unplugin"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: { before: ["base", "structural"] },
      dev: process.env.NODE_ENV === "development",
      runtimeInjection: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
      // @taiyomoe/ui is a workspace package resolved through node_modules and
      // ships StyleX source, so it must be compiled as app code.
      // externalPackages is implemented in @stylexjs/unplugin's core but is
      // missing from its UserOptions type in 0.19.0; cast until upstream adds it.
      externalPackages: ["@taiyomoe/ui"],
    } as Parameters<typeof stylex.vite>[0]),
    react(),
  ],
  resolve: { tsconfigPaths: true },
  server: { allowedHosts: [".trycloudflare.com"] },
})
