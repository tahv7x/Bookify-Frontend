import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  Users,
  Tags,
  LifeBuoy,
  Activity,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence, type Variants } from "framer-motion";

export interface AdminTopBarProps {
  userName?: string;
  userAvatar?: string | null;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({
  userName = "Administrateur",
  userAvatar = null,
  onMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const pageConfig: Record<
    string,
    { title: string; subtitle: string; icon: React.ElementType }
  > = {
    "/admin": {
      title: "Dashboard",
      subtitle: "Vue d'ensemble de la plateforme",
      icon: LayoutDashboard,
    },
    "/admin/users": {
      title: "Utilisateurs",
      subtitle: "Gestion des comptes et accès",
      icon: Users,
    },
    "/admin/categories": {
      title: "Catégories",
      subtitle: "Services proposés sur la plateforme",
      icon: Tags,
    },
    "/admin/support": {
      title: "Support & FAQ",
      subtitle: "Tickets d'assistance et FAQ",
      icon: LifeBuoy,
    },
    "/admin/logs": {
      title: "Logs & Monitoring",
      subtitle: "Surveillance et activité système",
      icon: Activity,
    },
  };
  const currentPage = pageConfig[location.pathname] ?? {
    title: `Bonjour ${userName}`,
    subtitle: "Espace administrateur",
    icon: LayoutDashboard,
  };
  const PageIcon = currentPage.icon;

  const [openAvatar, setOpenAvatar] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setOpenAvatar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      filter: "blur(4px)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <header
      className="
      backdrop-blur-[28px]
      border-b
      px-4 sm:px-6 py-4 sticky top-0 z-30
      transition-colors duration-500
      font-poppins
    "
      style={{
        background: isDark
          ? "rgba(15, 23, 42, 0.65)"
          : "rgba(255, 255, 255, 0.45)",
        borderColor: isDark
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(200, 215, 255, 0.4)",
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* LEFT */}
        <div className="flex items-center gap-5 relative z-50">
          <button
            onClick={onMenuToggle}
            className={`p-2.5 lg:hidden rounded-2xl border shadow-sm transition-all duration-300 relative flex items-center justify-center ${
              isMobileMenuOpen
                ? "bg-[#0059B2] border-[#0059B2] text-white shadow-blue-500/20 shadow-lg rotate-90"
                : "bg-white/50 dark:bg-[#1A1D24]/50 border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1A1D24] hover:shadow-md hover:scale-105"
            }`}
          >
            {isMobileMenuOpen ? (
              <X size={22} className="-rotate-90" />
            ) : (
              <Menu size={22} />
            )}
          </button>

          <div className="flex flex-col justify-center">
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1">
              <span>Admin</span>
              <ChevronRight size={11} />
              <span className="text-blue-500 dark:text-blue-400">
                {currentPage.title}
              </span>
            </div>
            {/* Title row */}
            <div className="flex items-center gap-2.5">
              <div
                className={`hidden sm:flex w-8 h-8 rounded-xl items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-blue-500/10" : "bg-blue-50"
                }`}
              >
                <PageIcon size={16} className="text-blue-500" />
              </div>
              <div>
                <h2
                  className="text-lg sm:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {currentPage.title}
                </h2>
                <p className="hidden sm:block text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                  {currentPage.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
          >
            {isDark ? (
              <Sun size={20} strokeWidth={2.5} />
            ) : (
              <Moon size={20} strokeWidth={2.5} />
            )}
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setOpenAvatar(!openAvatar)}
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white dark:border-[#111318]"
                />
              ) : (
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.1)] cursor-pointer flex-shrink-0 border-2 border-white dark:border-[#111318]"
                  style={{
                    background: "linear-gradient(135deg,#0059B2,#1A6FD1)",
                  }}
                >
                  {getInitials(userName)}
                </div>
              )}
              <ChevronDown
                size={16}
                strokeWidth={3}
                className={`text-gray-400 dark:text-gray-500 hidden sm:block transition-transform duration-300 ${openAvatar ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {openAvatar && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-3 w-64 backdrop-blur-[28px] rounded-3xl z-50 overflow-hidden p-2"
                  style={{
                    background: isDark
                      ? "rgba(15, 23, 42, 0.85)"
                      : "rgba(255, 255, 255, 0.85)",
                    border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(200, 215, 255, 0.6)"}`,
                    boxShadow: isDark
                      ? "0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
                      : "0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)",
                  }}
                >
                   <div className="px-4 py-4 border-b border-gray-100/50 dark:border-white/5 flex items-center gap-3 mb-2">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                        style={{
                          background: "linear-gradient(135deg,#0059B2,#1A6FD1)",
                        }}
                      >
                        {getInitials(userName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {userName}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                        Admin
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-3 mt-1"
                    >
                      <LogOut size={18} /> Se déconnecter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
