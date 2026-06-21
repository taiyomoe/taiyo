import { AuthScene } from "@/components/auth/scene/auth-scene"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { m } from "@/paraglide/messages"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

const TABS = [
  { type: "sign-up", label: m.auth_sign_up, to: "/auth/sign-up" },
  { type: "sign-in", label: m.auth_sign_in, to: "/auth/sign-in" },
] as const

export const AuthForm = ({ type: initialType }: { type: "sign-in" | "sign-up" }) => {
  const [type, setType] = useState(initialType)
  const navigate = useNavigate()
  const handleTabClick = async (type: "sign-in" | "sign-up") => {
    setType(type)

    await navigate({ to: `/auth/${type}` })
  }

  return (
    <div
      data-auth-screen
      className="dark grid h-svh overflow-hidden bg-[#120a07] text-[#FFFCF8] [--ring:#FFB820] lg:grid-cols-[1.05fr_0.95fr]"
    >
      <AuthScene />
      <div
        className="flex h-svh flex-col justify-center overflow-y-auto px-[clamp(28px,5vw,76px)] py-8 [&::-webkit-scrollbar]:w-0"
        style={{ backgroundImage: "linear-gradient(180deg,#1b0f0a,#150c08)" }}
      >
        <div className="mx-auto w-full max-w-107.5">
          <div className="inline-flex gap-1 rounded-full border border-white/8 bg-white/6 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.type}
                onClick={() => handleTabClick(tab.type)}
                className="rounded-full px-5 py-2 text-sm font-bold text-white/70 transition-colors hover:text-white data-[active=true]:bg-[#FFFCF8] data-[active=true]:text-[#1b0f0a]"
                data-active={tab.type === type}
              >
                {tab.label()}
              </button>
            ))}
          </div>
          {type === "sign-in" ? <SignInForm /> : <SignUpForm />}
        </div>
      </div>
    </div>
  )
}
