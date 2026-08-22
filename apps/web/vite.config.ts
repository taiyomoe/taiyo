import { paraglideVitePlugin } from "@inlang/paraglide-js"
import stylex from "@stylexjs/unplugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    // StyleX compiles ahead of the React transform. Tailwind still runs while
    // packages/ui is migrated -- the two coexist during the transition.
    stylex.vite({
      useCSSLayers: true,
      dev: process.env.NODE_ENV === "development",
      runtimeInjection: false,
      // StyleX resolves *.stylex.ts variable imports itself, so it needs the
      // same "@/*" alias the bundler and tsconfig use.
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
      aliases: { "@/*": [`${import.meta.dirname}/src/*`] },
    }),
    tailwindcss(),
    tanstackStart(),
    // React Compiler via plugin-react's native `compiler` option, backed by
    // oxc-transform-react (Rust). Replaces the Babel preset wiring.
    viteReact({ compiler: true }),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
    }),
  ],
})

export default config
