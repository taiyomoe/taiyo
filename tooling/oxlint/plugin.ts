import type { RuleTester } from "oxlint/plugins-dev"

type Rule = Parameters<RuleTester["run"]>[1]

const FIRST_PARTY_SOURCE = /^(?:\.|@\/|@taiyomoe\/)/
const noSxOnThirdParty: Rule = {
  meta: {
    type: "problem",
    messages: {
      thirdParty:
        "`{{component}}` from {{source}} drops `sx`: StyleX only compiles it on intrinsic elements. Spread `stylex.props(...)` instead.",
    },
  },
  create(context) {
    const thirdParty = new Map<string, string>()

    return {
      ImportDeclaration(node) {
        if (FIRST_PARTY_SOURCE.test(node.source.value)) {
          return
        }

        for (const specifier of node.specifiers) {
          thirdParty.set(specifier.local.name, node.source.value)
        }
      },
      JSXAttribute(node) {
        const element = node.parent

        if (
          node.name.type !== "JSXIdentifier" ||
          node.name.name !== "sx" ||
          element.type !== "JSXOpeningElement"
        ) {
          return
        }

        let root = element.name

        while (root.type === "JSXMemberExpression") {
          root = root.object
        }

        if (root.type !== "JSXIdentifier") {
          return
        }

        const source = thirdParty.get(root.name)

        if (source !== undefined) {
          context.report({
            node,
            messageId: "thirdParty",
            data: { component: context.sourceCode.getText(element.name), source },
          })
        }
      },
    }
  },
}
const sxRequiresStylexImport: Rule = {
  meta: {
    type: "problem",
    messages: {
      missingImport:
        "`sx` on <{{element}}> is left uncompiled: StyleX only compiles files that import `@stylexjs/stylex`. Import it, even if unused.",
    },
  },
  create(context) {
    let importsStylex = false

    return {
      ImportDeclaration(node) {
        if (node.source.value === "@stylexjs/stylex") {
          importsStylex = true
        }
      },
      JSXAttribute(node) {
        const element = node.parent

        if (
          importsStylex ||
          node.name.type !== "JSXIdentifier" ||
          node.name.name !== "sx" ||
          element.type !== "JSXOpeningElement" ||
          element.name.type !== "JSXIdentifier" ||
          !/^[a-z]/.test(element.name.name)
        ) {
          return
        }

        context.report({ node, messageId: "missingImport", data: { element: element.name.name } })
      },
    }
  },
}
const INLINE_QUERY = /^@(?:media|container)\b/
const noInlineQueries: Rule = {
  meta: {
    type: "problem",
    messages: {
      inlineQuery:
        "`{{query}}` is an inline query: use `breakpoints`, `containers` or `consts` from @taiyomoe/ui/styles/tokens.stylex, or a `defineConsts` in a `*.stylex.ts` file.",
    },
  },
  create(context) {
    if (context.filename.endsWith(".stylex.ts")) {
      return {}
    }

    return {
      Literal(node) {
        if (typeof node.value === "string" && INLINE_QUERY.test(node.value)) {
          context.report({ node, messageId: "inlineQuery", data: { query: node.value } })
        }
      },
      TemplateLiteral(node) {
        const head = node.quasis[0]?.value.cooked ?? ""

        if (INLINE_QUERY.test(head)) {
          context.report({ node, messageId: "inlineQuery", data: { query: head } })
        }
      },
    }
  },
}
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"])
const requireAuditedRoute: Rule = {
  meta: {
    type: "problem",
    messages: {
      unaudited:
        "`.{{method}}()` routes change state, so they must pass `audited(...)` to land in the audit log.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node

        if (
          callee.type !== "MemberExpression" ||
          callee.property.type !== "Identifier" ||
          !MUTATING_METHODS.has(callee.property.name) ||
          callee.object.type !== "NewExpression" ||
          callee.object.callee.type !== "Identifier" ||
          callee.object.callee.name !== "Hono"
        ) {
          return
        }

        const isAudited = node.arguments.some(
          (argument) =>
            argument.type === "CallExpression" &&
            argument.callee.type === "Identifier" &&
            argument.callee.name === "audited",
        )

        if (!isAudited) {
          context.report({
            node: callee.property,
            messageId: "unaudited",
            data: { method: callee.property.name },
          })
        }
      },
    }
  },
}

export default {
  meta: { name: "taiyo" },
  rules: {
    "no-sx-on-third-party": noSxOnThirdParty,
    "sx-requires-stylex-import": sxRequiresStylexImport,
    "no-inline-queries": noInlineQueries,
    "require-audited-route": requireAuditedRoute,
  },
}
