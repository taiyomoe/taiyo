import { defineConfig } from "oxfmt"

export default defineConfig({
  semi: false,
  sortPackageJson: true,
  ignorePatterns: [".agents/**", "./apps/web/src/routeTree.gen.ts"],
})
