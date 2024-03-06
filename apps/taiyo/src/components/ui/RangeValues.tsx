type Props = {
  range: number[]
  availableNumbers: number[]
}

export const RangeValues = ({ range, availableNumbers }: Props) => {
  const RenderNumber = ({ n, isLast }: { n: number; isLast: boolean }) => {
    const suffix = isLast ? "" : ", "

    if (availableNumbers.includes(n)) {
      return <>{n + suffix}</>
    }

    return (
      <>
        <span className="text-danger-300">{n}</span>
        {suffix}
      </>
    )
  }

  return (
    <p className="text-default-300 text-sm">
      {range.map((x, i) => (
        <RenderNumber key={x} n={x} isLast={i === range.length - 1} />
      ))}
    </p>
  )
}
