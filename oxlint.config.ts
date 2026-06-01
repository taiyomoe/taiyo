import { defineConfig } from "oxlint"

export default defineConfig({
  jsPlugins: ["@stylistic/eslint-plugin", "oxlint-tailwindcss"],
  options: {
    typeAware: true,
    typeCheck: true,
  },
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
  rules: {
    "no-console": "warn",

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
          "if",
          "switch",
          "try",
          "while",
          "return",
        ],
      },
      {
        blankLine: "always",
        prev: [
          "break",
          "case",
          "cjs-export",
          "class",
          "const",
          "continue",
          "do",
          "export",
          "if",
          "let",
          "return",
          "switch",
          "try",
          "while",
        ],
        next: "*",
      },
      {
        blankLine: "never",
        next: ["const", "let"],
        prev: ["const", "let"],
      },
    ],
    "@stylistic/wrap-iife": ["error", "inside"],

    // Tailwind CSS rules
    "tailwindcss/no-conflicting-classes": "error",
    "tailwindcss/no-deprecated-classes": "error",
    "tailwindcss/no-duplicate-classes": "error",
    "tailwindcss/no-unknown-classes": "error",
    "tailwindcss/enforce-canonical": "error",
    "tailwindcss/no-unnecessary-arbitrary-value": "error",
    "tailwindcss/enforce-sort-order": "error",
    "tailwindcss/enforce-shorthand": "error",
    "tailwindcss/enforce-physical": "error",
    "tailwindcss/consistent-variant-order": "error",
    "tailwindcss/enforce-consistent-important-position": "error",
    "tailwindcss/enforce-negative-arbitrary-values": "error",
    "tailwindcss/enforce-consistent-variable-syntax": "error",
    "tailwindcss/no-unnecessary-whitespace": "error",

    // Vitest rules
    // Buggy: misfires on tests that import `test` from a custom setup helper.
    "vitest/no-standalone-expect": "off",
  },
  settings: {
    tailwindcss: {
      entryPoint: "packages/ui/src/styles/globals.css",
    },
  },
})
