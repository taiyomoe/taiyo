import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: [
    "eslint",
    "typescript",
    "unicorn",
    "react",
    "react-perf",
    "oxc",
    "import",
    "node",
    "promise",
    "vitest",
  ],
  jsPlugins: ["@stylistic/eslint-plugin", "@stylexjs/eslint-plugin"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
  // React Compiler rules ship in oxlint's `correctness` category (aligned with
  // the upstream ESLint presets), so enabling the category turns them on:
  // react/purity, react/refs, react/immutability, react/preserve-manual-memoization,
  // react/set-state-in-render, react/set-state-in-effect, react/static-components,
  // react/use-memo, react/void-use-memo, react/error-boundaries, react/globals.
  // These replaced the single react/react-compiler nursery rule in oxlint 1.79.
  categories: {
    correctness: "error",
  },
  ignorePatterns: [".claude/**", "apps/web/src/routeTree.gen.ts"],
  overrides: [
    {
      files: ["./packages/scripts/src/**/*.ts"],
      rules: {
        "no-console": "off",
      },
    },
  ],
  rules: {
    "no-console": "warn",
    curly: ["error", "all"],

    // Stylistic rules
    "@stylistic/padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: "*",
        next: [
          "break",
          "case",
          "cjs-export",
          "class",
          "continue",
          "do",
          "export",
          "for",
          "if",
          "return",
          "switch",
          "try",
          "while",
        ],
      },
      {
        blankLine: "always",
        prev: [
          "cjs-export",
          "class",
          "const",
          "do",
          "export",
          "for",
          "if",
          "let",
          "switch",
          "try",
          "while",
        ],
        next: "*",
      },
      {
        blankLine: "never",
        prev: ["const", "let"],
        next: ["const", "let"],
      },
    ],
    "@stylistic/wrap-iife": ["error", "inside"],

    // StyleX rules — the plugin's full rule set, all at error, all on their
    // documented defaults.
    "@stylexjs/enforce-extension": "error",
    "@stylexjs/valid-styles": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/no-nonstandard-styles": "error",
    "@stylexjs/no-legacy-contextual-styles": "error",
    "@stylexjs/no-lookahead-selectors": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-unused": "error",
    "@stylexjs/sort-keys": "error",

    // Vitest rules
    // Buggy: misfires on tests that import `test` from a custom setup helper.
    "vitest/no-standalone-expect": "off",
  },
})
