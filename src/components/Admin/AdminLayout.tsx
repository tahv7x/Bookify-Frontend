import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark } = useTheme();

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Transient progress bar animation triggered by route change
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const activeSectionMap: Record<string, string> = {
    "/admin": "dashboard",
    "/admin/users": "users",
    "/admin/categories": "categories",
    "/admin/support": "support",
    "/admin/logs": "logs",
  };

  const activeSection = activeSectionMap[location.pathname] || "dashboard";

  const [userName] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.nomComplet || u.nom || "Administrateur";
      }
    } catch { /* ignore */ }
    return "Administrateur";
  });

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-500 ease-in-out flex ${isDark ? "text-gray-200 bg-[#050c1a]" : "text-gray-800 bg-[#eef2ff]"}`}
    >
      <style>{`
        .glass-card {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.62)"} !important;
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)"} !important;
          box-shadow: ${isDark ? "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 8px 40px rgba(80,100,200,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"} !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-3px);
          box-shadow: ${isDark ? "0 20px 50px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)" : "0 20px 50px rgba(80,100,200,0.14), inset 0 1px 0 rgba(255,255,255,1)"} !important;
          border-color: ${isDark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.3)"} !important;
        }
      `}</style>

      {/* Decorative background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-48 -right-24 w-[600px] h-[600px] rounded-full blur-[140px] opacity-60 ${isDark ? "bg-blue-900" : "bg-blue-300"}`}
        />
        <div
          className={`absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full blur-[120px] opacity-50 ${isDark ? "bg-violet-900" : "bg-violet-300"}`}
        />
        <div
          className={`absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-[160px] opacity-30 ${isDark ? "bg-indigo-900" : "bg-indigo-200"}`}
        />
      </div>

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 h-1 z-[100] bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(0,89,178,0.8)]"
          />
        )}
      </AnimatePresence>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10 lg:pl-64">
        <AdminTopBar
          userName={userName}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />

        <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
