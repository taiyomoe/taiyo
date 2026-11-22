export type RatingTotals = { count: number; sum: number }

export type RatingPrior = { priorWeight: number; priorMean: number }

export const getRatingAverage = ({ count, sum }: RatingTotals) => (count === 0 ? null : sum / count)

/** The Bayesian average of a title's ratings, pulled toward the prior mean while it has few. */
export const getRatingScore = (
  { count, sum }: RatingTotals,
  { priorWeight, priorMean }: RatingPrior,
) => (priorWeight * priorMean + sum) / (priorWeight + count)
