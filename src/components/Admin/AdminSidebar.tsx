import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Tags,
  Activity,
  LogOut,
  LifeBuoy,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import LogoB from "../../assets/LogoB.png";
import LogoW from "../../assets/LogoW.png";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin",
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      id: "categories",
      label: "Catégories",
      icon: <Tags size={20} />,
      path: "/admin/categories",
    },
    {
      id: "support",
      label: "Support & FAQ",
      icon: <LifeBuoy size={20} />,
      path: "/admin/support",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={`h-full w-64 flex flex-col transition-all duration-300 ${isDark ? "bg-slate-950/75 backdrop-blur-[40px] border-r border-white/[0.07] text-gray-300" : "bg-white/75 backdrop-blur-[40px] border-r border-white/80 text-gray-700"}`}
      style={{
        boxShadow: isDark
          ? "4px 0 40px rgba(0,0,0,0.4)"
          : "4px 0 40px rgba(100,120,200,0.08)",
      }}
    >
      {/* Brand area */}
      <div
        className={`h-20 flex items-center justify-center px-6 border-b ${isDark ? "border-white/[0.07]" : "border-white/60"}`}
      >
        <img
          src={isDark ? LogoW : LogoB}
          alt="Bookify"
          className="h-9 w-auto object-contain transition-opacity duration-300"
        />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-4 space-y-1.5 scrollbar-hide">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? isDark
                    ? "bg-white/[0.08] text-blue-400"
                    : "bg-blue-500/10 text-blue-600"
                  : isDark
                    ? "hover:bg-white/[0.06] hover:text-white"
                    : "hover:bg-black/[0.04] hover:text-gray-900"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md" />
              )}
              <span
                className={`transition-colors duration-200 ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div
        className={`p-4 mt-auto border-t ${isDark ? "border-white/[0.07]" : "border-white/60"}`}
      >
        <button
          onClick={handleLogout}
          className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
