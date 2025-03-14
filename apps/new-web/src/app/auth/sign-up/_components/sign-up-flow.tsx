"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useAtomValue } from "jotai"
import { useState } from "react"
import { signUpFlowStepAtom } from "~/atoms/auth-flow.atoms"
import { SignUpForm } from "./sign-up-form"
import { SignUpVerificationEmailSent } from "./sign-up-verification-email-sent"
import { SocialsSignUp } from "./socials-sign-up"

const variants = {
  exit: (direction: number) => ({
    x: direction < 0 ? -30 : 30,
    opacity: 0,
  }),
}

export const SignUpFlow = () => {
  const rawStep = useAtomValue(signUpFlowStepAtom)
  const [[step, direction], setStep] = useState([0, -1])

  if (rawStep !== step) setStep([rawStep!, rawStep! > step ? 1 : -1])

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
          custom={direction}
          variants={variants}
          initial="exit"
          exit="exit"
        >
          {step === 0 && <SocialsSignUp />}
          {step === 1 && <SignUpForm />}
          {step === 2 && <SignUpVerificationEmailSent />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
