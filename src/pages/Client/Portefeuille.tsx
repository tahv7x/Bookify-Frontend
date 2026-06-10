import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, CreditCard, Download, FileText, CheckCircle2, Clock, XCircle, Search, Filter, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';
import { useTheme } from "../../context/ThemeContext";

interface Transaction {
  id: string;
  provider: string;
  service: string;
  date: string;
  amount: number;
  status: 'Payé' | 'En attente' | 'Échoué';
}

const mockTransactions: Transaction[] = [
  { id: 'TRX-9081', provider: 'Dr. Amine Lahlou', service: 'Consultation Dentaire', date: '08 Juin 2026', amount: 400, status: 'Payé' },
  { id: 'TRX-9082', provider: 'AutoFix Garage', service: 'Vidange & Révision', date: '05 Juin 2026', amount: 850, status: 'Payé' },
  { id: 'TRX-9083', provider: 'Maison de Beauté', service: 'Soin de visage', date: '01 Juin 2026', amount: 350, status: 'En attente' },
  { id: 'TRX-9084', provider: 'Plombier Express', service: 'Réparation fuite', date: '28 Mai 2026', amount: 200, status: 'Payé' },
  { id: 'TRX-9085', provider: 'Dr. Youssef B.', service: 'Consultation Générale', date: '20 Mai 2026', amount: 300, status: 'Échoué' },
];

const Portefeuille: React.FC = () => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('portefeuille');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      const u = JSON.parse(s);
      setUserName(u.nomComplet || u.nom || 'Utilisateur');
    }
  }, []);

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Payé':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CheckCircle2 size={14} /> Payé
          </span>
        );
      case 'En attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
            <Clock size={14} /> En attente
          </span>
        );
      case 'Échoué':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400">
            <XCircle size={14} /> Échoué
          </span>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-200">
      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26,111,209,0.06) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
          transition: all 0.3s ease;
        }
        .dark .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px rgba(26, 111, 209, 0.2);
          border-color: rgba(26, 111, 209, 0.3);
        }
        .dark .glass-card:hover {
          box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.4);
        }
        
        .text-brand-gradient {
          background: linear-gradient(to right, #1A6FD1, #475569, #0c5a7c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .dark .text-brand-gradient {
          background: linear-gradient(to right, #3b82f6, #94a3b8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }} />
      </div>

      <main className="min-h-screen relative bg-dot-pattern pb-20 md:pb-0">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-gray-900 dark:text-white tracking-tight mb-2">
              Mon Portefeuille
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Gérez vos finances, vos moyens de paiement et consultez votre historique de transactions.
            </p>
          </motion.div>

          {/* Bento Grid Top Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            {/* Solde Actuel */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <Wallet size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <Wallet className="text-[#1A6FD1] dark:text-blue-400" size={24} />
                </div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Solde Actuel</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">0,00</span>
                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">MAD</span>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Recharger
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Total Dépensé */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                <TrendingDown size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                  <TrendingDown className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Total Dépensé (Ce mois)</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">2 100,00</span>
                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">MAD</span>
                </div>
                <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <TrendingDown size={14} /> -12% par rapport au mois dernier
                </p>
              </div>
            </motion.div>

            {/* Moyen de paiement */}
            <motion.div variants={itemVariants} className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                    <CreditCard className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <button className="text-sm text-[#1A6FD1] dark:text-blue-400 font-semibold hover:text-[#0c5a7c] dark:hover:text-blue-300 transition-colors">
                    Modifier
                  </button>
                </div>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Moyen de paiement principal</h2>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#1A6FD1] dark:to-[#0c5a7c] rounded-2xl p-4 text-white relative overflow-hidden shadow-lg">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                  <div className="flex space-x-1">
                    <div className="w-8 h-5 bg-white/20 rounded-md"></div>
                  </div>
                  <span className="text-sm font-bold italic opacity-80">VISA</span>
                </div>
                <div className="flex justify-between items-end relative z-10">
                  <div className="font-mono text-sm tracking-widest opacity-90">
                    •••• •••• •••• 4242
                  </div>
                  <div className="text-xs opacity-80">12/28</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Transactions History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6 md:p-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold font-fraunces text-gray-900 dark:text-white">Historique des Transactions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Consultez vos récents paiements de réservations.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-[#0f1117]/50 focus:outline-none focus:ring-2 focus:ring-[#1A6FD1]/50 text-sm transition-all"
                  />
                </div>
                <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-[#0f1117]/50 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="pb-4 font-semibold px-4">Prestataire & Service</th>
                    <th className="pb-4 font-semibold px-4">Date</th>
                    <th className="pb-4 font-semibold px-4">Montant</th>
                    <th className="pb-4 font-semibold px-4">Statut</th>
                    <th className="pb-4 font-semibold px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((trx, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      key={trx.id}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-white/40 dark:hover:bg-[#151B2B]/40 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A6FD1] to-[#0c5a7c] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {trx.provider.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.provider}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{trx.service}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{trx.date}</p>
                        <p className="text-xs text-gray-400">{trx.id}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{trx.amount.toFixed(2)} MAD</p>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(trx.status)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#1A6FD1] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                          <Download size={16} />
                          <span className="hidden sm:inline">Facture</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {mockTransactions.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aucune transaction</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vous n'avez pas encore effectué de paiements.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-[#1A6FD1] dark:hover:text-blue-400 transition-colors">
                Voir plus de transactions <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

        </div>
        <Footer />
        <MobileBottomNav />
      </main>
    </div>
  );
};

export default Portefeuille;
