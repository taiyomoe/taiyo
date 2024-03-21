import { type Static, t } from "elysia"

export const ImportMediaInput = t.Object({
  mdId: t.String({ format: "uuid" }),
})

export type ImportMediaInput = Static<typeof ImportMediaInput>
