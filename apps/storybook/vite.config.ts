import stylex from "@stylexjs/unplugin"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    // StyleX compiles ahead of the React transform.
    stylex.vite({
      // An explicit, identical cascade in both apps:
      //
      //   base        @taiyomoe/ui's reset.css + document defaults
      //   structural  its structural.css, the cross-element rules StyleX
      //               cannot express
      //   stylex.*    every component's own styles
      //
      // Naming the first two in `before` is what makes that order a decision
      // rather than a side effect of import order. It also keeps the contract
      // structural.css is written against: it may freely ADD a declaration
      // StyleX does not set, and needs `!important` to override one.
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
  // Vite rejects requests whose Host header it does not recognise. Naming the
  // quick-tunnel domain lets `cloudflared tunnel --url http://localhost:6006`
  // serve this dev server for a design review without disabling the check.
  server: { allowedHosts: [".trycloudflare.com"] },
})
