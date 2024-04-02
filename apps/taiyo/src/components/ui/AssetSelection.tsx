import { tv } from "@nextui-org/react"
import Image from "next/image"

type Props = {
  type: "image" | "folder"
  isCompact?: boolean
}

const imageSelection = tv({
  slots: {
    container: "my-8 flex w-full flex-col items-center justify-center gap-16",
    illustration: "h-auto w-2/4",
    contentWrapper: "text-center",
  },
  variants: {
    isCompact: {
      true: {
        container: "my-12",
        illustration: "hidden",
      },
    },
  },
})

export const AssetSelection = ({ type, isCompact }: Props) => {
  const { container, illustration, contentWrapper } = imageSelection({
    isCompact,
  })

  const illustrationSrc =
    type === "image"
      ? "/illustrations/asset_selection.svg"
      : "/illustrations/folder_selection.svg"

  return (
    <div className={container()}>
      <Image
        src={illustrationSrc}
        width={0}
        height={0}
        sizes="1"
        className={illustration()}
        alt="asset selection"
      />
      <div className={contentWrapper()}>
        {type === "image" ? (
          <>
            <p>Nenhuma imagem selecionada.</p>
            <p>Arreste-as nesta zona ou clique para selecioná-las.</p>
          </>
        ) : (
          <>
            <p>Nenhuma pasta selecionada.</p>
            <p>Clique para selecioná-la.</p>
          </>
        )}
      </div>
    </div>
  )
}
