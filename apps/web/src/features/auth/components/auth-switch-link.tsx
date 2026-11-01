import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"

export const AuthSwitchLink = ({
  prompt,
  label,
  to,
}: {
  prompt: string
  label: string
  to: "/auth/sign-in" | "/auth/sign-up"
}) => (
  <p sx={sx.footer}>
    {prompt}{" "}
    <Link search to={to} {...stylex.props(sx.link)}>
      {label}
    </Link>
  </p>
)
