export const buildFilter = (input: string) =>
  input
    .replace(
      /\$not\((\w*)\sin\s(.*)\)/,
      (_, field, value) => `${field} NOT IN ${value}`,
    )
    .replace(/\s(?:and|or|not|in)\s/g, (token) => token.toUpperCase())
