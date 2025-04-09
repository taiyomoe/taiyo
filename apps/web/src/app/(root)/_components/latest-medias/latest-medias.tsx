import { getTranslations } from "next-intl/server"
import { LatestMediasCarousel } from "./latest-medias-carousel"

export const LatestMedias = async () => {
  const t = await getTranslations("global")

  return (
    <div>
      <h3 className="font-bold text-2xl">{t("latestMedias")}</h3>
      <LatestMediasCarousel />
    </div>
  )
}
