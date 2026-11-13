import { paraglideVitePlugin } from "@inlang/paraglide-js"
import stylex from "@stylexjs/unplugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type PluginOption } from "vite"
import { twemojiAssets } from "./twemoji-assets"

type StylexOptions = NonNullable<Parameters<typeof stylex.vite>[0]> & {
  externalPackages?: string[]
}

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")
  const apiOrigin = `http://localhost:${env.API_PORT ?? 3002}`
  const imagesOrigin = `http://localhost:${env.IMAGES_PORT ?? 54902}`
  const s3Origin = `http://localhost:${env.RUSTFS_PORT ?? 54900}`
  const stylexOptions: StylexOptions = {
    useCSSLayers: { before: ["base", "structural"] },
    dev: process.env.NODE_ENV === "development",
    runtimeInjection: false,
    // StyleX resolves *.stylex.ts variable imports itself, so it needs the
    // same "@/*" alias the bundler and tsconfig use.
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

  return {
    resolve: { tsconfigPaths: true },
    optimizeDeps: { entries: ["src/routes/**/*.tsx", "src/features/**/*.tsx"] },
    server: {
      port: Number(env.PORT ?? 3000),
      strictPort: true,
      allowedHosts: [".trycloudflare.com"],
      proxy: {
        "/_api": { target: apiOrigin, rewrite: (path) => path.replace(/^\/_api/, "") },
        "/api/auth": { target: apiOrigin },
        "/_images": { target: imagesOrigin, rewrite: (path) => path.replace(/^\/_images/, "") },
        [`^/${env.S3_BUCKET_NAME ?? "taiyo"}/`]: {
          target: s3Origin,
          bypass: (req) => (req.method === "PUT" ? undefined : req.url),
        },
      },
    },
    plugins: [
      devtools(),
      // StyleX compiles ahead of the React transform.
      stylexPlugin,
      tanstackStart(),
      viteReact({ compiler: true }),
      twemojiAssets(),
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["cookie", "preferredLanguage", "baseLocale"],
      }),
    ],
  }
})

export default config
