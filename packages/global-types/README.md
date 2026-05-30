# `@types/global-types`

This package applies global TypeScript overrides across the workspace. Currently it re-exports [`@total-typescript/ts-reset`](https://github.com/total-typescript/ts-reset), which sharpens the built-in TypeScript types (e.g. `Array.filter(Boolean)` narrows, `JSON.parse` returns `unknown`, `fetch`'s `.json()` returns `unknown`, etc).

It is added as a `devDependency` at the workspace root so the global type augmentations apply everywhere.
