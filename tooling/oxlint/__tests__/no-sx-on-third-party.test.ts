import { RuleTester } from "oxlint/plugins-dev"
import { describe, it } from "vitest"
import plugin from "../plugin"

// oxlint-disable-next-line typescript/strict-void-return
RuleTester.describe = describe
RuleTester.it = it

new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } }).run(
  "no-sx-on-third-party",
  plugin.rules["no-sx-on-third-party"],
  {
    valid: [
      "const A = () => <div sx={s.a} />",
      'import { Button } from "@taiyomoe/ui/components/ui/button"\nconst A = () => <Button sx={s.a} />',
      'import { Scene } from "@/components/scene"\nconst A = () => <Scene sx={s.a} />',
      'import { Field } from "./field"\nconst A = () => <Field.Label sx={s.a} />',
      'import { Link } from "@tanstack/react-router"\nconst A = () => <Link to="/" {...stylex.props(s.a)} />',
    ],
    invalid: [
      {
        code: 'import { Link } from "@tanstack/react-router"\nconst A = () => <Link to="/" sx={s.a} />',
        errors: [{ messageId: "thirdParty" }],
      },
      {
        code: 'import { Tabs } from "@base-ui/react/tabs"\nconst A = () => <Tabs.Tab sx={s.a} />',
        errors: [{ messageId: "thirdParty" }],
      },
      {
        code: 'import * as Router from "@tanstack/react-router"\nconst A = () => <Router.Link sx={s.a} />',
        errors: [{ messageId: "thirdParty" }],
      },
    ],
  },
)
