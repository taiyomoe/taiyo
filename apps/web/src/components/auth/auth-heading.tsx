export const AuthHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <header>
    <h1 className="mt-7 font-heading text-[clamp(30px,3.4vw,42px)] leading-[1.05] font-bold tracking-[-0.02em]">
      {title}
    </h1>
    <p className="mt-2 mb-6 text-white/60">{subtitle}</p>
  </header>
)
