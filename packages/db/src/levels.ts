export const READER_RANKS = [
  { level: 1, key: "newcomer" },
  { level: 5, key: "pageTurner" },
  { level: 10, key: "apprentice" },
  { level: 20, key: "adept" },
  { level: 30, key: "scholar" },
  { level: 45, key: "sage" },
  { level: 60, key: "archivist" },
  { level: 80, key: "grandmaster" },
] as const

export type ReaderRank = (typeof READER_RANKS)[number]["key"]

const MAX_LEVEL = 999

/** Experience needed to go from `level` to the next one: one point per credited page read. */
export const getLevelCost = (level: number) => Math.round((250 + 60 * (level - 1) ** 1.5) / 10) * 10

export const getLevelProgress = (xp: number) => {
  let level = 1
  let floor = 0

  while (level < MAX_LEVEL && xp >= floor + getLevelCost(level)) {
    floor += getLevelCost(level)
    level += 1
  }

  const cost = getLevelCost(level)
  const rank =
    [...READER_RANKS].reverse().find((candidate) => candidate.level <= level) ?? READER_RANKS[0]
  const next = READER_RANKS.find((candidate) => candidate.level > level) ?? null

  return {
    level,
    xp,
    levelXp: Math.min(xp - floor, cost),
    levelCost: cost,
    rank: rank.key,
    nextRank: next === null ? null : { key: next.key, level: next.level },
  }
}
