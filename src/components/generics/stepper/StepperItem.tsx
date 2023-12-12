import { tv } from "@nextui-org/react";

type Props = {
  number: number;
  title: string;
  content?: React.ReactNode;
  children?: React.ReactNode;
};

const stepperItem = tv({
  slots: {
    container: "flex gap-6",
    number:
      "flex flex-col items-center bg-content3 rounded-full !w-12 !h-12 text-2xl font-semibold flex justify-center items-center",
    title: "text-3xl font-bold mt-1.5",
    content: "flex flex-col gap-6 w-full",
  },
});

export const StepperItem = (props: Props) => {
  const { number, title, content, children } = props;
  const slots = stepperItem();

  return (
    <div className={slots.container()}>
      <div>
        <span className={slots.number()}>{number}</span>
      </div>
      <div className={slots.content()}>
        <h2 className={slots.title()}>{title}</h2>
        {content ?? children}
      </div>
    </div>
  );
};
