import { AuthSunRays } from "@/components/auth/scene/auth-sun-rays"

export const AuthSun = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* aurora wash */}
    <div
      style={{
        position: "absolute",
        inset: "-20% -20% 30% -20%",
        background: "radial-gradient(60% 80% at 50% 100%, rgba(242,69,45,0.42), transparent 70%)",
        filter: "blur(20px)",
        animation: "auth-aurora 14s ease-in-out infinite",
      }}
    />

    {/* Sun system: rays and disk are children of one box so they stay concentric.
        Both are absolutely positioned and AuthSunRays comes first → painted behind the disk. */}
    <div className="absolute bottom-[-38%] left-1/2 size-110 -translate-x-1/2">
      <AuthSunRays />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #FFE3A0 0%, #FFB820 30%, #F2452D 64%, #B5281A 100%)",
          boxShadow: "0 0 120px 30px rgba(242,69,45,0.5), 0 0 220px 80px rgba(255,184,32,0.25)",
          animation: "auth-sun-breathe 7s ease-in-out infinite",
        }}
      />
    </div>

    {/* vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, #120a07 0%, rgba(18,10,7,0.35) 26%, rgba(18,10,7,0.5) 50%, rgba(18,10,7,0.15) 78%, rgba(18,10,7,0.35) 100%)",
      }}
    />
  </div>
)
