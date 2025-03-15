"use client"

import { AnimatePresence } from "motion/react"
import { AuthAnimatedSlide } from "~/app/auth/_components/auth-animated-slide"
import { AuthVerificationEmailSent } from "~/app/auth/_components/auth-verification-email-sent"
import { useAuthStore } from "~/stores/auth.store"
import { SignUpForm } from "./sign-up-form"
import { SignUpSocials } from "./sign-up-socials"

export const SignUpFlow = () => {
  const { page } = useAuthStore()

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {page === 0 && (
          <AuthAnimatedSlide key="socials">
            <SignUpSocials />
          </AuthAnimatedSlide>
        )}
        {page === 1 && (
          <AuthAnimatedSlide key="email">
            <SignUpForm />
          </AuthAnimatedSlide>
        )}
        {page === 3 && (
          <AuthAnimatedSlide key="verificationEmailSent">
            <AuthVerificationEmailSent />
          </AuthAnimatedSlide>
        )}
      </AnimatePresence>
    </div>
  )
}
