import { Button, Link, Section, Text } from "react-email"
import { emailColors, emailFonts, emailStyles } from "../theme"

type Props = {
  href: string
  label: string
}

const EmailAction = ({ href, label }: Props) => (
  <>
    <Section style={{ margin: "8px 0 24px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: emailColors.brand,
          borderRadius: "11px",
          color: emailColors.onBrand,
          display: "inline-block",
          fontFamily: emailFonts.sans,
          fontSize: "15px",
          fontWeight: 600,
          lineHeight: "20px",
          padding: "12px 20px",
        }}
      >
        {label}
      </Button>
    </Section>
    <Text style={emailStyles.small}>
      If the button does not work, copy and paste this link into your browser:{" "}
      <Link href={href} style={emailStyles.link}>
        {href}
      </Link>
    </Text>
  </>
)

export default EmailAction
