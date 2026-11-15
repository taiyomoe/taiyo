import SuperJSON from "superjson"

export const parseCache = async <T>(input: Promise<string | null>) => {
  const value = await input

  if (value === null || value === "") {
    return null
  }

  return SuperJSON.parse<T>(value)
}
