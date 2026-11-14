export const INDEXES_BATCH_SIZE = 100

// Values per filter array: unbounded lists make zod report, and the API send back, one issue per
// element, and fan out into as many Meilisearch filter clauses.
export const MAX_FILTER_VALUES = 100
