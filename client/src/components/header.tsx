import { LayoutPanelLeft } from "lucide-react";
import Search from "./ui/search";

export default function Header() {
  return (
    <header className="w-full h-16 flex items-center justify-between px-8 bg-[var(--card)] border-b-2 border-[var(--main-border)]">
      <h1 className="text-[20px] font-semibold text-[var(--main-txt-color)] flex">
        <LayoutPanelLeft color="blue" className="mr-2" />
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <Search />

        <div className="w-8 h-8 rounded-full bg-gray-300" />
      </div>
    </header>
  );
}
