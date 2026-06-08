import React from 'react';
import { User, LayoutDashboard, Home, Calendar, type LucideIcon } from 'lucide-react';
import logoLight from '../../assets/LogoB.png';
import logoDark from '../../assets/LogoW.png';
import { Link } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems: NavItem[] = [
  { id: 'home',            label: 'Home',            icon: Home,          path: '/Home-Client' },
  { id: 'dashboard',      label: 'Dashboard',        icon: LayoutDashboard, path: '/Dashboard-Client' },
  { id: 'mes-rendez-vous',label: 'Mes Rendez-vous',  icon: Calendar,      path: '/Mes-Rendez-Vous' },
  { id: 'profils',        label: 'Profils',          icon: User,          path: '/Profils' },
];

const Navbar: React.FC<NavbarProps> = ({ activeSection, onSectionChange }) => {
  const { isDark } = useTheme();

  return (
    <aside className="
      w-full h-full flex flex-col
      bg-white/70 dark:bg-[#0B0F19]/60 backdrop-blur-xl
      transition-colors duration-200
    ">
      <style>{`
        .nav-item {
          transition: all 0.3s ease;
        }
        .nav-item:hover {
          transform: translateX(4px);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200/50 dark:border-white/5 shrink-0">
        <Link to="/Home-Client">
          <img
            src={isDark ? logoDark : logoLight}
            alt="Bookify Logo"
            className="h-10 w-auto cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onSectionChange(item.id)}
              className={`nav-item w-full px-4 py-3 rounded-xl font-medium text-sm
                flex items-center gap-3 relative overflow-hidden
                ${isActive
                  ? 'bg-blue-50/50 dark:bg-blue-900/20 text-[#0059B2] dark:text-blue-400 border border-[#0059B2]/10 dark:border-blue-400/10'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-white/5 border border-transparent'
                }`}
            >
              {/* L'barre dyal Active state b l'glow */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#0059B2] dark:bg-blue-400 rounded-r-md shadow-[0_0_8px_#0059B2] dark:shadow-[0_0_8px_#60A5FA]" />
              )}
              <Icon size={18} className={isActive ? "text-[#0059B2] dark:text-blue-400" : "text-gray-400 dark:text-gray-500"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Navbar;