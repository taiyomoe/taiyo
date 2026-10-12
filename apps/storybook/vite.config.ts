import stylex from "@stylexjs/unplugin"
import react from "@vitejs/plugin-react"
import { defineConfig, type PluginOption } from "vite"

type StylexOptions = NonNullable<Parameters<typeof stylex.vite>[0]> & {
  externalPackages?: string[]
}

const stylexOptions: StylexOptions = {
  useCSSLayers: { before: ["base", "structural"] },
  dev: process.env.NODE_ENV === "development",
  runtimeInjection: false,
  unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
  // @taiyomoe/ui is a workspace package resolved through node_modules and
  // ships StyleX source, so it must be compiled as app code.
  // externalPackages is implemented in @stylexjs/unplugin's core but is
  // missing from its UserOptions type in 0.19.0.
  externalPackages: ["@taiyomoe/ui"],
}
// oxlint-disable-next-line typescript/no-unsafe-assignment
const stylexPlugin: PluginOption = stylex.vite(stylexOptions)

export default defineConfig({
  plugins: [stylexPlugin, react()],
  resolve: { tsconfigPaths: true },
  server: { allowedHosts: [".trycloudflare.com"] },
})
