import React, { useState } from 'react';
import {  Calendar, MoreVertical, Upload, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import StatsCard, { type StatsCardProps } from   '../../components/Client/StatCard';
import Footer from '../../components/Client/Footer';

interface Appointment {
  name: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  statusType: 'refused' | 'accepted' | 'waiting';
}

interface HistoryItem {
  name: string;
  specialty: string;
  time: string;
  avatar: string;
}

interface StatusBadgeProps {
  status: string;
  statusType: 'refused' | 'accepted' | 'waiting' ;
}



const DashboardClient: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Stats configuration
  const statsConfig: StatsCardProps[] = [
    {
      icon: Calendar,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'Total Rendez-vous',
      value: '17',
      delay: 0.1
    },
    {
      icon: CheckCircle,
      iconBgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
      label: 'Rendez-vous confirmés',
      value: '12',
      delay: 0.2
    },
    {
      icon: Clock,
      iconBgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      label: 'Rendez-vous en attent',
      value: '5',
      delay: 0.3
    }
  ];

  const appointments: Appointment[] = [
    {
      name: "Youssef Tijani",
      specialty: "Dentiste",
      date: "21 Décembre 2025",
      time: "02:00PM",
      status: "Refusé",
      statusType: "refused"
    },
    {
      name: "Boutnaame Amin",
      specialty: "Cardio",
      date: "17 novembre 2025",
      time: "06:00PM",
      status: "En attente",
      statusType: "waiting"
    },
    {
      name: "Adam Massik",
      specialty: "Psychologue",
      date: "25 Fevrier 2025",
      time: "10:00AM",
      status: "En attente",
      statusType: "waiting"
    },
    {
      name: "Mohamed noldi",
      specialty: "Docteur",
      date: "31 Janvier 2025",
      time: "11:30AM",
      status: "Accepté",
      statusType: "accepted"
    }
  ];

  const recentHistory: HistoryItem[] = [
    { name: "Mohamed Taher", specialty: "Dentiste", time: "il tem", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Najm Yussef", specialty: "Dentiste", time: "il tem", avatar: "https://i.pravatar.cc/150?img=33" },
    { name: "Boutnaame Amin", specialty: "Docteur", time: "il tem", avatar: "https://i.pravatar.cc/150?img=14" }
  ];

  
  const StatusBadge: React.FC<StatusBadgeProps> = ({ status, statusType }) => {
    const statusConfig = {
      refused: { 
        bg: 'bg-red-50', 
        text: 'text-red-600', 
        icon: '✕',
        iconBg: 'bg-red-100'
      },
      accepted: { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-600', 
        icon: '✓',
        iconBg: 'bg-emerald-100'
      },
      waiting: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-600', 
        icon: '⏱',
        iconBg: 'bg-yellow-100'
      },
      
    };

    const config = statusConfig[statusType];

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <div className={`w-5 h-5 rounded-full ${config.iconBg} flex items-center justify-center text-xs`}>
          {config.icon}
        </div>
        {status}
      </div>
    );
  };

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
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 "
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

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {statsConfig.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Appointments Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 h-auto lg:h-[500px]" style={{ animation: 'slideInUp 0.5s 0.1s backwards' }}>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Prochains rendez-vous</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="space-y-3 px-4 sm:px-0">
                    {/* Header - Hidden on mobile */}
                    <div className="hidden sm:grid grid-cols-4 gap-20 px-12 py-2 text-xs font-semibold text-gray-500 uppercase">
                      <div>Nom</div>
                      <div>Date</div>
                      <div>Heure</div>
                      <div>Statut</div>
                    </div>

                    {appointments.map((apt, idx) => (
                      <div key={idx} className="appointment-row bg-gray-50 rounded-xl p-4 hover:bg-[#F4F7FE] ">
                        {/* Mobile Layout */}
                        <div className="sm:hidden space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{apt.name}</p>
                              <p className="text-sm text-gray-500">{apt.specialty}</p>
                            </div>
                            <StatusBadge status={apt.status} statusType={apt.statusType} />
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{apt.date}</span>
                            <span className="font-medium">{apt.time}</span>
                          </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{apt.name}</p>
                            <p className="text-xs text-gray-500">{apt.specialty}</p>
                          </div>
                          <div className="text-sm px-1 text-gray-700">{apt.date}</div>
                          <div className="text-sm px-5 font-medium text-gray-700">{apt.time}</div>
                          <div>
                            <StatusBadge status={apt.status} statusType={apt.statusType} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upload Document */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={{ animation: 'slideInUp 0.5s 0.2s backwards' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uploader ton Document</h3>
                <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 upload-icon">
                    <Upload className="text-blue-600" size={28} />
                  </div>
                  <p className="text-gray-900 text-sm font-semibold mb-2">Upload Files</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Pour une meilleur analyse,<br />
                    n'oublier pas de télécharger<br />
                    les documents necessaires
                  </p>
                </div>
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg">
                  Poster
                </button>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={{ animation: 'slideInUp 0.5s 0.3s backwards' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Catégories Statistiques</h3>
                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90">
                    {/* Segment 1 */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#1e293b" strokeWidth="40" strokeDasharray="22 440" strokeDashoffset="-418"/>

                    {/* Segment 2 */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#38bdf8"strokeWidth="40" strokeDasharray="321 440"strokeDashoffset="0"/>

                    {/* Segment 3 */}
                    <circle cx="100"cy="100" r="70" fill="none" stroke="#061a23" strokeWidth="40" strokeDasharray="31 440" strokeDashoffset="-387"/>

                    {/* Segment 4 */}
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#0c5a7c" strokeWidth="40" strokeDasharray="66 440" strokeDashoffset="-321"/>
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">73%</div>
                      <div className="text-xs text-gray-500 mt-1">Santé<br/>Médicale</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  {/* 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                      <span className="text-gray-700">Santé Médicale</span>
                    </div>
                    <span className="font-semibold text-gray-900">73%</span>
                  </div>
                  {/* 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                      <span className="text-gray-700">Beauté & Bien-être</span>
                    </div>
                    <span className="font-semibold text-gray-900">16%</span>
                  </div>

                  {/* 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#061a23]"></div>
                      <span className="text-gray-700">Services professionnels</span>
                    </div>
                    <span className="font-semibold text-gray-900">7%</span>
                  </div>

                  {/* 4 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0c5a7c]"></div>
                      <span className="text-gray-700">Services techniques & artisanaux</span>
                    </div>
                    <span className="font-semibold text-gray-900">4%</span>
                  </div>
                </div>

              </div>

              {/* History */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" style={{ animation: 'slideInUp 0.5s 0.4s backwards' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Historique des rendez-vous</h3>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                  Cette section permet au client de consulter la liste de ses rendez-vous passés, y compris les détails...
                </p>
                <div className="space-y-3 mb-4">
                  {recentHistory.map((item, idx) => (
                    <div key={idx} className="history-item flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer">
                      <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.specialty} • <span className="text-blue-600">{item.time}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg">
                  Voir plus
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </main>
    </div>
  );
};

export default DashboardClient;