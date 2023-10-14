import { Button, ButtonGroup } from "@nextui-org/button";
import { PanelTopIcon, PanelTopInactiveIcon } from "lucide-react";
import { tv } from "tailwind-variants";

const readerSidebarSettingsNavbarMode = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsNavbarMode = () => {
  const { container, text, leftButton, rightButton } =
    readerSidebarSettingsNavbarMode();

  return (
    <div className={container()}>
      <p className={text()}>Modo da navbar</p>
      <ButtonGroup fullWidth radius="sm">
        <Button
          className={leftButton()}
          startContent={<PanelTopIcon size={20} />}
          color="primary"
          radius="sm"
          isDisabled
        >
          Sempre
        </Button>
        <Button
          className={rightButton()}
          endContent={<PanelTopInactiveIcon size={20} />}
          radius="sm"
          isDisabled
        >
          Foco
        </Button>
      </ButtonGroup>
    </div>
  );
};
