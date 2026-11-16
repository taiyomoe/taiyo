import type { ReactNode } from "react"
import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "react-email"
import { emailColors, emailFonts, emailStyles } from "../theme"

type Props = {
  preview: string
  footer: ReactNode
  children: ReactNode
}

// Google Fonts' files, split like its stylesheets so "ō" comes from the latin-ext ones.
const latinExt =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF"
const latin =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
const fontFaces = [
  ["PT Serif", "700", "ptserif/v19/EJRSQgYoZZY2vCFuvAnt66qcVyvVp8NAyIw", latinExt],
  ["PT Serif", "700", "ptserif/v19/EJRSQgYoZZY2vCFuvAnt66qSVyvVp8NA", latin],
  ["Inter", "100 900", "inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7W0Q5n-wU", latinExt],
  ["Inter", "100 900", "inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw", latin],
]
  .map(
    ([family, weight, file, range]) =>
      `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(https://fonts.gstatic.com/s/${file}.woff2) format('woff2'); unicode-range: ${range}; }`,
  )
  .join("\n")
const EmailBase = ({ preview, footer, children }: Props) => (
  <Html lang="en">
    <Head>
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
      <style>{fontFaces}</style>
    </Head>
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: emailColors.night, fontFamily: emailFonts.sans, margin: 0 }}>
      <Container style={{ maxWidth: "560px", padding: "36px 12px 40px" }}>
        <Section>
          <table align="center" role="presentation" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={{ paddingRight: "12px", verticalAlign: "middle" }}>
                  <Img
                    src="https://taiyo.moe/email/logo.png"
                    width={41}
                    height={26}
                    alt=""
                    style={{ display: "block" }}
                  />
                </td>
                <td
                  style={{
                    color: emailColors.paper,
                    fontFamily: emailFonts.display,
                    fontSize: "26px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: "32px",
                    verticalAlign: "middle",
                  }}
                >
                  Taiyō
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
        <Img
          src="https://taiyo.moe/email/sunrise.jpg"
          width={560}
          height={179}
          alt=""
          style={{ display: "block", height: "auto", maxWidth: "100%", width: "100%" }}
        />
        <Section
          style={{
            backgroundColor: emailColors.paper,
            borderRadius: "16px",
            padding: "36px 32px 32px",
          }}
        >
          {children}
          <Hr style={{ borderColor: emailColors.rule, margin: "28px 0 20px" }} />
          <Text style={emailStyles.small}>{footer}</Text>
        </Section>
        <Text
          style={{
            ...emailStyles.small,
            color: emailColors.dusk,
            paddingTop: "28px",
            textAlign: "center",
          }}
        >
          <span style={{ fontFamily: emailFonts.display, fontWeight: 700 }}>Taiyō</span> ·{" "}
          <Link href="https://taiyo.moe" style={{ color: emailColors.dusk }}>
            taiyo.moe
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailBase
