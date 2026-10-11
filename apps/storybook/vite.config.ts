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
      externalPackages: ["@taiyomoe/ui"],
    } as Parameters<typeof stylex.vite>[0]),
    react(),
  ],
  resolve: { tsconfigPaths: true },
  server: { allowedHosts: [".trycloudflare.com"] },
})
