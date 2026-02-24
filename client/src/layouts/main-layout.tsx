import { Outlet, useNavigate } from "react-router";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { useEffect } from "react";
import useProfile from "../hooks/useProfile";

export default function MainLayout() {
  const { isAuth, isLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth && !isLoading) {
      navigate("/auth/login");
    }
  });

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
