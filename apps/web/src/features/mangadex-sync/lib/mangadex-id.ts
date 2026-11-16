const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

export const parseMangaDexId = (input: string) => {
  const trimmed = input.trim()

  if (UUID.test(trimmed) && trimmed.length === 36) {
    return trimmed.toLowerCase()
  }

  try {
    const url = new URL(trimmed)
    const [kind, id] = url.pathname.split("/").filter(Boolean)

    return url.hostname.endsWith("mangadex.org") &&
      kind === "title" &&
      id !== undefined &&
      UUID.test(id) &&
      id.length === 36
      ? id.toLowerCase()
      : null
  } catch {
    return null
  }
}
