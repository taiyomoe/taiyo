import { getTranslations } from "next-intl/server"
import { GoBackButton } from "./_components/go-back-button"

export default async function NotFound() {
  const t = await getTranslations("notFound")

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center bg-background p-6 md:p-10">
      <span className="-mt-32 absolute select-none font-extrabold text-[150px] text-emphasis tracking-wider opacity-20 md:text-[300px] lg:text-[400px] xl:text-[500px]">
        404
      </span>
      <div className="z-10 mt-14 flex flex-col items-center gap-8 text-center md:mt-36 md:gap-16 lg:mt-56 lg:gap-24">
        <h1 className="font-bold text-3xl md:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-subtle md:text-lg">{t("description")}</p>
          <GoBackButton />
        </div>
      </div>
    </div>
  )
}
