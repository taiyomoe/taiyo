import parseRange from "parse-numeric-range"

const compressRange = (input: number[]) => {
  const sortedNumbers = [...new Set(input)].sort((a, b) => a - b)
  const ranges: string[] = []

  for (let i = 0; i < sortedNumbers.length; i++) {
    const start = sortedNumbers[i]
    let end = start

    while (
      i < sortedNumbers.length - 1 &&
      sortedNumbers[i + 1]! - sortedNumbers[i]! === 1
    ) {
      end = sortedNumbers[i + 1]
      i++
    }

    if (start === end) {
      ranges.push(start!.toString())
    } else {
      ranges.push(`${start}-${end}`)
    }
  }

  return ranges.join(", ")
}

export const NumberUtils = {
  parseRange,
  compressRange,
}
