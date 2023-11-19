"use client";

import Link from "next/link";
import { tv } from "tailwind-variants";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { useChapterNavbar } from "~/hooks/useChapterNavbar";

import { NavbarBorder } from "./NavbarBorder";
import { ReaderSidebarOpenButton } from "./ReaderSidebarOpenButton";

const navbar = tv({
  slots: {
    container:
      "w-auto bg-background flex flex-col h-navbar justify-center max-h-navbar z-20 transition-all",
    contentWrapper: "items-center px-bodyPadding flex grow justify-between",
    brandContainer: "flex items-center gap-2",
    brandText: "text-xl font-semibold",
    endContentContainer: "flex gap-4",
  },
  variants: {
    sidebarSide: {
      left: {
        container: "pl-readerSidebar",
      },
      right: {
        container: "pr-readerSidebar",
      },
    },
    mode: {
      hover: {},
      sticky: {
        container: "sticky top-0",
      },
    },
    expand: {
      true: {
        container: "!p-0",
      },
    },
  },
});

type Props = {
  popover: JSX.Element;
};

export const Navbar = ({ popover }: Props) => {
  const { mode, sidebarSide, expand } = useChapterNavbar();

  const {
    container,
    contentWrapper,
    brandContainer,
    brandText,
    endContentContainer,
  } = navbar({
    sidebarSide,
    mode,
    expand,
  });

  return (
    <div className={container()}>
      <nav className={contentWrapper()}>
        <Link href="/" className={brandContainer()}>
          <CompanyLogo company="taiyo" width={35} priority />
          <p className={brandText()}>Taiyō</p>
        </Link>
        <div className={endContentContainer()}>
          {popover}
          <ReaderSidebarOpenButton />
        </div>
      </nav>
      <NavbarBorder />
    </div>
  );
};
