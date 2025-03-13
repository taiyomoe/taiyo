"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { SignInForm } from "./sign-in-form"
import { SocialsSignIn } from "./socials-sign-in"

export const SignInFlow = () => {
  const [step, setStep] = useState<"socials" | "email">("socials")

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
            <SocialsSignIn toggleEmail={() => setStep("email")} />
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
            <SignInForm toggleSocials={() => setStep("socials")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
