export const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&")
