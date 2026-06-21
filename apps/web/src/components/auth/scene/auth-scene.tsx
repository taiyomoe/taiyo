import { AuthCitations } from "@/components/auth/scene/auth-citations"
import { AuthEmbers } from "@/components/auth/scene/auth-embers"
import { AuthSun } from "@/components/auth/scene/auth-sun"
import { m } from "@/paraglide/messages"
import { Link } from "@tanstack/react-router"
import { TaiyoLogoLockup } from "@taiyomoe/ui/components/logos/taiyo-logo-lockup"

export const AuthScene = () => (
  <div className="relative hidden flex-col justify-between overflow-hidden bg-[#120a07] px-14 py-11 lg:flex">
    <AuthSun />
    <AuthEmbers />
    <Link
      to="/"
      className="relative z-3 w-fit transition-opacity hover:opacity-80"
    >
      <TaiyoLogoLockup className="gap-3 text-[26px] font-bold tracking-[-0.02em]" />
    </Link>
    <AuthCitations />
    <div className="relative z-3 font-mono text-[13px] text-white/40">{m.auth_tagline()}</div>
  </div>
)
