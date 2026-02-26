import React from 'react';
import { Search, Bell, Moon, Sun, Settings, Menu, X } from 'lucide-react';

export interface TopBarProps {
  userName?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ 
  userName = "Aya", 
  onMenuToggle,
  isMobileMenuOpen = false 
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuToggle}
            className=" p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Greeting */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Bonjour {userName} 
            </h2>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <Search size={16} className="text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm w-32 md:w-48 placeholder:text-gray-400"
            />
          </div>

          {/* Notification Bell */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-gray-600" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
            <Settings size={20} className="text-gray-600" />
          </button>

          {/* User Avatar */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;