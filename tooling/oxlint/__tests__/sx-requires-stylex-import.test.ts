import { RuleTester } from "oxlint/plugins-dev"
import { describe, it } from "vitest"
import plugin from "../plugin"

// oxlint-disable-next-line typescript/strict-void-return
RuleTester.describe = describe
RuleTester.it = it

new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } }).run(
  "sx-requires-stylex-import",
  plugin.rules["sx-requires-stylex-import"],
  {
    valid: [
      'import * as stylex from "@stylexjs/stylex"\nconst A = () => <div sx={s.a} />',
      'import * as stylex from "@stylexjs/stylex"\nimport { s } from "./styles"\nconst A = () => <section sx={s.a} />',
      'import { Button } from "@taiyomoe/ui/components/ui/button"\nconst A = () => <Button sx={s.a} />',
      'const A = () => <div className="a" />',
    ],
    invalid: [
      {
        code: 'import { s } from "./styles"\nconst A = () => <div sx={s.a} />',
        errors: [{ messageId: "missingImport" }],
      },
      {
        code: 'import { Button } from "@taiyomoe/ui/components/ui/button"\nconst A = () => <p sx={s.a}><Button sx={s.b} /></p>',
        errors: [{ messageId: "missingImport" }],
      },
    ],
  },
)
