import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, Search, Bell, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getNotifications, markAsRead } from "../../services/Client/notificationService";
import type { Notification as AppNotification } from "../../services/Client/notificationService";
import { motion, AnimatePresence } from "framer-motion";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";

import { useUnreadMessages } from "../../hooks/useUnreadMessages";

export interface TopBarProps {
  userName?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  userName = "",
  onMenuToggle,
  isMobileMenuOpen = false
}) => {
  const { isDark, toggleTheme, theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const unreadMessagesCount = useUnreadMessages();

  const defaultUserName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.nomComplet || u.nom ||  '';
    } catch { return ''; }
  })();
  
  const actualUserName = userName || defaultUserName;
  const firstName = actualUserName ? actualUserName.split(' ')[0] : "Client";

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

  // Dynamic Page Title Mapping
  const pageTitles: Record<string, string> = {
    '/Home-Client': `Bonjour ${firstName}`,
    '/Dashboard-Client': 'Mon Espace',
    '/Mes-Rendez-Vous': 'Mes Rendez-vous',
    '/Profils': 'Mon Profil',
    '/Portefeuille': 'Mon Portefeuille',
    '/Favoris': 'Mes Favoris',
    '/Avis': 'Mes Avis',
    '/Messages': 'Mes Messages',
  };
  const pageTitle = pageTitles[location.pathname] ?? `Bonjour ${firstName}`;

  const [openNotif, setOpenNotif] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.avatar || null;
    } catch { return null; }
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.email || '';
    } catch { return ''; }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setAvatarSrc(u.avatar || null);
      } catch { setAvatarSrc(null); }
    };
    window.addEventListener('avatarUpdated', sync);
    return () => window.removeEventListener('avatarUpdated', sync);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const notifs = await getNotifications();
        if (isMounted) setNotifications(notifs);
      } catch (err) { console.log('error: ', err); }
      finally { if (isMounted) setNotifLoading(false); }
    };
    
    // Initial fetch
    setNotifLoading(true);
    fetchNotifs();

    // Poll every 10 seconds
    const intervalId = setInterval(fetchNotifs, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchData = [
    { id: 1, type: "service", label: "Dentiste" },
    { id: 2, type: "service", label: "Plombier" },
    { id: 3, type: "provider", label: "Dr. Youssef Alami" },
    { id: 4, type: "provider", label: "Coiffeur Casablanca" }
  ];

  const filteredResults = searchData.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setOpenNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setOpenAvatar(false);
    };
    if (openAvatar) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openAvatar]);

  const getInitials = (name: string) => {
    if (!name) return "C";
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <>
    <header className="
      bg-white/70 dark:bg-[#0f1117]/60 backdrop-blur-xl
      border-b border-gray-200/80 dark:border-[#2d3148]
      shadow-[0_2px_16px_-4px_rgba(26,111,209,0.1)] dark:shadow-[0_2px_16px_-4px_rgba(0,0,0,0.4)]
      px-4 sm:px-6 h-16 sticky top-0 z-30
      transition-colors duration-200
      flex items-center justify-between
    ">
      {/* Dynamic Style injection for dot pattern and clean transitions */}
      <style>{`
        .glass-dropdown {
          background: ${theme === 'dark' ? 'rgba(26, 29, 39, 0.85)' : 'rgba(255, 255, 255, 0.85)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${theme === 'dark' ? 'rgba(45, 49, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
        }
      `}</style>

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="hidden md:flex p-2 rounded-xl bg-gray-50/50 dark:bg-[#1a1d27]/40 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#2d3148]/50 text-gray-700 dark:text-gray-400 transition-all cursor-pointer relative"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0f1117] rounded-full shadow-sm" />
          )}
        </button>
        
        {/* Mobile Logo */}
        <div className="block md:hidden">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="Bookify"
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Desktop Page Title */}
        <h2
          className={`hidden md:block font-fraunces text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'md:opacity-0 lg:opacity-100' : 'opacity-100'
          }`}
        >
          {pageTitle}
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Search Input with Premium Glassmorphism styling */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-[#1a1d27]/40 backdrop-blur-sm rounded-xl border border-white/60 dark:border-[#2d3148] relative transition-colors focus-within:border-[#1A6FD1]/50">
          <Search size={14} className="text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Rechercher des services, prestataires..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenSearch(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim() !== '') {
                navigate(`/Explore?q=${encodeURIComponent(search)}`);
                setOpenSearch(false);
              }
            }}
            className="bg-transparent outline-none text-xs w-48 md:w-64 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 font-medium"
          />
          {/* Badge ⌘K */}
          <div className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-white/10 text-[9px] text-gray-500 dark:text-gray-400 font-bold tracking-widest">
            ⌘K
          </div>

          {/* Search Dropdown with Motion and Glassmorphism */}
          <AnimatePresence>
            {openSearch && search && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-11 right-0 w-full glass-dropdown rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                {filteredResults.length === 0 ? (
                  <div className="p-4 text-xs text-gray-500 dark:text-gray-400 text-center font-medium">Aucun résultat</div>
                ) : (
                  filteredResults.map(item => (
                    <div
                      key={item.id}
                      className="px-4 py-3 text-xs font-semibold cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex justify-between items-center transition-colors border-b border-gray-100/30 dark:border-white/5 last:border-0"
                      onClick={() => { setOpenSearch(false); setSearch(""); }}
                    >
                      <span>{item.label}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded bg-gray-100/50 dark:bg-white/5 border border-gray-200/20 dark:border-white/5">{item.type}</span>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Icons Group */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-50/50 dark:bg-[#1a1d27]/40 border border-white/60 dark:border-[#2d3148] hover:bg-gray-100 dark:hover:bg-[#2d3148]/50 rounded-xl text-gray-500 dark:text-gray-400 transition-all cursor-pointer"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="p-2 bg-gray-50/50 dark:bg-[#1a1d27]/40 border border-white/60 dark:border-[#2d3148] hover:bg-gray-100 dark:hover:bg-[#2d3148]/50 rounded-xl relative text-gray-500 dark:text-gray-400 transition-all cursor-pointer"
            >
              <Bell size={16} />
              {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-[#0059B2] rounded-full shadow-[0_0_8px_#0059B2]" />}
            </button>

            {/* Notification Dropdown with Motion and Glassmorphism */}
            <AnimatePresence>
              {openNotif && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 glass-dropdown rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 font-bold border-b border-gray-100/50 dark:border-white/5 text-gray-900 dark:text-white text-sm font-fraunces">
                    Notifications
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                          <Bell className="text-[#0059B2] dark:text-blue-400" size={20} />
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs">Aucune notification</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Vous êtes à jour !</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={async () => {
                            if (!n.isRead) {
                              await markAsRead(n.id);
                              setNotifications(prev => prev.map(t => t.id === n.id ? { ...t, isRead: true } : t));
                            }
                            setOpenNotif(false);
                            setSelectedNotif(n);
                          }}
                          className={`px-4 py-3 text-xs cursor-pointer transition-colors border-b border-gray-100/30 dark:border-white/5 last:border-0
                              ${!n.isRead
                              ? 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20'
                              : 'hover:bg-white/40 dark:hover:bg-white/5'
                            }`}
                        >
                          <p className="font-bold text-gray-800 dark:text-gray-200">{n.title}</p>
                          <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>

        {/* Avatar Dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => { setOpenAvatar(!openAvatar); setOpenNotif(false); }}
            className="flex items-center gap-2.5 hover:opacity-95 transition-all pl-1 cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0 border border-white/20"
              style={{ background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #004a96, #1A6FD1)' }}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                : getInitials(actualUserName)
              }
            </div>
            <span className="hidden sm:block text-xs font-bold text-gray-700 dark:text-gray-200">{firstName}</span>
            <ChevronDown
              size={13}
              className={`text-gray-500 dark:text-gray-400 hidden sm:block transition-transform duration-200 ${openAvatar ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Avatar Menu with Motion and Glassmorphism */}
          <AnimatePresence>
            {openAvatar && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 glass-dropdown rounded-2xl shadow-2xl py-1.5 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-200/50 dark:border-white/5 flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-200 truncate">{actualUserName || 'Client'}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{userEmail || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setOpenAvatar(false); navigate("/Profils"); }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <User size={14} className="text-gray-500 dark:text-gray-400" />
                    Profil
                  </button>
                </div>

                <div className="border-t border-gray-200/50 dark:border-white/5 pt-1 mt-1">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-xs font-bold hover:bg-white/40 dark:hover:bg-white/5 transition-colors text-red-500 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      </header>

      {/* MODAL NOTIFICATION DETAILS */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setSelectedNotif(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#151B2B] rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-[#2d3148]" 
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Bell size={18} className="text-[#0059B2] dark:text-blue-400" />
                </div>
                <button onClick={() => setSelectedNotif(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#2d3148]/50 rounded-xl transition-all cursor-pointer text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              {/* Content */}
              <h3 className="text-base font-bold font-fraunces text-gray-900 dark:text-white mb-2">{selectedNotif.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">{selectedNotif.message}</p>
              {/* Details */}
              <div className="bg-gray-50 dark:bg-[#0f1117] border border-gray-100 dark:border-[#2d3148]/50 rounded-2xl p-4 mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Date</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {new Date(selectedNotif.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {selectedNotif.rendezVousId && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Rendez-vous #</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedNotif.rendezVousId}</span>
                  </div>
                )}
              </div>
              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { 
                    setSelectedNotif(null); 
                    if (selectedNotif.title.includes("Message")) {
                      navigate('/Messages');
                    } else {
                      navigate('/Mes-Rendez-Vous'); 
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white rounded-2xl text-xs font-bold transition-all hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer text-center flex justify-center items-center"
                >
                  {selectedNotif.title.includes("Message") ? "Aller à la messagerie" : "Voir les détails du rendez-vous"}
                </button>
                <button
                  onClick={() => { setSelectedNotif(null); }}
                  className="w-full py-3 bg-transparent text-gray-600 dark:text-gray-400 rounded-2xl text-xs font-semibold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopBar;