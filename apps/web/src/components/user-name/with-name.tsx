import { Fragment } from "react"
import { UserName } from "@/components/user-name/user-name"

const SENTINEL = "⁣NAME⁣"

/**
 * Renders a translated message whose `{name}` placeholder is a user's display
 * name, painting that name with the user's equipped effect. Pass the message
 * itself (`m.users_ban_title`), or a wrapper for messages with more params
 * (`(inputs) => m.foo({ ...inputs, count })`). The result is one inline span,
 * so the text around the name keeps its spacing inside flex parents.
 */
export const renderWithName = (
  message: (inputs: { name: string }) => string,
  user: { displayUsername: string; nameEffect: string | null | undefined },
) => {
  const [first = "", ...rest] = message({ name: SENTINEL }).split(SENTINEL)

  if (rest.length === 0) {
    return first
  }

  return (
    <span>
      {first}
      {rest.map((part, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- the parts never reorder
        <Fragment key={index}>
          <UserName effect={user.nameEffect} name={user.displayUsername} />
          {part}
        </Fragment>
      ))}
    </span>
  )
}
