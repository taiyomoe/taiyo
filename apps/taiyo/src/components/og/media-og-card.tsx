import { ChaptersService, MediasService } from "@taiyomoe/services"
import { CoverUtils, MediaUtils } from "@taiyomoe/utils"
import { GENRES_PT } from "@taiyomoe/utils/i18n"
import { ImageResponse } from "next/og"
import { OGUtils } from "~/utils/og.utils"
import { DefaultOGCard } from "./default-og-card"

type Props = {
  mediaId: string
}

export const MediaOGCard = async ({ mediaId }: Props) => {
  const media = await MediasService.getFull(mediaId)
  const chaptersCount = await ChaptersService.getDistinctCount(mediaId)
  const hasDates = media?.startDate !== null || media?.endDate !== null

  if (!media) {
    return DefaultOGCard
  }

  return new ImageResponse(
    <div tw="flex w-full h-full flex-row" style={{ fontFamily: '"Inter"' }}>
      <img
        src={CoverUtils.getUrl({ id: mediaId, ...media })}
        tw="absolute z-0 -top-[150px] -left-[150px] w-[1150px] h-[1000px]"
        style={{ objectFit: "cover", filter: "blur(20px)" }}
        alt="Media's cover"
      />
      <div tw="flex w-full bg-black/60 text-white">
        <div tw="flex grow p-8 flex-col justify-between max-w-[750px]">
          <div tw="flex flex-col">
            <p
              style={{
                fontSize: "3.5rem",
                fontWeight: 700,
                lineClamp: 2,
                WebkitLineClamp: 2,
                textOverflow: "ellipsis",
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
              }}
            >
              {MediaUtils.getMainTitle(media.titles, "en")}
            </p>
            <div tw="flex">
              {media.startDate && !media.endDate && (
                <p tw="m-0">{media.startDate.getFullYear()}</p>
              )}
              {media.startDate && media.endDate && (
                <p tw="m-0">{`${media.startDate.getFullYear()} até ${media.endDate.getFullYear()}`}</p>
              )}
              {hasDates && <span tw="mx-2">—</span>}
              {chaptersCount > 0 && (
                <p tw="m-0">{`${chaptersCount} capítulos`}</p>
              )}
            </div>
          </div>
          <div tw="flex flex-col">
            <div tw="flex flex-wrap mb-4">
              {media.genres.map((g) => (
                <p
                  key={g}
                  tw="m-0 px-3 py-1.5 rounded-full bg-zinc-700 font-medium mr-2 mb-2 uppercase text-lg"
                >
                  {GENRES_PT[g]}
                </p>
              ))}
            </div>
            <div tw="flex items-center">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: the title will appear in the image */}
              <svg
                width="408"
                height="269"
                viewBox="0 0 408 269"
                style={{
                  height: 64,
                  width: 96,
                  marginRight: 16,
                }}
              >
                <path
                  d="M204 249C189 234.5 119 195 9.16003 210.951C3.56222 211.742 0 214.904 0 222.019C0.50889 229.135 5.61016 232.401 12.7223 231.506C128 217 180.19 256.195 193 264C198.1 267.764 202.47 268.5 204 268.5C205.53 268.5 209.88 267.764 216 264C228.81 256.195 280 217 395.278 231.506C402.402 232.297 407.491 229.135 408 222.019C408 214.904 404.438 211.742 398.84 210.951C289 195 219 234.5 204 249Z"
                  fill="#FF4F4F"
                />
                <path
                  d="M204 232.106C159.224 168.917 45.5464 169 43.1237 169C40.701 169 24 197.037 24 197.037C159.223 195.232 204 247 204 247C204 247 249.672 195.158 384 197.037C384 197.037 367.299 169 364.876 169C362.454 169 248.776 168.917 204 232.106Z"
                  fill="#FF4F4F"
                />
                <path
                  d="M327.178 146.927C328.376 139.964 329 132.805 329 125.5C329 56.1883 272.812 0 203.5 0C134.188 0 78 56.1883 78 125.5C78 132.805 78.6241 139.964 79.8219 146.927H327.178ZM84.1565 164.434C83.3296 161.898 82.5813 159.326 81.9145 156.722H325.085C324.405 159.381 323.639 162.005 322.792 164.593C319.165 165.145 315.392 165.782 311.51 166.517H96.4898C92.2316 165.711 88.1042 165.022 84.1565 164.434ZM157.413 186.107C149.755 182.292 141.831 179.056 133.893 176.312H274.107C266.169 179.056 258.245 182.292 250.587 186.107H157.413ZM233.618 195.902C222.228 203.52 212.011 212.8 204 224.106C195.989 212.8 185.772 203.52 174.382 195.902H233.618Z"
                  fill="#FF4F4F"
                />
              </svg>
              <p tw="text-4xl font-extrabold tracking-tight">Taiyō</p>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          display: "flex",
          clipPath: "polygon(36px 0px, 100% 0px, 100% 100%, 0px 100%)",
        }}
      >
        <img
          src={CoverUtils.getUrl({ id: mediaId, ...media })}
          height="600"
          width="450"
          alt="Media's cover"
        />
      </div>
    </div>,
    {
      width: 1200,
      height: 600,
      fonts: await OGUtils.getFonts(),
    },
  )
}
