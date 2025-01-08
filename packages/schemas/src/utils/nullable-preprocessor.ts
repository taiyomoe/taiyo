export const nullablePreprocessor = (input: unknown) => {
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => {
        /**
         * If the value is "null" or "notNull" (stringified),
         * it means it's either `equals` or `not` that we want to use.
         */
        if (k === "equals" && v === "null") return ["equals", null]
        if (k === "equals" && v === "notNull") return ["not", null]

        /**
         * Otherwise, as the value is probably null (plain null, not a stringified one),
         * we'll just let the schema take the default value
         */
        return [k, v === null ? undefined : v]
      }),
    )
  }

  return input
}
