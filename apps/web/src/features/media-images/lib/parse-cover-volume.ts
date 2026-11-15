const PREFIXED = /(?:^|[^a-z])(?:volume|vol|tome|v|t)[\s._-]*0*(\d{1,4})(?!\d)/i
const LAST_NUMBER = /(?:^|\D)0*(\d{1,4})(?!.*\d)/

export const parseCoverVolume = (fileName: string) => {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "")
  const match = PREFIXED.exec(base) ?? LAST_NUMBER.exec(base)
  const volume = match?.[1] === undefined ? 0 : Number(match[1])

  return volume >= 1 ? String(volume) : ""
}
