import React, { useState } from 'react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';





const MesRendezVous: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .appointment-row {
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .appointment-row:nth-child(1) { animation-delay: 0.4s; }
        .appointment-row:nth-child(2) { animation-delay: 0.5s; }
        .appointment-row:nth-child(3) { animation-delay: 0.6s; }
        .appointment-row:nth-child(4) { animation-delay: 0.7s; }

        .appointment-row:hover {
          transform: translateX(4px);
          background: #f8fafc;
        }

        .history-item {
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .history-item:nth-child(1) { animation-delay: 0.8s; }
        .history-item:nth-child(2) { animation-delay: 0.9s; }
        .history-item:nth-child(3) { animation-delay: 1s; }

        .history-item:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .upload-icon {
          animation: float 3s ease-in-out infinite;
        }

        .sidebar-overlay {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <Navbar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false);
          }}
        />

      </div>

      {/* Main Content */}
      <main
        className={`
          min-h-screen transition-all duration-300
          lg:${isSidebarOpen ? 'ml-64' : 'ml-0'}
        `}
        >

        {/* Top Bar */}
        <TopBar 
          userName="Aya"
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />
      </main>
    </div>
  );
};

export default MesRendezVous;