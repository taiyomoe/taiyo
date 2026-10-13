import { defineConfig } from "oxfmt"

export default defineConfig({
  semi: false,
  sortPackageJson: true,
  sortImports: {
    newlinesBetween: false,
    groups: [
      "type-import",
      ["value-builtin", "value-external"],
      "type-internal",
      "value-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
  },
  ignorePatterns: [".agents/**", ".claude/**", "apps/web/src/routeTree.gen.ts"],
})
