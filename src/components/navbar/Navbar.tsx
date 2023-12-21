"use client";

import Link from "next/link";
import { Chip } from "@nextui-org/react";
import { tv } from "tailwind-variants";

import { UserLibrary } from "~/components/library/UserLibrary";
import { MediaSearch } from "~/components/navbar/search/MediaSearch";
import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { useChapterNavbar } from "~/hooks/useChapterNavbar";
import { useDevice } from "~/hooks/useDevice";

import { NavbarBorder } from "./NavbarBorder";
import { ReaderSidebarOpenButton } from "./ReaderSidebarOpenButton";

const navbar = tv({
  slots: {
    container:
      "h-navbar max-h-navbar w-full flex flex-col justify-center z-20 group child:relative",
    contentWrapper:
      "items-center px-bodyPadding flex grow justify-between bg-background transition-all",
    brandContainer: "flex items-center gap-2 select-none",
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
      fixed: {},
      sticky: {
        container: "sticky top-0",
      },
      hover: {
        container: "fixed top-0 child:-top-navbar",
        contentWrapper: "group-hover:top-0",
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
  const { isAboveTablet } = useDevice();

  console.log("navbar", mode, sidebarSide, expand);

  const slots = navbar({ sidebarSide, mode, expand });

  return (
    <div className={slots.container()}>
      <nav className={slots.contentWrapper()}>
        <Link href="/" className={slots.brandContainer()}>
          <CompanyLogo company="taiyo" width={35} priority />
          {isAboveTablet && (
            <>
              <p className={slots.brandText()}>Taiyō</p>
              <Chip color="primary" size="sm">
                ALPHA
              </Chip>
            </>
          )}
        </Link>
        <div className={slots.endContentContainer()}>
          <MediaSearch />
          <UserLibrary />
          {popover}
          <ReaderSidebarOpenButton />
        </div>
      </nav>
      <NavbarBorder />
    </div>
  );
};
