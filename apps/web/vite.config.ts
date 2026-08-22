import { paraglideVitePlugin } from "@inlang/paraglide-js"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    // React Compiler. plugin-react has no `compiler` flag; it exposes
    // reactCompilerPreset, applied through @rolldown/plugin-babel.
    babel({ presets: [reactCompilerPreset()] }),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
    }),
  ],
})

export default config
