"use client"

import { AnimatePresence } from "motion/react"
import { AuthAnimatedSlide } from "~/app/auth/_components/auth-animated-slide"
import { useAuthStore } from "~/stores/auth.store"
import { ForgotPasswordForm } from "./forgot-password-form"
import { SignInFormEmail } from "./sign-in-form-email"
import { SignInFormUsername } from "./sign-in-form-username"
import { SignInVerificationEmailSent } from "./sign-in-verification-email-sent"
import { SocialsSignIn } from "./socials-sign-in"

export const SignInFlow = () => {
  const { page } = useAuthStore()

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {page === 0 && (
          <AuthAnimatedSlide key="socials">
            <SocialsSignIn />
          </AuthAnimatedSlide>
        )}
        {page === 1 && (
          <AuthAnimatedSlide key="email">
            <SignInFormEmail />
          </AuthAnimatedSlide>
        )}
        {page === 2 && (
          <AuthAnimatedSlide key="username">
            <SignInFormUsername />
          </AuthAnimatedSlide>
        )}
        {page === 3 && (
          <AuthAnimatedSlide key="verification-email-sent">
            <SignInVerificationEmailSent />
          </AuthAnimatedSlide>
        )}
        {page === 4 && (
          <AuthAnimatedSlide key="forgot-password">
            <ForgotPasswordForm />
          </AuthAnimatedSlide>
        )}
      </AnimatePresence>
    </div>
  )
}
