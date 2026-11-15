export const move = <T>(items: readonly T[], index: number, offset: number) => {
  const next = [...items]
  const [item] = next.splice(index, 1)

  if (item !== undefined) {
    next.splice(index + offset, 0, item)
  }

  return next
}
