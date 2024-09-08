export const buildSort = (input: string[][]) =>
  input.flatMap(([field, order]) => `${field}:${order}`)
