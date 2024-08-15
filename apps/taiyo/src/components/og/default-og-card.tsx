import { ImageResponse } from "next/og"

export const DefaultOGCard = new ImageResponse(
  <div tw="flex p-12 w-full h-full flex-col">
    <p>What are you even doing here? (pfv nao me raskeie)</p>
    <p>
      Whatever, just try visiting with
      <span tw="text-[#FF4F4F] mx-1">&quot;?mediaId=UUID&quot;</span>
      or
      <span tw="text-[#FF4F4F] mx-1">&quot;?chapterId=UUID&quot;</span>
    </p>
  </div>,
  { width: 1200, height: 600 },
)
