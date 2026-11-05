import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@taiyomoe/ui/components/ui/card"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  footer: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
})

export function SettingsSection({
  title,
  description,
  action,
  footer,
  children,
}: {
  title: string
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children?: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle render={<h2 />}>{title}</CardTitle>
        {description === undefined ? null : <CardDescription>{description}</CardDescription>}
        {action === undefined ? null : <CardAction>{action}</CardAction>}
      </CardHeader>
      {children === undefined ? null : <CardPanel>{children}</CardPanel>}
      {footer === undefined ? null : <CardFooter sx={styles.footer}>{footer}</CardFooter>}
    </Card>
  )
}
