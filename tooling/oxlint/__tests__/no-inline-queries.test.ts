import { RuleTester } from "oxlint/plugins-dev"
import { describe, it } from "vitest"
import plugin from "../plugin"

// oxlint-disable-next-line typescript/strict-void-return
RuleTester.describe = describe
RuleTester.it = it

new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } }).run(
  "no-inline-queries",
  plugin.rules["no-inline-queries"],
  {
    valid: [
      "const s = stylex.create({ a: { width: { default: 1, [breakpoints.md]: 2 } } })",
      'const query = "(prefers-color-scheme: dark)"',
      {
        code: 'export const q = stylex.defineConsts({ md: "@media (width >= 48rem)" })',
        filename: "q.stylex.ts",
      },
    ],
    invalid: [
      {
        code: 'const s = stylex.create({ a: { width: { default: 1, "@media (width >= 50rem)": 2 } } })',
        errors: [{ messageId: "inlineQuery" }],
      },
      {
        code: 'const LG = "@media (width >= 64rem)"',
        errors: [{ messageId: "inlineQuery" }],
      },
      {
        code: "const s = { a: { [`@container (width >= 40rem)`]: 1 } }",
        errors: [{ messageId: "inlineQuery" }],
      },
    ],
  },
)
