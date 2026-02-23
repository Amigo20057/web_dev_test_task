import { Outlet } from "react-router";
import Header from "../components/header";
import Sidebar from "../components/sidebar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--white-bg)]">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
