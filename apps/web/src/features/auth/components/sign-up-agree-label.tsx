import type { ReactNode } from "react"
import { ParaglideMessage } from "@inlang/paraglide-js-react"
import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { authFormStyles as sx } from "@/features/auth/components/auth-form-styles"
import { m } from "@/paraglide/messages"

const TermsLink = ({ children }: { children?: ReactNode }) => (
  <Link to="/terms" {...stylex.props(sx.link)}>
    {children}
  </Link>
)
const PrivacyLink = ({ children }: { children?: ReactNode }) => (
  <Link to="/privacy" {...stylex.props(sx.link)}>
    {children}
  </Link>
)

export const SignUpAgreeLabel = () => (
  <ParaglideMessage
    message={m.auth_agree}
    inputs={{}}
    markup={{ terms: TermsLink, privacy: PrivacyLink }}
  />
)
