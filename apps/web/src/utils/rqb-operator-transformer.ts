export const rqbOperatorTransformer = (operator: string) => {
  switch (operator) {
    case "=":
      return "equals"
    case "!=":
      return "not"
    case "startsWith":
      return "startsWith"
    case "endsWith":
      return "endsWith"
    //These are indeed "equals"
    case "null":
      return "equals"
    case "notNull":
      return "equals"
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
