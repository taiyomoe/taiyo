import Image from "next/image";

export const ImageSelection = () => {
  return (
    <div className="my-16 flex w-full flex-col items-center justify-center gap-16">
      <Image
        src="/illustrations/asset_selection.svg"
        width={0}
        height={0}
        sizes="1"
        className="h-auto w-2/4"
        alt="asset selection"
      />
      <div className="text-center">
        <p>Nenhuma imagem selecionada.</p>
        <p>Arreste-as nesta zona ou clique para selecioná-las.</p>
      </div>
    </div>
  );
};
