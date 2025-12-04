export const normalizeArrayKey = (key: string) =>
  key.replace(/\[(\d+)\]/g, ".$1")
