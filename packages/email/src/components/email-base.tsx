import type { ReactNode } from "react"
import { Container, Heading, Html, Img, Preview, Section } from "react-email"
import { emailColors } from "../theme"

type Props = {
  preview: string
  children: ReactNode
}

const EmailBase = ({ preview, children }: Props) => (
  <Html lang="en" style={{ backgroundColor: emailColors.page }}>
    <Preview>{preview}</Preview>
    <Section style={{ marginTop: "32px" }}>
      <Img
        src="https://cdn.taiyo.moe/assets/logo.png"
        width={96}
        alt="Taiyō"
        style={{ margin: "0 auto" }}
      />
    </Section>
    <Heading
      style={{
        color: emailColors.heading,
        fontSize: "24px",
        fontWeight: 600,
        margin: "16px 0",
        padding: 0,
        textAlign: "center",
      }}
    >
      Taiyō
    </Heading>
    <Container
      style={{
        backgroundColor: emailColors.surface,
        border: `1px solid ${emailColors.border}`,
        borderRadius: "8px",
        marginBottom: "48px",
        marginTop: "48px",
      }}
    >
      {children}
    </Container>
  </Html>
)

export default EmailBase
