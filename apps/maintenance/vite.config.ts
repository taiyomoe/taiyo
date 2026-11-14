import { paraglideVitePlugin } from "@inlang/paraglide-js"
import stylex from "@stylexjs/unplugin"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type PluginOption } from "vite"
import { createClientEnv } from "./src/env/schema"

type StylexOptions = NonNullable<Parameters<typeof stylex.vite>[0]> & {
  externalPackages?: string[]
}

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")
  const stylexOptions: StylexOptions = {
    useCSSLayers: { before: ["base", "structural"] },
    dev: process.env.NODE_ENV === "development",
    runtimeInjection: false,
    unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
    aliases: { "@/*": [`${import.meta.dirname}/src/*`] },
    // @taiyomoe/ui is a workspace package resolved through node_modules and
    // ships StyleX source, so it must be compiled as app code.
    // externalPackages is implemented in @stylexjs/unplugin's core but is
    // missing from its UserOptions type in 0.19.0.
    externalPackages: ["@taiyomoe/ui"],
  }
  // oxlint-disable-next-line typescript/no-unsafe-assignment
  const stylexPlugin: PluginOption = stylex.vite(stylexOptions)

  createClientEnv(env)

  return {
    resolve: { tsconfigPaths: true },
    server: {
      port: Number(env.PORT ?? 3004),
      strictPort: true,
      allowedHosts: [".trycloudflare.com"],
    },
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: false }),
      stylexPlugin,
      viteReact({ compiler: true }),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["cookie", "preferredLanguage", "baseLocale"],
      }),
    ],
  }
})

export default config
