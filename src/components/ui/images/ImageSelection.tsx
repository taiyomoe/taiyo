import { tv } from "@nextui-org/react"
import Image from "next/image"

type Props = { isCompact?: boolean }

const imageSelection = tv({
  slots: {
    container: "my-16 flex w-full flex-col items-center justify-center gap-16",
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

export const ImageSelection = ({ isCompact }: Props) => {
  const { container, illustration, contentWrapper } = imageSelection({
    isCompact,
  })

  return (
    <div className={container()}>
      <Image
        src="/illustrations/asset_selection.svg"
        width={0}
        height={0}
        sizes="1"
        className={illustration()}
        alt="asset selection"
      />
      <div className={contentWrapper()}>
        <p>Nenhuma imagem selecionada.</p>
        <p>Arreste-as nesta zona ou clique para selecioná-las.</p>
      </div>
    </div>
  )
}
