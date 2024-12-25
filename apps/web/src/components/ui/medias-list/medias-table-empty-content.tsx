import Image from "next/image"

export const MediasTableEmptyContent = () => (
  <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
    <p className="text-center font-medium text-lg md:text-xl">
      Nenhuma obra encontrada
    </p>
    <Image
      src="/illustrations/no_data.svg"
      width={200}
      height={200}
      alt="Ilustração de documentos vazios"
    />
  </div>
)
