import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { tv } from "@nextui-org/react";

const page = tv({
  slots: {
    container: "flex flex-col gap-12",
    stepWrapper: "flex gap-6",
    stepNumber:
      "text-2xl font-semibold bg-content3 rounded-full w-12 h-12 flex justify-center items-center",
    stepTitle: "text-3xl font-bold",
    stepContent: "flex flex-col gap-6",
  },
  variants: {
    debug: {
      true: {
        stepWrapper: "bg-red-800",
      },
    },
  },
});
export default function Page() {
  const slots = page({ debug: false });

  return (
    <div className={slots.container()}>
      <div className={slots.stepWrapper()}>
        <span className={slots.stepNumber()}>1</span>
        <div className={slots.stepContent()}>
          <h2 className={slots.stepTitle()}>ID na MangaDex</h2>
          <div className="flex gap-4">
            <Input
              classNames={{ inputWrapper: "h-fit" }}
              placeholder="93c8f7f8-58cc-40fe-9146-3f68cbfc71af"
            />
            <Button className="font-medium" color="primary">
              Importar
            </Button>
          </div>
        </div>
      </div>
      <div className={slots.stepWrapper()}>
        <span className={slots.stepNumber()}>2</span>
        <div className={slots.stepContent()}>
          <h2 className={slots.stepTitle()}>Recuperando as informações...</h2>
          <div>Azerty</div>
        </div>
      </div>
      <div className={slots.stepWrapper()}>
        <span className={slots.stepNumber()}>3</span>
        <div className={slots.stepContent()}>
          <h2 className={slots.stepTitle()}>Criando a página...</h2>
          <div>Azerty</div>
        </div>
      </div>
      <div className={slots.stepWrapper()}>
        <span className={slots.stepNumber()}>4</span>
        <div className={slots.stepContent()}>
          <h2 className={slots.stepTitle()}>Upando as covers...</h2>
          <div>Azerty</div>
        </div>
      </div>
      <div className={slots.stepWrapper()}>
        <span className={slots.stepNumber()}>5</span>
        <div className={slots.stepContent()}>
          <h2 className={slots.stepTitle()}>Upando os banners...</h2>
          <div>Azerty</div>
        </div>
      </div>
    </div>
  );
}
