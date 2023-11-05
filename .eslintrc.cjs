/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  rules: {
    "import/no-anonymous-default-export": "off",
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

    // -- TypeScript rules
    /**
     * These opinionated rules are enabled in stylistic-type-checked above.
     * Feel free to reconfigure them to your own preference.
     */
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",

    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "separate-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-misused-promises": [
      2,
      {
        checksVoidReturn: { attributes: false },
      },
    ],

    // -- Next.js rules
    "@next/next/no-img-element": "off",
  },
  ignorePatterns: ["**/*/prisma/index.ts"],
};

module.exports = config;
