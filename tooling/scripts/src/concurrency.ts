export const forEachConcurrently = async <T>(
  items: readonly T[],
  concurrency: number,
  run: (item: T, index: number) => Promise<void>,
) => {
  const queue = items.entries()

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      for (const [index, item] of queue) {
        await run(item, index)
      }
    }),
  )
}
