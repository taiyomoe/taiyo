export const DATE_MATH_UNITS = ["s", "m", "h", "d", "w", "M", "y"] as const

export type DateMathUnit = (typeof DATE_MATH_UNITS)[number]

export type DateMath =
  | { kind: "absolute"; date: Date }
  | { kind: "relative"; amount: number; unit: DateMathUnit; round: DateMathUnit | null }

const RELATIVE = /^now(?:([+-])(\d{1,6})([smhdwMy]))?(?:\/([smhdwMy]))?$/
const isUnit = (value: string | undefined): value is DateMathUnit =>
  DATE_MATH_UNITS.some((unit) => unit === value)

export const parseDateMath = (expression: string): DateMath | null => {
  const relative = RELATIVE.exec(expression.trim())

  if (relative !== null) {
    const [, sign, amount, unit, round] = relative

    return {
      kind: "relative",
      amount: amount === undefined ? 0 : Number(amount) * (sign === "+" ? 1 : -1),
      unit: isUnit(unit) ? unit : "m",
      round: isUnit(round) ? round : null,
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}/.test(expression.trim())) {
    return null
  }

  const date = new Date(expression)

  return Number.isNaN(date.getTime()) ? null : { kind: "absolute", date }
}

const addToDate = (date: Date, amount: number, unit: DateMathUnit) => {
  const next = new Date(date)

  switch (unit) {
    case "s": {
      next.setSeconds(next.getSeconds() + amount)

      break
    }

    case "m": {
      next.setMinutes(next.getMinutes() + amount)

      break
    }

    case "h": {
      next.setHours(next.getHours() + amount)

      break
    }

    case "d": {
      next.setDate(next.getDate() + amount)

      break
    }

    case "w": {
      next.setDate(next.getDate() + amount * 7)

      break
    }

    case "M": {
      next.setMonth(next.getMonth() + amount)

      break
    }

    case "y": {
      next.setFullYear(next.getFullYear() + amount)

      break
    }
  }

  return next
}
const startOfUnit = (date: Date, unit: DateMathUnit) => {
  const start = new Date(date)

  start.setMilliseconds(0)

  if (unit === "s") {
    return start
  }

  start.setSeconds(0)

  if (unit === "m") {
    return start
  }

  start.setMinutes(0)

  if (unit === "h") {
    return start
  }

  start.setHours(0)

  if (unit === "w") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  } else if (unit === "M") {
    start.setDate(1)
  } else if (unit === "y") {
    start.setMonth(0, 1)
  }

  return start
}

export const resolveDateMath = (
  expression: string,
  { now, roundUp = false }: { now: number; roundUp?: boolean },
) => {
  const parsed = parseDateMath(expression)

  if (parsed === null) {
    return null
  }

  if (parsed.kind === "absolute") {
    return parsed.date
  }

  const shifted = addToDate(new Date(now), parsed.amount, parsed.unit)

  if (parsed.round === null) {
    return shifted
  }

  const start = startOfUnit(shifted, parsed.round)

  return roundUp ? addToDate(start, 1, parsed.round) : start
}

export const resolveDateRange = (from: string, to: string, now: number) => {
  const start = resolveDateMath(from, { now })
  const end = resolveDateMath(to, { now, roundUp: true })

  return start === null || end === null || start.getTime() >= end.getTime()
    ? null
    : { from: start, to: end }
}

export const toDateMath = ({
  amount,
  unit,
  round,
}: Omit<Extract<DateMath, { kind: "relative" }>, "kind">) =>
  `now${amount === 0 ? "" : `${amount > 0 ? "+" : "-"}${Math.abs(amount)}${unit}`}${round === null ? "" : `/${round}`}`
