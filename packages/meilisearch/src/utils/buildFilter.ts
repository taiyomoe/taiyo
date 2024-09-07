export const buildFilter = (input: string) =>
  input
    .replace(
      /\$not\((\w*)\sin\s(.*)\)/,
      (_, field, v) => `${field} NOT IN ${v}`,
    )
    .replace(/(=|!=) null/g, (_, op) =>
      op === "=" ? "IS NULL" : "IS NOT NULL",
    )
    .replace(/\b(?:and|or|not|in|is|null)\b/g, (token) => token.toUpperCase())
