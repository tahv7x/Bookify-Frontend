import React from 'react';
import { User, LayoutDashboard, Home, Calendar, MessageSquare, Briefcase, Users, HelpCircle, type LucideIcon } from 'lucide-react';
import logoLight from '../../assets/LogoB.png';
import logoDark from '../../assets/LogoW.png';
import { Link } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { motion } from 'framer-motion';

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
  { id: 'homep',            label: 'Acceuil',            icon: Home,          path: '/Home-Provider' },
  { id: 'dashboardp',       label: 'Dashboard',       icon: LayoutDashboard, path: '/Dashboard-Provider' },
  { id: 'mes-rendez-vous',  label: 'Mes Rendez-vous', icon: Calendar,      path: '/Mes-Rendez-Vous-Provider' },
  { id: 'disponibilites',   label: 'Disponibilités',  icon: Calendar,      path: '/Disponibilites-Provider' },
  { id: 'services',         label: 'Mes Services',    icon: Briefcase,     path: '/Mes-Services-Provider' },
  { id: 'clients',          label: 'Mes Clients',     icon: Users,         path: '/Mes-Clients-Provider' },
  { id: 'messages',         label: 'Messages',        icon: MessageSquare, path: '/Messages' },
  { id: 'profils',          label: 'Mon Profil',      icon: User,          path: '/Profils-Provider' },
  { id: 'support',          label: 'Support',         icon: HelpCircle,    path: '/Support-Provider' },
];

const Navbar: React.FC<NavbarProps> = ({ activeSection, onSectionChange }) => {
  const { isDark } = useTheme();
  const unreadMessagesCount = useUnreadMessages();

  return (
    <aside className="
      h-full w-full
      backdrop-blur-[28px]
      border-r
      transition-colors duration-500
      font-poppins flex flex-col
    "
    style={{
      background: isDark ? 'rgba(13, 17, 23, 0.65)' : 'rgba(255, 255, 255, 0.75)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
      boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.5)' : '4px 0 24px rgba(30,60,180,0.05)'
    }}>
      {/* Logo */}
      <div className="p-8 h-16 flex items-center justify-center border-b border-gray-100/50 dark:border-white/5 transition-colors duration-500">
        <Link to="/Home-Provider" className="group">
          <img
            src={isDark ? logoDark : logoLight}
            alt="Bookify Logo"
            className="h-10 w-auto cursor-pointer transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onSectionChange(item.id)}
              className="relative block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full px-4 py-3.5 rounded-2xl font-semibold text-sm
                  flex items-center gap-4 transition-all duration-300 relative z-10
                  ${isActive
                    ? 'text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-white/5'
                  }
                `}
              >
                {/* Active Background Bubble */}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-active-bg"
                    className="absolute inset-0 bg-gradient-to-r from-[#0059B2] to-[#1A6FD1] dark:from-blue-600 dark:to-blue-400 rounded-2xl -z-10 shadow-[0_4px_12px_rgba(0,89,178,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon size={20} className={isActive ? "text-white" : ""} strokeWidth={isActive ? 2.5 : 2} />
                  {item.id === 'messages' && unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#111318] rounded-full shadow-sm animate-pulse" />
                  )}
                </div>
                <span className="tracking-wide">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
};

export default Navbar;