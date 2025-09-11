import { ContentRating } from "@prisma/client"
import { useMutation } from "@tanstack/react-query"
import { BR, FR, US } from "country-flag-icons/react/3x2"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { setLocale } from "~/actions/set-locale"
import { LanguagesIcon } from "~/components/icons/languages-icon"
import { MoonIcon } from "~/components/icons/moon-icon"
import { SettingsIcon } from "~/components/icons/settings-icon"
import { SunIcon } from "~/components/icons/sun-icon"
import { SunMoonIcon } from "~/components/icons/sun-moon-icon"
import {
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown"
import { siteConfig } from "~/site-config"
import { useAuth } from "~/stores/auth.store"
import { useTRPC } from "~/utils/trpc/react"

export const NavbarCommonContent = () => {
  const locale = useLocale()
  const { systemTheme, theme, setTheme } = useTheme()
  const { session, settings, updateSettings } = useAuth()
  const t = useTranslations("global")
  const trpc = useTRPC()
  const { mutate: updateSettingsMutation } = useMutation(
    trpc.users.updateSettings.mutationOptions(),
  )
  const cookieConfig = siteConfig.settings.cookie

  const handleContentRatingChange =
    (contentRating: ContentRating) => (checked: boolean) => {
      const newContentRating = checked
        ? [...settings.contentRating, contentRating]
        : settings.contentRating.filter((c) => c !== contentRating)

      updateSettings({ contentRating: newContentRating })

      if (session && contentRating !== "NSFW") {
        updateSettingsMutation({ contentRating: newContentRating })
      }

      if (contentRating !== "NSFW") {
        document.cookie = `${cookieConfig.name}=${JSON.stringify({ ...settings, contentRating: newContentRating })}; path=/; max-age=${cookieConfig.maxAge}`
      }
    }

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger animatedIcon={LanguagesIcon}>
          {t("language.title")}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={locale} onValueChange={setLocale}>
              <DropdownMenuRadioItem value="en">
                <US />
                {t("language.en")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pt">
                <BR />
                {t("language.pt")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="fr">
                <FR />
                {t("language.fr")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger animatedIcon={SunMoonIcon}>
          {t("theme.title")}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem
                className="[&>div>svg]:text-yellow-500 data-[light=false]:[&>div>svg]:text-zinc-500"
                animatedIcon={systemTheme === "light" ? SunIcon : MoonIcon}
                value="system"
                data-light={systemTheme === "light"}
              >
                {t("theme.system")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                className="[&>div>svg]:text-zinc-500"
                animatedIcon={MoonIcon}
                value="dark"
              >
                {t("theme.dark")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                className="[&>div>svg]:text-yellow-500"
                animatedIcon={SunIcon}
                value="light"
              >
                {t("theme.light")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger animatedIcon={SettingsIcon}>
          Filtro de conteúdo
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {Object.values(ContentRating).map((contentRating) => (
              <DropdownMenuCheckboxItem
                key={contentRating}
                checked={settings.contentRating?.includes(contentRating)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={handleContentRatingChange(contentRating)}
              >
                {contentRating}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </>
  )
}
