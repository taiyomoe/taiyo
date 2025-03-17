"use client"

import { AnimatePresence } from "motion/react"
import { AuthAnimatedSlide } from "~/app/auth/_components/auth-animated-slide"
import { AuthVerificationEmailSent } from "~/app/auth/_components/auth-verification-email-sent"
import { useAuthStore } from "~/stores/auth-flow.store"
import { ForgotPasswordForm } from "./forgot-password-form"
import { MagicLinkSent } from "./magic-link-sent"
import { ResetPasswordEmailSent } from "./reset-password-email-sent"
import { SignInFormEmail } from "./sign-in-form-email"
import { SignInFormMagicLink } from "./sign-in-form-magic-link"
import { SignInFormUsername } from "./sign-in-form-username"
import { SignInSocials } from "./sign-in-socials"

export const SignInFlow = () => {
  const { page } = useAuthStore()

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {page === 0 && (
          <AuthAnimatedSlide key="socials">
            <SignInSocials />
          </AuthAnimatedSlide>
        )}
        {page === 1 && (
          <AuthAnimatedSlide key="magicLink">
            <SignInFormMagicLink />
          </AuthAnimatedSlide>
        )}
        {page === 2 && (
          <AuthAnimatedSlide key="email">
            <SignInFormEmail />
          </AuthAnimatedSlide>
        )}
        {page === 3 && (
          <AuthAnimatedSlide key="username">
            <SignInFormUsername />
          </AuthAnimatedSlide>
        )}
        {page === 4 && (
          <AuthAnimatedSlide key="verificationEmailSent">
            <AuthVerificationEmailSent />
          </AuthAnimatedSlide>
        )}
        {page === 5 && (
          <AuthAnimatedSlide key="forgotPassword">
            <ForgotPasswordForm />
          </AuthAnimatedSlide>
        )}
        {page === 6 && (
          <AuthAnimatedSlide key="magicLinkSent">
            <MagicLinkSent />
          </AuthAnimatedSlide>
        )}
        {page === 7 && (
          <AuthAnimatedSlide key="resetPasswordEmailSent">
            <ResetPasswordEmailSent />
          </AuthAnimatedSlide>
        )}
      </AnimatePresence>
    </div>
  )
}
