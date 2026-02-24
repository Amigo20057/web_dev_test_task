import { LayoutPanelLeft, LogOut } from "lucide-react";
import useProfile from "../hooks/useProfile";

export default function Header() {
  const { data, logout } = useProfile();

  return (
    <header className="w-full h-16 flex items-center justify-between px-8 bg-[var(--card)] border-b-2 border-[var(--main-border)]">
      <h1 className="text-[20px] font-semibold text-[var(--main-txt-color)] flex items-center">
        <LayoutPanelLeft color="blue" className="mr-2" />
        Admin Panel
      </h1>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {data?.email ? data.email[0].toUpperCase() : "?"}
          </div>
          <span className="text-sm font-medium text-[var(--main-txt-color)]">
            {data?.email}
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
