import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, Search, Bell, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getNotifications, markAsRead, deleteNotification } from "../../services/Client/notificationService";
import type { Notification as AppNotification } from "../../services/Client/notificationService";

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
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Najbdo ghir smya lwala
  const firstName = userName ? userName.split(' ')[0] : "Client";

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  
  const pageTitles: Record<string, string> = {
    '/Home-Client': `Bonjour ${firstName}`,
    '/Dashboard-Client': 'Dashboard',
    '/Mes-Rendez-Vous': 'Mes Rendez-vous',
    '/Profils': 'Mon Profil',
  };
  const pageTitle = pageTitles[location.pathname] ?? `Bonjour ${firstName}`;

  const [openNotif, setOpenNotif] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const navigate = useNavigate();
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
    const fetchNotifs = async () => {
      try {
        setNotifLoading(true);
        const notifs = await getNotifications();
        setNotifications(notifs);
      } catch (err) { console.log('error: ', err); }
      finally { setNotifLoading(false); }
    };
    fetchNotifs();
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
    <header className="
      bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-md
      border-b border-gray-200/50 dark:border-white/5
      px-4 sm:px-6 h-14 sticky top-0 z-30
      transition-colors duration-200
      flex items-center justify-between
    ">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md hover:bg-gray-100/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2
          className={`hidden sm:block text-lg font-bold text-gray-900 dark:text-white tracking-tight transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-0 lg:opacity-100' : 'opacity-100'
          }`}
        >
          {pageTitle}
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 dark:bg-[#151B2B]/60 backdrop-blur-sm rounded-md border border-gray-200/50 dark:border-white/10 relative transition-colors focus-within:border-blue-500/50">
          <Search size={14} className="text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search providers, services..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenSearch(true); }}
            className="bg-transparent outline-none text-sm w-48 md:w-64 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {/* Badge ⌘K */}
          <div className="flex items-center justify-center px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-white/10 text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-widest">
            ⌘K
          </div>

          {/* Search Dropdown (GLASSMORPHISM APPLIED) */}
          {openSearch && search && (
            <div className="absolute top-10 right-0 w-full bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl rounded-lg shadow-xl border border-white/50 dark:border-white/10 z-50 overflow-hidden">
              {filteredResults.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Aucun résultat</div>
              ) : (
                filteredResults.map(item => (
                  <div
                    key={item.id}
                    className="px-3 py-2.5 text-sm cursor-pointer hover:bg-white/40 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 flex justify-between items-center transition-colors"
                    onClick={() => { setOpenSearch(false); setSearch(""); }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded bg-gray-100/50 dark:bg-white/5">{item.type}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Icons Group */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="p-1.5 hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-md relative text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Bell size={18} />
              {hasUnread && <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-[#0059B2] rounded-full shadow-[0_0_8px_#0059B2]" />}
            </button>
            {/* Notification Dropdown (GLASSMORPHISM APPLIED) */}
            {openNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 dark:border-white/10 z-50 overflow-hidden">
                <div className="p-4 font-semibold border-b border-gray-200/50 dark:border-white/5 text-gray-900 dark:text-white">
                  Notifications
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
                        <Bell className="text-[#0059B2] dark:text-blue-400" size={20} />
                      </div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Aucune notification</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vous êtes à jour !</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={async() => {
                          if(!n.isRead){
                            await markAsRead(n.id);
                            setNotifications(prev => prev.map(t => t.id === n.id ? { ...t, isRead: true } : t));
                          }
                          setOpenNotif(false);
                          setSelectedNotif(n);
                        }}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b border-gray-100/50 dark:border-white/5 last:border-0
                            ${!n.isRead
                              ? 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20'
                              : 'hover:bg-white/40 dark:hover:bg-white/5'
                            }`}
                      >
                        <p className="font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/10 mx-1"></div>

        {/* Avatar Dropdown */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => { setOpenAvatar(!openAvatar); setOpenNotif(false); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity pl-1"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-xs shadow-sm flex-shrink-0"
              style={{ background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #004a96, #1A6FD1)' }}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                : getInitials(userName)
              }
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{firstName}</span>
            <ChevronDown
              size={14}
              className={`text-gray-500 dark:text-gray-400 hidden sm:block transition-transform duration-200 ${openAvatar ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Avatar Menu (GLASSMORPHISM APPLIED) */}
          {openAvatar && (
            <div className="absolute right-0 mt-3 w-56 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl rounded-xl shadow-2xl border border-white/50 dark:border-white/10 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-200/50 dark:border-white/5 flex items-center gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 truncate">{userName || 'Client'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{userEmail || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { setOpenAvatar(false); navigate("/Profils"); }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                >
                  <User size={15} className="text-gray-500 dark:text-gray-400" />
                  Profil
                </button>
              </div>

              <div className="border-t border-gray-200/50 dark:border-white/5 pt-1 mt-1">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-white/40 dark:hover:bg-white/5 transition-colors text-red-500 dark:text-red-400"
                >
                  <LogOut size={15} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL NOTIFICATION DETAILS */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNotif(null)}>
          <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/50 dark:border-white/10" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Bell size={18} className="text-[#0059B2] dark:text-blue-400" />
              </div>
              <button onClick={() => setSelectedNotif(null)} className="p-1 hover:bg-gray-100/50 dark:hover:bg-white/5 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            {/* Content */}
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{selectedNotif.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedNotif.message}</p>
            {/* Details */}
            <div className="bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/5 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-500">Date</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {new Date(selectedNotif.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </span>
              </div>
              {selectedNotif.rendezVousId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">Rendez-vous #</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{selectedNotif.rendezVousId}</span>
                </div>
              )}
            </div>
            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSelectedNotif(null); navigate('/Mes-Rendez-Vous'); }}
                className="w-full py-2.5 bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] shadow-md shadow-[#1A6FD1]/20"
              >
                Voir les détails
              </button>
              <button
                onClick={() => { setSelectedNotif(null); }}
                className="w-full py-2.5 bg-transparent text-gray-600 dark:text-gray-400 rounded-xl text-sm font-semibold border border-gray-300/50 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;