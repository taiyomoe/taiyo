import { Container, Heading, Html, Img, Preview, Section, Tailwind } from "@react-email/components"
import type { ReactNode } from "react"

type Props = {
  preview: string
  children: ReactNode
}

const EmailBase = ({ preview, children }: Props) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            muted: "#f3f4f6",
            card: "#ffffff",
            primary: "#FF4F4F",
            border: "#e5e7eb",
          },
        },
      },
    }}
  >
    <Html lang="en" className="bg-muted">
      <Preview>{preview}</Preview>
      <Section className="mt-8">
        <Img
          src="https://cdn.taiyo.moe/assets/logo.png"
          width={96}
          alt="Taiyō"
          className="mx-auto my-0"
        />
      </Section>
      <Heading className="mx-0 my-4 p-0 text-center text-[24px] font-semibold text-black">
        Taiyō
      </Heading>
      <Container className="my-12 rounded-lg border border-solid border-border bg-card">
        {children}
      </Container>
    </Html>
  </Tailwind>
)

export default EmailBase
