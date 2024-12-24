export const rqbOperatorTransformer = (operator: string) => {
  switch (operator) {
    case "=":
      return "equals"
    case "!=":
      return "not"
    case "in":
      return "in"
    case "notIn":
      return "notIn"
    case "<":
      return "lt"
    case "<=":
      return "lte"
    case ">":
      return "gt"
    case ">=":
      return "gte"

    case "equals":
      return "="
    case "not":
      return "!="
    case "lt":
      return "<"
    case "lte":
      return "<="
    case "gt":
      return ">"
    case "gte":
      return ">="
  }
}
