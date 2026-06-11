import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, MapPin, Calendar, Star, Users, MessageSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Client {
  id: number;
  name: string;
  avatar: string | null;
  initials: string;
  email: string;
  phone: string;
  city: string;
  rdvCount: number;
  lastRdv: string;
  rating: number;
}

const DUMMY_CLIENTS: Client[] = [
  {
    id: 1,
    name: "Yassine El Fassi",
    avatar: "https://i.pravatar.cc/150?u=yassine",
    initials: "YE",
    email: "yassine.fassi@example.com",
    phone: "+212 6 00 11 22 33",
    city: "Casablanca",
    rdvCount: 4,
    lastRdv: "12 Mai 2026",
    rating: 5.0
  },
  {
    id: 2,
    name: "Amina Bennani",
    avatar: "https://i.pravatar.cc/150?u=amina",
    initials: "AB",
    email: "amina.b@example.com",
    phone: "+212 6 11 22 33 44",
    city: "Rabat",
    rdvCount: 2,
    lastRdv: "03 Juin 2026",
    rating: 4.5
  },
  {
    id: 3,
    name: "Karim Tazi",
    avatar: null,
    initials: "KT",
    email: "karim.tazi@example.com",
    phone: "+212 6 22 33 44 55",
    city: "Marrakech",
    rdvCount: 1,
    lastRdv: "28 Avr 2026",
    rating: 0
  },
  {
    id: 4,
    name: "Sara Chraibi",
    avatar: "https://i.pravatar.cc/150?u=sara",
    initials: "SC",
    email: "sara.chraibi@example.com",
    phone: "+212 6 33 44 55 66",
    city: "Tanger",
    rdvCount: 7,
    lastRdv: "10 Juin 2026",
    rating: 4.8
  }
];

const MesClients: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = DUMMY_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="relative z-0 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl text-[#0f2a5e] dark:text-white mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                Mes Clients
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                Gérez votre base de clients et consultez leur historique.
              </p>
            </div>
            
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Rechercher un client..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl outline-none transition-all border ${
                  isDark 
                    ? 'bg-[#1A1D24]/60 border-white/10 text-white focus:border-blue-500 focus:bg-[#1A1D24]' 
                    : 'bg-white/60 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
                } backdrop-blur-md`}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className={`p-6 flex items-center gap-5 rounded-3xl border shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 will-change-transform backdrop-blur-lg ${isDark ? 'bg-[#1A1D24]/40 border-white/10 hover:bg-[#1A1D24]/60 hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]' : 'bg-white/40 border-white hover:bg-white/60 hover:border-blue-500/50 hover:shadow-blue-500/20'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-[#0059B2]'}`}>
              <Users size={24} />
            </div>
            <div>
              <p className={`text-xs mb-1 font-medium tracking-wide uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Clients</p>
              <p className={`text-3xl font-extrabold leading-none ${isDark ? 'text-white' : 'text-[#0f2a5e]'}`} style={{ fontFamily: "'Fraunces', serif" }}>
                {DUMMY_CLIENTS.length}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-6 flex items-center gap-5 rounded-3xl border shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 will-change-transform backdrop-blur-lg ${isDark ? 'bg-[#1A1D24]/40 border-white/10 hover:bg-[#1A1D24]/60 hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]' : 'bg-white/40 border-white hover:bg-white/60 hover:border-blue-500/50 hover:shadow-blue-500/20'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Star size={24} />
            </div>
            <div>
              <p className={`text-xs mb-1 font-medium tracking-wide uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avis Moyens</p>
              <p className={`text-3xl font-extrabold leading-none ${isDark ? 'text-white' : 'text-[#0f2a5e]'}`} style={{ fontFamily: "'Fraunces', serif" }}>
                4.8
              </p>
            </div>
          </motion.div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
            className={`rounded-3xl p-6 border backdrop-blur-lg relative group transition-all duration-300 will-change-transform ${
              isDark 
                ? 'bg-[#1A1D24]/40 border-white/10 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:bg-[#1A1D24]/60 hover:-translate-y-2' 
                : 'bg-white/40 border-white shadow-sm hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2'
            }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#0059B2] to-blue-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm border-2 border-white dark:border-[#1A1D24]">
                  {client.avatar ? (
                    <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    client.initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{client.name}</h3>
                    <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0059B2] dark:text-blue-400 hover:bg-[#0059B2] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors flex items-center justify-center flex-shrink-0" title="Envoyer un message">
                      <MessageSquare size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin size={14} className="text-[#0059B2] dark:text-blue-400" />
                    <span className="truncate">{client.city}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                    <Phone size={14} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{client.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                    <Mail size={14} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{client.email}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[...Array(Math.min(3, client.rdvCount))].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 border-2 border-white dark:border-[#1A1D24] flex items-center justify-center">
                        <Calendar size={10} className="text-[#0059B2] dark:text-blue-400" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {client.rdvCount} {client.rdvCount > 1 ? 'rendez-vous' : 'rendez-vous'}
                  </span>
                </div>
                
                {client.rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-yellow-500" fill="currentColor" />
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{client.rating}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {filteredClients.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun client trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Aucun client ne correspond à votre recherche "{searchTerm}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MesClients;
