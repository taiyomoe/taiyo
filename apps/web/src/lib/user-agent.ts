const BROWSERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
]
const SYSTEMS: ReadonlyArray<readonly [RegExp, string]> = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
]
const match = (value: string, patterns: ReadonlyArray<readonly [RegExp, string]>) =>
  patterns.find(([pattern]) => pattern.test(value))?.[1] ?? null

export const describeUserAgent = (value: string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const browser = match(value, BROWSERS)
  const os = match(value, SYSTEMS)

  return browser === null || os === null ? null : { browser, os }
}
