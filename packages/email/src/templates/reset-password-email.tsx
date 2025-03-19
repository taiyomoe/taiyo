// biome-ignore lint/correctness/noUnusedImports: <explanation>
import * as React from "react"

import {
  Button,
  Container,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

type Props = {
  name: string
  url: string
}

const ResetPasswordEmail = ({ name, url }: Props) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            default: "#ffffff",
            subtle: "#f3f4f6",
            brand: "#FF4F4F",
          },
          borderColor: {
            subtle: "#e5e7eb",
          },
        },
      },
    }}
  >
    <Html lang="en" className="bg-subtle">
      <Preview>Reset your password on Taiyō</Preview>
      <Section className="mt-[32px]">
        <Img
          src="https://cdn.taiyo.moe/assets/logo.png"
          width={96}
          alt="Taiyō"
          className="mx-auto my-0"
        />
      </Section>
      <Heading className="mx-0 my-4 p-0 text-center font-semibold text-[24px] text-black">
        Taiyō
      </Heading>
      <Container className="my-12 rounded-lg border border-subtle border-solid bg-default">
        <Container className="px-8 py-4">
          <Text className="font-bold text-2xl">Reset your password</Text>
          <Text>
            Hi {name}, we received a request to reset your password. Please
            click the button below to reset it. This link will be valid for 1
            hour.
          </Text>
          <Section>
            <Button
              href={url}
              className="rounded-md bg-brand px-3 py-1.5 text-sm text-white"
            >
              Click here
            </Button>
          </Section>
          <Text>
            If the button does not work, copy and paste the link below into your
            browser: {url}
          </Text>
        </Container>
        <Container className="border-subtle border-t border-solid px-8">
          <Text>
            If you did not request this email, please ignore it as nothing will
            be changed.
          </Text>
        </Container>
      </Container>
    </Html>
  </Tailwind>
)

export default ResetPasswordEmail
