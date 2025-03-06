import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import type { LayoutProps } from "~/utils/types"

export default async function Layout({ children }: LayoutProps) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
