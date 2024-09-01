export const buildFilter = (input: string) =>
  input
    .replace(
      /onlyDeleted = (true|false)/g,
      (_, v) => `deletedAt IS ${v === "true" ? "NOT" : ""} NULL`,
    )
    .replace(
      /\$not\((\w*)\sin\s(.*)\)/,
      (_, field, v) => `${field} NOT IN ${v}`,
    )
    .replace(/\s(?:and|or|not|in)\s/g, (token) => token.toUpperCase())
