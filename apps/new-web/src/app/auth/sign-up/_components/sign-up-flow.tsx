"use client"

import { AnimatePresence } from "motion/react"
import { AuthAnimatedSlide } from "~/app/auth/_components/auth-animated-slide"
import { useAuthStore } from "~/stores/auth.store"
import { SignUpForm } from "./sign-up-form"
import { SignUpVerificationEmailSent } from "./sign-up-verification-email-sent"
import { SocialsSignUp } from "./socials-sign-up"

export const SignUpFlow = () => {
  const { page } = useAuthStore()

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {page === 0 && (
          <AuthAnimatedSlide key="socials">
            <SocialsSignUp />
          </AuthAnimatedSlide>
        )}
        {page === 1 && (
          <AuthAnimatedSlide key="email">
            <SignUpForm />
          </AuthAnimatedSlide>
        )}
        {page === 3 && (
          <AuthAnimatedSlide key="verification-email-sent">
            <SignUpVerificationEmailSent />
          </AuthAnimatedSlide>
        )}
      </AnimatePresence>
    </div>
  )
}
