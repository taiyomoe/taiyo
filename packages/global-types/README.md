# `@taiyomoe/global-types`

This package is used to override TypeScript types globally. For example, it overrides `Prisma.Json` with custom JSON object types defined in the `PrismaJson` namespace.

## Usage

```ts
import "@taiyomoe/global-types": // imported globally in the workspace root

// Prisma JSON fields now use custom types
const settings: PrismaJson.UserSettings = {
  contentRating: ["NORMAL"],
  preferredTitles: "en",
};
```
