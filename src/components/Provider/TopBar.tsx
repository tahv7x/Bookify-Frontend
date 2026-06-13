import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, Bell, Moon, Sun, Menu, X, CheckCircle2, Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useUnreadMessages } from "../../hooks/useUnreadMessages";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import api from "../../services/api";

export interface TopBarProps {
  userName?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  rendezVousId?: number;
}

const TopBar: React.FC<TopBarProps> = ({
  userName = "",
  onMenuToggle,
  isMobileMenuOpen = false
}) => {
  const { isDark, toggleTheme } = useTheme();
  const unreadMessagesCount = useUnreadMessages();
  const location = useLocation();
  const navigate = useNavigate();

  const firstName = userName.split(' ')[0];
  const pageTitles: Record<string, string> = {
    '/Home-Provider': `Acceuil`,
    '/Dashboard-Provider': 'Dashboard',
    '/Mes-Rendez-Vous-Provider': 'Mes Rendez-vous',
    '/Profils-Provider': 'Mon Profil',
    '/Disponibilites-Provider': 'Disponibilités',
    '/Mes-Services-Provider': 'Mes Services',
    '/Messages': 'Messages',
  };
  const pageTitle = pageTitles[location.pathname] ?? `Bonjour ${userName}`;

  const pageSubtitles: Record<string, string> = {
    '/Home-Provider': "Voici ce qui se passe aujourd'hui",
    '/Dashboard-Provider': "Analysez vos performances en temps réel",
    '/Mes-Rendez-Vous-Provider': "Gérez votre planning et vos clients",
    '/Profils-Provider': "Personnalisez votre vitrine professionnelle",
    '/Disponibilites-Provider': "Définissez vos horaires de travail",
    '/Mes-Services-Provider': "Gérez les prestations de votre catalogue",
    '/Messages': "Échangez avec vos clients",
  };
  const pageSubtitle = pageSubtitles[location.pathname] ?? "Bienvenue sur votre espace Bookify";

  const [openNotif, setOpenNotif] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const res = await api.get('/Notifications');
      setNotifications(res.data);
    } catch {
      // silently fail
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notif: Notification) => {
    if (notif.isRead) return;
    try {
      await api.put(`/Notifications/${notif.id}/read`);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const deleteNotif = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    try {
      await api.delete(`/Notifications/${notif.id}`);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    try {
      await Promise.all(unread.map(n => api.put(`/Notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const [avatarSrc, setAvatarSrc] = useState<string | null>(
    () => localStorage.getItem('userAvatar')
  );
  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.email || '';
    } catch { return ''; }
  });

  useEffect(() => {
    const sync = () => {
      setAvatarSrc(localStorage.getItem('userAvatar'));
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        setUserEmail(u.email || '');
      } catch { /* ignore */ }
    };
    window.addEventListener('avatarUpdated', sync);
    return () => window.removeEventListener('avatarUpdated', sync);
  }, []);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);


  const getTimeAgo = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Hier" : `Il y a ${days} jours`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setOpenNotif(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setOpenAvatar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const hasUnread = notifications.some(n => !n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.2 } }
  };

  return (
    <header className="
      backdrop-blur-[28px]
      border-b
      px-4 sm:px-6 py-4 sticky top-0 z-30
      transition-colors duration-500
      font-poppins
    "
      style={{
        background: isDark ? 'rgba(13, 17, 23, 0.65)' : 'rgba(255, 255, 255, 0.45)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(200, 215, 255, 0.4)'
      }}>
      <div className="flex items-center justify-between w-full">

        {/* LEFT */}
        <div className="flex items-center gap-5 relative z-50">
          <button
            onClick={onMenuToggle}
            className={`p-2.5 rounded-2xl border shadow-sm transition-all duration-300 relative flex items-center justify-center ${
              isMobileMenuOpen 
                ? 'bg-[#0059B2] border-[#0059B2] text-white shadow-blue-500/20 shadow-lg rotate-90' 
                : 'bg-white/50 dark:bg-[#1A1D24]/50 border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1A1D24] hover:shadow-md hover:scale-105'
            }`}
          >
            {isMobileMenuOpen ? <X size={22} className="-rotate-90" /> : <Menu size={22} />}
            {unreadMessagesCount > 0 && !isMobileMenuOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1A1D24] rounded-full animate-pulse" />
            )}
          </button>
          
          <div 
            className={`flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.1)] origin-left ${
              isMobileMenuOpen 
                ? 'translate-x-12 opacity-0 sm:opacity-40 sm:translate-x-[260px] scale-95 sm:scale-100' 
                : 'translate-x-0 opacity-100 scale-100'
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-none mb-1.5" style={{ fontFamily: "'Fraunces', serif" }}>
              {pageTitle}
            </h2>
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 leading-none hidden sm:block">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl hidden sm:flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
          >
            {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setOpenNotif(!openNotif); setOpenAvatar(false); }}
              className={`p-2.5 rounded-xl relative transition-all duration-300 ${openNotif ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Bell size={20} strokeWidth={2.5} />
              {hasUnread && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#111318] animate-pulse" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {openNotif && (
                <motion.div
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                  className="absolute right-0 mt-4 w-80 sm:w-96 backdrop-blur-[28px] rounded-3xl z-50 overflow-hidden"
                  style={{
                    background: isDark ? 'rgba(13, 17, 23, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(200, 215, 255, 0.6)'}`,
                    boxShadow: isDark
                      ? '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
                      : '0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)'
                  }}
                >
                  <div className="p-5 flex items-center justify-between border-b border-gray-100/50 dark:border-white/5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Tout lire
                      </button>
                    )}
                  </div>
                  <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                    {notifLoading ? (
                      <div className="py-10 text-center text-sm text-gray-400">Chargement...</div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
                          <Bell className="text-gray-400 dark:text-gray-500" size={28} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">Rien de nouveau</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[220px]">Vous êtes à jour !</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n)}
                            className={`p-3 rounded-2xl text-sm cursor-pointer transition-all duration-200 group relative ${
                              !n.isRead
                                ? 'bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-100/50 dark:hover:bg-blue-500/10'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="flex gap-3 pr-6">
                              <div className="mt-1 flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full ${
                                  !n.isRead ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-300 dark:bg-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${
                                  !n.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'
                                }`}>{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-1 block">{getTimeAgo(n.createdAt)}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteNotif(e, n)}
                              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => { setOpenAvatar(!openAvatar); setOpenNotif(false); }}
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.1)] cursor-pointer flex-shrink-0 border-2 border-white dark:border-[#111318]"
                style={{ background: avatarSrc ? 'transparent' : 'linear-gradient(135deg,#0059B2,#1A6FD1)' }}
              >
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  : getInitials(userName)
                }
              </div>
              <ChevronDown
                size={16}
                strokeWidth={3}
                className={`text-gray-400 dark:text-gray-500 hidden sm:block transition-transform duration-300 ${openAvatar ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {openAvatar && (
                <motion.div
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                  className="absolute right-0 mt-3 w-64 backdrop-blur-[28px] rounded-3xl z-50 overflow-hidden p-2"
                  style={{
                    background: isDark ? 'rgba(13, 17, 23, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(200, 215, 255, 0.6)'}`,
                    boxShadow: isDark
                      ? '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
                      : '0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)'
                  }}
                >
                  <div className="px-4 py-4 border-b border-gray-100/50 dark:border-white/5 flex items-center gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm"
                      style={{ background: avatarSrc ? 'transparent' : 'linear-gradient(135deg,#0059B2,#1A6FD1)' }}
                    >
                      {avatarSrc ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" /> : getInitials(userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => { setOpenAvatar(false); navigate('/Profils-Provider'); }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-3"
                    >
                      <User size={18} className="text-gray-400" /> Mon profil
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('userAvatar');
                        navigate('/login');
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); }
      `}</style>
    </header>
  );
};

export default TopBar;