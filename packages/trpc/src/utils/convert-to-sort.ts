export const convertToSort = (input: string[][]) =>
  input.map(([field, order]) => ({ [field!]: order! }))
