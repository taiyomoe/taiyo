/** An http(s) URL with a host and no credentials, normalised, or null. */
export const toSafeHref = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return null
  }

  try {
    const parsed = new URL(url)

    return (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname !== "" &&
      parsed.username === "" &&
      parsed.password === ""
      ? parsed.href
      : null
  } catch {
    return null
  }
}
