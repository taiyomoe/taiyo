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
