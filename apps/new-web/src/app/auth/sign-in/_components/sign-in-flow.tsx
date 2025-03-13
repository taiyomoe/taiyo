"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useAtomValue } from "jotai"
import { SignInFormUsername } from "~/app/auth/sign-in/_components/sign-in-form-username"
import { signInFlowStepAtom } from "~/atoms/sign-in-flow.atoms"
import { SignInFormEmail } from "./sign-in-form-email"
import { SocialsSignIn } from "./socials-sign-in"

export const SignInFlow = () => {
  const step = useAtomValue(signInFlowStepAtom)

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait" initial={false}>
        {step === "socials" && (
          <motion.div
            key="socials"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SocialsSignIn />
          </motion.div>
        )}
        {step === "email" && (
          <motion.div
            key="email"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SignInFormEmail />
          </motion.div>
        )}
        {step === "username" && (
          <motion.div
            key="username"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SignInFormUsername />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
