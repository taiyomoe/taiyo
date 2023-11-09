export type LayoutProps = { children: React.ReactNode };

export type ReaderSettings = {
  sidebarState: "show" | "hide";
  sidebarSide: "left" | "right";
  sidebarOpenMode: "button" | "hover";
  navbarMode: "sticky" | "hover";
  pageMode: "single" | "longstrip";
};
