import { BR, FR, US } from "country-flag-icons/react/3x2"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { setLocale } from "~/actions/set-locale"
import { LanguagesIcon } from "~/components/icons/languages-icon"
import { MoonIcon } from "~/components/icons/moon-icon"
import { SunIcon } from "~/components/icons/sun-icon"
import { SunMoonIcon } from "~/components/icons/sun-moon-icon"
import { DropdownMenuSubContent } from "~/components/ui/dropdown"
import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown"

export const SidebarDropdownCommonContent = () => {
  const locale = useLocale()
  const { systemTheme, theme, setTheme } = useTheme()
  const t = useTranslations("global")

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
    </>
  )
}
