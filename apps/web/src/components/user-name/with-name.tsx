import { Fragment } from "react"
import { UserLink } from "@/components/user-name/user-link"
import { UserName } from "@/components/user-name/user-name"

const SENTINEL = "⁣NAME⁣"

/**
 * Renders a translated message whose `{name}` placeholder is a user's display
 * name, painting that name with the user's equipped effect. Pass the message
 * itself (`m.users_ban_title`), or a wrapper for messages with more params
 * (`(inputs) => m.foo({ ...inputs, count })`). The result is one inline span,
 * so the text around the name keeps its spacing inside flex parents. With
 * `link`, the name links to the user's profile and previews it on hover; leave
 * it off in dialog titles and other places the reader shouldn't navigate from.
 */
export const renderWithName = (
  message: (inputs: { name: string }) => string,
  user: { displayUsername: string; nameEffect: string | null | undefined; username?: string },
  { link = false }: { link?: boolean } = {},
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
          {link && user.username !== undefined ? (
            <UserLink user={{ ...user, username: user.username }} />
          ) : (
            <UserName effect={user.nameEffect} name={user.displayUsername} />
          )}
          {part}
        </Fragment>
      ))}
    </span>
  )
}
