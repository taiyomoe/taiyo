const generate = (n: number) => {
  const colorNumber = Math.random() * n

  return Array.from({ length: n }).map(
    () => `hsl(${colorNumber * (360 / n) * 360},100%,50%)`,
  )
}

export const ColorUtils = {
  generate,
}
