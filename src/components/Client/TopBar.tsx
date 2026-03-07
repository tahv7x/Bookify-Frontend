import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, LogOut, User, Search, Bell, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export interface TopBarProps {
  userName?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface Notification {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  userName = "",
  onMenuToggle,
  isMobileMenuOpen = false
}) => {
  // ✅ FIXED: use global theme context instead of local state
  const { isDark, toggleTheme } = useTheme();

  const location = useLocation();

  const firstName = userName.split(' ')[0];

  const pageTitles: Record<string, string> = {
    '/Home-Client':      `Bonjour ${firstName}`,
    '/Dashboard-Client': 'Dashboard',
    '/Mes-Rendez-Vous':  'Mes Rendez-vous',
    '/Profils':          'Mon Profil',
  };
  const pageTitle = pageTitles[location.pathname] ?? `Bonjour ${userName}`;

  const [openNotif, setOpenNotif]     = useState(false);
  const [openAvatar, setOpenAvatar]   = useState(false);
  const navigate                      = useNavigate();
  const [search, setSearch]           = useState("");
  const [openSearch, setOpenSearch]   = useState(false);

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
  const notifRef  = useRef<HTMLDivElement>(null);

  const searchData = [
    { id: 1, type: "service",  label: "Dentiste"           },
    { id: 2, type: "service",  label: "Plombier"           },
    { id: 3, type: "provider", label: "Dr. Youssef Alami"  },
    { id: 4, type: "provider", label: "Coiffeur Casablanca"}
  ];

  const notifications: Notification[] = [
    { id: 1, title: "Nouveau rendez‑vous confirmé", time: "Il y a 5 min",   read: false },
    { id: 2, title: "Message reçu d'un client",     time: "Il y a 1 heure", read: true  }
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
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <header className="
      bg-white dark:bg-dark-surface
      border-b border-gray-200 dark:border-dark-border
      px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30
      transition-colors duration-200
    ">
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-700 dark:text-dark-text"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-text">
            {pageTitle}
          </h2>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border">
            <Search size={16} className="text-gray-400 dark:text-dark-muted" />
            <input
              type="search"
              placeholder="Rechercher un service ou un pro..."
              value={search}
              onChange={e => { setSearch(e.target.value); setOpenSearch(true); }}
              className="bg-transparent outline-none text-sm w-40 md:w-56 text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-muted"
            />
          </div>
          {openSearch && search && (
            <div className="absolute top-16 right-24 w-72 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border z-50">
              {filteredResults.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 dark:text-dark-muted text-center">Aucun résultat trouvé</div>
              ) : (
                filteredResults.map(item => (
                  <div
                    key={item.id}
                    className="px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-dark-text"
                    onClick={() => { setOpenSearch(false); setSearch(""); }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-2 text-xs text-gray-400 dark:text-dark-muted">{item.type}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg relative"
            >
              <Bell size={20} className="text-gray-600 dark:text-dark-text" />
              {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            {openNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border z-50">
                <div className="p-4 font-semibold border-b border-gray-100 dark:border-dark-border text-gray-900 dark:text-dark-text">
                  Notifications
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                      <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                        <Bell className="text-blue-500" size={26} />
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-dark-text text-base">Aucune notification</h4>
                      <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-[220px]">
                        Vous n'avez aucun message ou alerte pour le moment.
                      </p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors
                          ${!n.read
                            ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-dark-border'
                          }`}
                      >
                        <p className="font-medium text-gray-800 dark:text-dark-text">{n.title}</p>
                        <span className="text-xs text-gray-500 dark:text-dark-muted">{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ✅ FIXED: Dark mode button now calls toggleTheme from context */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg hidden sm:flex items-center justify-center text-gray-600 dark:text-dark-text transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => { setOpenAvatar(!openAvatar); setOpenNotif(false); }}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg p-1 transition-colors"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm shadow-md cursor-pointer flex-shrink-0"
                style={{ background: avatarSrc ? 'transparent' : 'linear-gradient(135deg,#0059B2,#1A6FD1)' }}
              >
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  : getInitials(userName)
                }
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-600 dark:text-dark-muted hidden sm:block transition-transform duration-200 ${openAvatar ? 'rotate-180' : ''}`}
              />
            </button>

            {openAvatar && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface rounded-xl shadow-lg border border-gray-200 dark:border-dark-border py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                    style={{ background: avatarSrc ? 'transparent' : 'linear-gradient(135deg,#0059B2,#1A6FD1)' }}
                  >
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                      : getInitials(userName)
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-dark-text truncate">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5 truncate">{userEmail || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setOpenAvatar(false); navigate("/Profils"); }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-dark-text font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    <User size={16} className="text-gray-500 dark:text-dark-muted" />
                    Profile
                  </button>
                </div>

                <div className="border-t border-gray-100 dark:border-dark-border pt-1 mt-1">
                  <button
                    onClick={() => {
                      setOpenAvatar(false);
                      localStorage.removeItem('user');
                      localStorage.removeItem('userAvatar');
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 dark:text-dark-text font-medium hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    <LogOut size={16} className="text-gray-500 dark:text-dark-muted" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default TopBar;