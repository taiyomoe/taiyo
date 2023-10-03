import ThemeSwitch from "../../../components/ui/ThemeSwitch";

export const runtime = "edge";

export default function SettingsPage() {
  return (
    <main className="flex h-full flex-col p-6">
      <span>Settings</span>
      <ThemeSwitch />
    </main>
  );
}
