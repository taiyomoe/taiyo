import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Providers } from "~/app/_components/providers"
import { AuthStoreProvider } from "~/stores/auth.store"
import { cn } from "~/utils/cn"
import { getSession } from "~/utils/get-session"
import type { LayoutProps } from "~/utils/types"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default async function Layout({ children }: LayoutProps) {
  const locale = await getLocale()
  const messages = await getMessages()
  const session = await getSession()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "scrollbar-thin scrollbar-thumb-brand scrollbar-track-subtle overflow-y-auto bg-default text-default antialiased",
          inter.className,
        )}
      >
        <ThemeProvider attribute="class">
          <NextIntlClientProvider messages={messages}>
            <AuthStoreProvider value={session}>
              <NuqsAdapter>
                <Providers>{children}</Providers>
              </NuqsAdapter>
            </AuthStoreProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
