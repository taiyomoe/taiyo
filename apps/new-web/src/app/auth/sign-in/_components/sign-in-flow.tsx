"use client"

import { useAtomValue } from "jotai"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { signInFlowStepAtom } from "~/atoms/auth-flow.atoms"
import { SignInFormEmail } from "./sign-in-form-email"
import { SignInFormUsername } from "./sign-in-form-username"
import { SignInVerificationEmailSent } from "./sign-in-verification-email-sent"
import { SocialsSignIn } from "./socials-sign-in"

const variants = {
  exit: (direction: number) => ({
    x: direction < 0 ? -30 : 30,
    opacity: 0,
  }),
}

export const SignInFlow = () => {
  const rawStep = useAtomValue(signInFlowStepAtom)
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
          {step === 0 && <SocialsSignIn />}
          {step === 1 && <SignInFormEmail />}
          {step === 2 && <SignInFormUsername />}
          {step === 3 && <SignInVerificationEmailSent />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
