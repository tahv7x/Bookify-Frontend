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
      fixed left-0 top-0 h-full w-64 z-50
      bg-white dark:bg-dark-surface
      border-r border-gray-100 dark:border-dark-border
      shadow-sm transition-colors duration-200
    ">
      <style>{`
        .nav-item {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-item:hover {
          transform: translateX(2px);
        }
      `}</style>

      {/* Logo */}
      <div className="p-9 border-b border-gray-100 dark:border-dark-border transition-colors duration-200">
        <div className="absolute left-[83px] top-8">
          <Link to="/Home-Client">
            <img
              src={isDark ? logoDark : logoLight}
              alt="Bookify Logo"
              className="h-12 w-auto cursor-pointer -translate-y-5 transition-transform duration-300 hover:scale-105 active:scale-95"
            />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onSectionChange(item.id)}
              className={`nav-item w-full px-4 py-3 rounded-lg font-medium text-sm
                flex items-center gap-3 relative transition-all
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-[#0059B2] dark:text-blue-400'
                  : 'text-[#A3AED0] dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0059B2] dark:bg-blue-400 rounded-r-md" />
              )}
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Navbar;