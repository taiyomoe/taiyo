import { paraglideVitePlugin } from "@inlang/paraglide-js"
import stylex from "@stylexjs/unplugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")
  const apiOrigin = `http://localhost:${env.API_PORT ?? 3002}`

  return {
    resolve: { tsconfigPaths: true },
    server: {
      port: Number(env.PORT ?? 3000),
      strictPort: true,
      allowedHosts: [".trycloudflare.com"],
      proxy: {
        "/_api": { target: apiOrigin, rewrite: (path) => path.replace(/^\/_api/, "") },
        "/api/auth": { target: apiOrigin },
      },
    },
    plugins: [
      devtools(),
      stylex.vite({
        useCSSLayers: { before: ["base", "structural"] },
        dev: process.env.NODE_ENV === "development",
        runtimeInjection: false,
        unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
        aliases: { "@/*": [`${import.meta.dirname}/src/*`] },
        externalPackages: ["@taiyomoe/ui"],
      } as Parameters<typeof stylex.vite>[0]),
      tanstackStart(),
      viteReact({ compiler: true }),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
      }),
    ],
  }
})

export default config
