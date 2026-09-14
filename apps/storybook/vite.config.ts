import stylex from "@stylexjs/unplugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    // StyleX compiles ahead of the React transform. Tailwind still runs for
    // the stories themselves and any not-yet-migrated component.
    stylex.vite({
      // Unlayered on purpose: the dev CSS is injected in racy order with
      // Tailwind's sheets, and unlayered StyleX atoms always beat Tailwind's
      // layered preflight/utilities regardless of injection order.
      useCSSLayers: false,
      dev: process.env.NODE_ENV === "development",
      runtimeInjection: false,
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
      // @taiyomoe/ui is a workspace package resolved through node_modules and
      // ships StyleX source, so it must be compiled as app code.
      // externalPackages is implemented in @stylexjs/unplugin's core but is
      // missing from its UserOptions type in 0.19.0; cast until upstream adds it.
      externalPackages: ["@taiyomoe/ui"],
    } as Parameters<typeof stylex.vite>[0]),
    tailwindcss(),
    react(),
  ],
  resolve: { tsconfigPaths: true },
  // Vite rejects requests whose Host header it does not recognise. Naming the
  // quick-tunnel domain lets `cloudflared tunnel --url http://localhost:6006`
  // serve this dev server for a design review without disabling the check.
  server: { allowedHosts: [".trycloudflare.com"] },
})
