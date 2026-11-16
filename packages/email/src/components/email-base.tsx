import type { ReactNode } from "react"
import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "react-email"
import { emailColors, emailFont, emailStyles } from "../theme"

type Props = {
  preview: string
  footer: ReactNode
  children: ReactNode
}

// Google Fonts' Inter, split like its stylesheet so "ō" comes from the latin-ext file.
const fontFaces = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7W0Q5n-wU.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`
const EmailBase = ({ preview, footer, children }: Props) => (
  <Html lang="en">
    <Head>
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <style>{fontFaces}</style>
    </Head>
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: emailColors.page, fontFamily: emailFont, margin: 0 }}>
      <Container style={{ fontFamily: emailFont, maxWidth: "520px", padding: "40px 16px" }}>
        <Section style={{ paddingBottom: "24px" }}>
          <table align="center" role="presentation" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={{ paddingRight: "10px", verticalAlign: "middle" }}>
                  <Img
                    src="https://taiyo.moe/email/logo.png"
                    width={44}
                    height={28}
                    alt=""
                    style={{ display: "block" }}
                  />
                </td>
                <td
                  style={{
                    color: emailColors.text,
                    fontFamily: emailFont,
                    fontSize: "22px",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    verticalAlign: "middle",
                  }}
                >
                  Taiyō
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
        <Section
          style={{
            backgroundColor: emailColors.surface,
            border: `1px solid ${emailColors.border}`,
            borderRadius: "14px",
            padding: "32px",
          }}
        >
          {children}
          <Hr style={{ borderColor: emailColors.border, margin: "24px 0" }} />
          <Text style={emailStyles.small}>{footer}</Text>
        </Section>
        <Text style={{ ...emailStyles.small, paddingTop: "24px", textAlign: "center" }}>
          Taiyō ·{" "}
          <Link href="https://taiyo.moe" style={{ color: emailColors.muted }}>
            taiyo.moe
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailBase
