import { Link, useLocation } from "react-router";
import SidebarItem from "./ui/sidebar-item";
import { List, FileUser, LayersPlus } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigation = [
    {
      text: "Orders",
      icon: <List className="mr-2" size={18} />,
      path: "/orders",
    },
    {
      text: "Import CSV",
      icon: <FileUser className="mr-2" size={18} />,
      path: "/upload",
    },
    {
      text: "Manual Create",
      icon: <LayersPlus className="mr-2" size={18} />,
      path: "/create-order",
    },
  ];

  return (
    <aside className="w-64 bg-[var(--card)] border-r-2 border-[var(--main-border)] p-6 flex flex-col gap-2">
      <nav className="flex flex-col gap-1">
        {navigation &&
          navigation.map((el) => (
            <SidebarItem key={el.text} active={location.pathname === el.path}>
              <Link className="flex text-end x" to={el.path}>
                {el.icon}
                {el.text}
              </Link>
            </SidebarItem>
          ))}
      </nav>
    </aside>
  );
}
