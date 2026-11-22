const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"])
const isIndex = (key: string) => `${Number.parseInt(key, 10)}` === key

/**
 * Nests flat form field names (`titles.0.title`, `covers[1].file`) into objects and arrays,
 * like radashi `construct`, but in a single pass: `construct` clones the whole result for every
 * field, which makes a request with many fields quadratic.
 */
export const buildFormDataObject = (entries: Iterable<[string, unknown]>) => {
  const root = {}

  for (const [path, value] of entries) {
    const keys = path.match(/[^.[\]]+/g)

    if (keys === null || keys.some((key) => UNSAFE_KEYS.has(key))) {
      continue
    }

    let node: object = root

    for (const [index, key] of keys.entries()) {
      const nextKey = keys[index + 1]

      if (nextKey === undefined) {
        Reflect.set(node, key, value)

        break
      }

      const child: unknown = Reflect.get(node, key)

      if (typeof child === "object" && child !== null) {
        node = child

        continue
      }

      const created = isIndex(nextKey) ? [] : {}

      Reflect.set(node, key, created)
      node = created
    }
  }

  return root
}
