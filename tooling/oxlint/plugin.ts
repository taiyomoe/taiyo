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
    "require-audited-route": requireAuditedRoute,
  },
}
