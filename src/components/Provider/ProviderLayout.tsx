import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

interface ProviderLayoutProps {
  children: React.ReactNode;
}

const ProviderLayout: React.FC<ProviderLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark } = useTheme();
  
  // Progress bar state (La Leayba)
  const [isNavigating, setIsNavigating] = useState(false);

  // Trigger progress bar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Transient progress bar animation triggered by route change
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Determine active section from pathname
  const activeSectionMap: Record<string, string> = {
    '/Home-Provider': 'homep',
    '/Dashboard-Provider': 'dashboardp',
    '/Mes-Rendez-Vous-Provider': 'mes-rendez-vous',
    '/Profils-Provider': 'profils',
    '/Disponibilites-Provider': 'disponibilites',
    '/Mes-Services-Provider': 'services',
    '/Mes-Clients-Provider': 'clients',
    '/Messages': 'messages',
    '/Support-Provider': 'support',
  };
  
  const activeSection = activeSectionMap[location.pathname] || 'homep';

  const [userName] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.nomComplet || u.nom || u.prenom || "Prestataire";
      }
    } catch { /* ignore */ }
    return "Prestataire";
  });

  return (
    <div className={`relative min-h-screen font-sans transition-colors duration-500 ease-in-out flex bg-dot-pattern ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      
      <style>{`
        /* Keep glass card style in case it's used somewhere else */
        .glass-card {
          background: ${isDark ? 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))' : 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95))'} !important;
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.9)'} !important;
          box-shadow: ${isDark ? '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)'} !important;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .glass-card:hover {
          transform: translateY(-6px);
          box-shadow: ${isDark ? '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 24px 60px rgba(26,111,209,0.25), inset 0 1px 0 rgba(255,255,255,1)'} !important;
          border-color: ${isDark ? 'rgba(26,111,209,0.45)' : 'rgba(26,111,209,0.4)'} !important;
        }
      `}</style>
      
      {/* Top Loading Bar (La Leayba) */}
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
      
      {/* Sidebar Overlay (Mobile / Collapsed Drawer) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-screen w-64 transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Navbar 
          activeSection={activeSection} 
          onSectionChange={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10">
        <TopBar 
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
        
        <Footer />
      </main>
    </div>
  );
};

export default ProviderLayout;
