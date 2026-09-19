import { paraglideVitePlugin } from "@inlang/paraglide-js"
import stylex from "@stylexjs/unplugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
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
      // StyleX resolves *.stylex.ts variable imports itself, so it needs the
      // same "@/*" alias the bundler and tsconfig use.
      unstable_moduleResolution: { type: "commonJS", rootDir: import.meta.dirname },
      aliases: { "@/*": [`${import.meta.dirname}/src/*`] },
      // @taiyomoe/ui is a workspace package resolved through node_modules and
      // ships StyleX source, so it must be compiled as app code.
      // externalPackages is implemented in @stylexjs/unplugin's core but is
      // missing from its UserOptions type in 0.19.0; cast until upstream adds it.
      externalPackages: ["@taiyomoe/ui"],
    } as Parameters<typeof stylex.vite>[0]),
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
