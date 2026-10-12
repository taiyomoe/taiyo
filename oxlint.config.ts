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

    "@stylexjs/enforce-extension": "error",
    "@stylexjs/valid-styles": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/no-nonstandard-styles": "error",
    "@stylexjs/no-legacy-contextual-styles": "error",
    "@stylexjs/no-lookahead-selectors": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-unused": "error",
    "@stylexjs/sort-keys": "error",

    // Buggy: misfires on tests that import `test` from a custom setup helper.
    "vitest/no-standalone-expect": "off",
  },
})
