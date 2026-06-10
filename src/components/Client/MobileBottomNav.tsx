import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, Search, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/Home-Client' },
    { id: 'explore', label: 'Recherche', icon: Search, path: '/Explore' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/Mes-Rendez-Vous' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/Messages' },
    { id: 'profile', label: 'Profil', icon: User, path: '/Profils' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-[#2d3148]/60 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center w-16 h-12 gap-1 relative"
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'text-[#1A6FD1] dark:text-[#3b82f6] -translate-y-1' : 'text-slate-500 dark:text-[#8892a4]'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-blue-100 dark:bg-blue-500/20 rounded-full scale-150 blur-sm" />
                )}
                <Icon size={isActive ? 22 : 20} className="relative z-10" />
              </div>
              <span 
                className={`text-[10px] font-semibold transition-all duration-300 ${
                  isActive ? 'text-[#1A6FD1] dark:text-[#3b82f6] opacity-100' : 'text-slate-500 dark:text-[#8892a4] opacity-80'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
