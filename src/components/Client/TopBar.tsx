import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {  ChevronDown,  LogOut,  User,  Search,Bell,Moon,  Sun,Menu,X} from "lucide-react";

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
  userName = "Aya",
  onMenuToggle,
  isMobileMenuOpen = false
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openSearch, setOpenSearch] = useState(false); 
  
  
  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  {/*Fake Data Before API*/}
  const searchData = [
  { id: 1, type: "service", label: "Dentiste" },
  { id: 2, type: "service", label: "Plombier" },
  { id: 3, type: "provider", label: "Dr. Youssef Alami" },
  { id: 4, type: "provider", label: "Coiffeur Casablanca" }
  ];
  
  const notifications: Notification[] = [
    {
      id: 1,
      title: "Nouveau rendez‑vous confirmé",
      time: "Il y a 5 min",
      read: false
    },
    {
      id: 2,
      title: "Message reçu d’un client",
      time: "Il y a 1 heure",
      read: true
    }
  ];

  const filteredResults = searchData.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotif(false);
      }
      
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
   useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setOpenAvatar(false);
      }
    };
    if (openAvatar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openAvatar]);
  
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Bonjour {userName}
          </h2>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border">
            <Search size={16} className="text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher un service ou un pro..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenSearch(true);
              }}
                className="bg-transparent outline-none text-sm w-40 md:w-56"
            />
          </div>
          {openSearch && search && (
            <div className="absolute top-16 right-24 w-72 bg-white rounded-xl shadow-xl border z-50">
              {filteredResults.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 text-center">
                  Aucun résultat trouvé
                </div>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 text-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setOpenSearch(false);
                      setSearch("");
                      console.log("navigate to", item);
                    }}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {item.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="p-2 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell size={20} className="text-gray-600" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border z-50">
                <div className="p-4 font-semibold border-b">
                  Notifications
                </div>

                <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <Bell className="text-blue-500" size={26} />
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-gray-800 text-base">
                    Aucune notification
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mt-1 max-w-[220px]">
                    Vous n’avez aucun message ou alerte pour le moment.
                  </p>
                </div>
              ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50
                        ${!n.read ? "bg-blue-50" : ""}`}
                      >
                        <p className="font-medium text-gray-800">
                          {n.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {n.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DARK MODE */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-gray-100 rounded-lg hidden sm:block"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

           {/* ── AVATAR DROPDOWN ── */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => {
                setOpenAvatar(!openAvatar);
                setOpenNotif(false); // Close notifications dropdown
              }}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                {getInitials(userName)}
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-600 hidden sm:block transition-transform duration-200 ${
                  openAvatar ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Avatar Dropdown Menu */}
            {openAvatar && (
              <div className="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">aya@example.com</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setOpenAvatar(false);
                      // Navigate to profile
                      navigate("/Profils");
                    }}
                    className="dropdown-item w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 font-medium"
                  >
                    <User size={16} className="text-gray-500" />
                    Profile
                  </button>
                </div>

                {/* Logout - Separated */}
                <div className="border-t border-gray-100 pt-1 mt-1">
                  <button 
                    onClick={() => {
                      setOpenAvatar(false);
                      // Handle logout
                      console.log('Logging out...');
                    }}
                    className="dropdown-item w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 font-medium"
                  >
                    <LogOut size={16} className="text-gray-500" />
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