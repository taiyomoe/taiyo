"use client";

import { Button } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  const renderButtonIcon = () => {
    switch (theme) {
      case "system":
        return <ComputerIcon size={16} />;
      case "dark":
        return <MoonIcon size={16} />;
      case "light":
        return <SunIcon size={16} />;
    }
  };

  const renderButtonContent = () => {
    switch (theme) {
      case "system":
        return "Sistema";
      case "dark":
        return "Escuro";
      case "light":
        return "Branco";
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className="text-small px-3"
          variant="solid"
          startContent={renderButtonIcon()}
        >
          {renderButtonContent()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu selectionMode="single">
        <DropdownItem value="system" onPress={() => setTheme("system")}>
          System
        </DropdownItem>
        <DropdownItem value="dark" onPress={() => setTheme("dark")}>
          Dark
        </DropdownItem>
        <DropdownItem value="light" onPress={() => setTheme("light")}>
          Light
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ThemeSwitch;
