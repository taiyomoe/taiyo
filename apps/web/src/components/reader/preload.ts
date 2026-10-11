const PRELOAD_AHEAD = 3

export const getPreloadIndices = (current: number, total: number, ahead = PRELOAD_AHEAD) => {
  if (total <= 0) {
    return []
  }

  const start = Math.min(Math.max(current, 0), total - 1) + 1
  const end = Math.min(start + ahead, total)

  return Array.from({ length: Math.max(end - start, 0) }, (_, offset) => start + offset)
}
