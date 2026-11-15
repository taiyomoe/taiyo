import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { AuthHeading } from "@/features/auth/components/auth-heading"

export const AuthNotice = ({
  icon: Icon,
  title,
  subtitle,
  message,
  children,
}: {
  icon: (props: IconProps) => ReactElement
  title: string
  subtitle: string
  message: string
  children: ReactNode
}) => (
  <>
    <AuthHeading title={title} subtitle={subtitle} />
    <div sx={sx.confirmation}>
      <div sx={sx.confirmationBadge}>
        <Icon {...stylex.props(sx.confirmationIcon)} />
      </div>
      <p sx={sx.confirmationText}>{message}</p>
      {children}
    </div>
  </>
)
