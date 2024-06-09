export const parseCache = async <T>(input: Promise<string | null>) => {
  const value = await input

  if (!value) {
    return null
  }

  return JSON.parse(value) as T
}
