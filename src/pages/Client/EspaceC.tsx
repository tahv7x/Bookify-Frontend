/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp, Activity, Star, ArrowUpRight, ArrowDownRight, Stethoscope, Heart, Brain, ChevronRight, FileText, MoreVertical } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';
import { useNavigate } from 'react-router-dom';
import { getClientAppointment } from '../../services/Client/getRdvsClient';
import { motion, type Variants } from 'framer-motion';
import { useTheme } from "../../context/ThemeContext";
import api from '../../services/api';
interface Appointment { name: string; specialty: string; date: string; time: string; status: string; statusType: 'refused' | 'accepted' | 'waiting'; avatar: string | null; }
interface HistoryItem { name: string; specialty: string; time: string; avatar: string | null; }
interface StatusBadgeProps { status: string; statusType: 'refused' | 'accepted' | 'waiting'; }

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const containerVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/* ─── Skeleton primitives ─── */
const Sk = ({ w = '100%', h = 16, r = 8, className = '' }: { w?: string | number; h?: number; r?: number; className?: string }) => (
  <div className={`skeleton ${className}`} style={{ width: w, height: h, borderRadius: r }} />
);

const SkRow = () => (
  <div className="bg-white/50 dark:bg-[#1a1d27]/50 rounded-2xl p-4 flex items-center gap-4 border border-white/60 dark:border-[#2d3148]">
    <div className="flex-1 space-y-2">
      <Sk w="60%" h={14} />
      <Sk w="40%" h={12} />
    </div>
    <Sk w={32} h={32} r={16} />
  </div>
);

const SkHistItem = () => (
  <div className="flex items-center gap-4 p-3 bg-white/50 dark:bg-[#1a1d27]/50 rounded-2xl border border-white/60 dark:border-[#2d3148]">
    <Sk w={48} h={48} r={24} />
    <div className="flex-1 space-y-2">
      <Sk w="70%" h={14} />
      <Sk w="45%" h={12} />
    </div>
  </div>
);

/* ─── Main ─── */
const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]); // display: last 5
  const [allRdvs, setAllRdvs] = useState<Appointment[]>([]);           // stats: all
  const navigate = useNavigate();

  const [specialists, setSpecialists] = useState<any[]>([]);
  const [specialistsLoading, setSpecialistsLoading] = useState(true);

  const [myFavs, setMyFavs] = useState<any[]>([]);
  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const { getMyFavorites } = await import('../../services/Client/favorisService');
        const data = await getMyFavorites();
        if (data) setMyFavs(data.slice(0, 4));
      } catch(e) {}
    };
    fetchFavs();
  }, []);

  useEffect(() => {
    setSpecialistsLoading(true);
    api.get('/prestataires/random')
      .then(res => {
        setSpecialists(res.data.map((p: any) => ({
          id: p.id,
          name: p.nom,
          specialty: p.specialite,
          rating: p.rating || 0,
          avatar: p.avatar || null,
        })));
      })
      .catch(() => {})
      .finally(() => setSpecialistsLoading(false));
  }, []);

  const statusMap: Record<string, { label: string; type: 'refused' | 'accepted' | 'waiting' }> = {
    ACCEPTE:    { label: 'Accepté',    type: 'accepted' },
    EN_ATTENTE: { label: 'En attente', type: 'waiting'  },
    REFUSE:     { label: 'Refusé',     type: 'refused'  },
    ANNULE:     { label: 'Annulé',     type: 'refused'  },
    TERMINE:    { label: 'Terminé',    type: 'accepted' },
  };

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserName(u.nom || u.nomComplet || u.NomComplet || '');
        const id = u.id || u.idUtilisateur || u.IdUtilisateur;
        if (id) setUserId(Number(id));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getClientAppointment(userId)
      .then(rdvs => {
        const mapped: Appointment[] = rdvs.map((r: any) => {
          const cfg = statusMap[r.status] || { label: r.status, type: 'waiting' as const };
          return {
            name: r.prestataire,
            specialty: r.specialty,
            date: r.date,
            time: r.time,
            status: cfg.label,
            statusType: cfg.type,
            avatar: r.avatar
          };
        });
        setAllRdvs(mapped);                 // all → for stats
        setAppointments(mapped.slice(0, 5)); // 5 most recent → for table
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  // Derived stats from ALL appointments (not just the 5 displayed)
  const totalRdvs    = allRdvs.length;
  const recentHistory: HistoryItem[] = allRdvs.slice(0, 3).map(a => ({
    name: a.name,
    specialty: a.specialty,
    time: a.date,
    avatar: a.avatar,
  }));

  const isDark = theme === 'dark';

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: isDark ? '#0d1117' : '#eef2fc', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }

        .bg-dot-pattern {
          background-image: radial-gradient(${
            isDark ? 'rgba(255,255,255,0.022)' : 'rgba(26,111,209,0.06)'
          } 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .glass-card {
          background: ${
            isDark
              ? 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))'
              : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,255,0.85))'
          };
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid ${ isDark ? 'rgba(255,255,255,0.09)' : 'rgba(200,215,255,0.6)' };
          box-shadow: ${
            isDark
              ? '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)'
          };
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-3px);
          box-shadow: ${
            isDark
              ? '0 14px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 14px 60px rgba(26,111,209,0.15), inset 0 1px 0 rgba(255,255,255,1)'
          };
          border-color: ${ isDark ? 'rgba(26,111,209,0.35)' : 'rgba(26,111,209,0.3)' };
        }

        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg,
            ${ isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,215,255,0.35)'} 25%,
            ${ isDark ? 'rgba(255,255,255,0.09)' : 'rgba(220,232,255,0.65)'} 50%,
            ${ isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,215,255,0.35)'} 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      {isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      <div className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 ease-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }} />
      </div>

      <main className="min-h-screen pb-20 md:pb-0 bg-dot-pattern transition-all duration-300 relative">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />
        <motion.div 
          variants={containerVariant}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
        >

          {/* ── Page header ── */}
          <motion.div variants={fadeUpVariant}>
            <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-gray-900 dark:text-white">
              Bonjour{userName ? `, ${userName}` : ''}
            </h1>
            <p className="mt-1.5 text-gray-500 dark:text-[#8892a4] text-sm">Bienvenue dans votre espace santé et bien-être.</p>
          </motion.div>

          {/* ── Banner: Prochain Rendez-vous ── */}
          <motion.div variants={fadeUpVariant}>
            {(() => {
              const nextRdv = allRdvs.find(a => a.statusType === 'waiting' || a.statusType === 'accepted');
              return nextRdv ? (
                  <div className="bg-gradient-to-r from-[#1A6FD1] via-[#475569] to-[#0c5a7c] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-900/20">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-4">
                          <Calendar size={12} /> Prochain Rendez-vous
                        </span>
                        <h2 className="text-2xl font-bold mb-1">{nextRdv.date} à {nextRdv.time}</h2>
                        <p className="text-blue-100 flex items-center gap-2">
                          <span className="font-semibold text-white">{nextRdv.name}</span> • {nextRdv.specialty}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate('/Mes-Rendez-Vous')}
                          className="relative overflow-hidden px-5 py-2.5 bg-white text-[#1A6FD1] font-bold rounded-xl transition-all shadow-sm hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(26,111,209,0.4)] active:scale-[0.97] group"
                        >
                          <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                            Gérer
                          </span>
                          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                        <button className="px-5 py-2.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 backdrop-blur-sm transition-colors border border-white/10" onClick={() => navigate('/Messages')}>
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold font-fraunces text-gray-900 dark:text-white mb-1">Aucun rendez-vous à venir</h2>
                      <p className="text-sm text-gray-500 dark:text-[#8892a4]">Explorez nos prestataires et prenez soin de vous.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white font-semibold rounded-xl hover:brightness-110 transition-all shadow-sm hover:shadow-md" onClick={() => navigate('/Home-Client')}>
                      Rechercher un pro
                    </button>
                  </div>
                )
            })()}
          </motion.div>

          {/* ── ROW 1: Quick Actions & Re-book ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Favoris / Réserver à nouveau */}
              <motion.div variants={fadeUpVariant}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-fraunces text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart size={18} className="text-pink-500" /> Vos Favoris
                  </h3>
                  <button onClick={() => navigate('/Favoris')} className="text-sm font-semibold text-[#1A6FD1] hover:underline">
                    Voir tout
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {loading ? (
                    [1, 2].map(i => <SkRow key={i} />)
                  ) : (() => {
                    if (myFavs.length === 0) return <div className="col-span-2 glass-card rounded-2xl p-6 text-center"><p className="text-sm text-gray-500 dark:text-[#8892a4]">Retrouvez vos prestataires favoris ici.</p></div>;
                    return myFavs.map((prov, i) => (
                      <div key={i} onClick={() => navigate(`/Service-Provider-Profile/${prov.id}`)} className="group flex items-center justify-between p-4 glass-card rounded-2xl shadow-sm hover:shadow-md hover:border-[#1A6FD1]/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          {prov.avatar ? (
                            <img src={prov.avatar} alt={prov.nom} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {prov.nom?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{prov.nom}</p>
                            <p className="text-xs text-gray-500 dark:text-[#8892a4]">{prov.specialite || 'Prestataire'}</p>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1A6FD1] dark:text-blue-400 flex items-center justify-center group-hover:bg-[#1A6FD1] group-hover:text-white transition-colors">
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </motion.div>

              {/* Suggestions / Découverte */}
              <motion.div variants={fadeUpVariant}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-fraunces text-gray-900 dark:text-white flex items-center gap-2">
                    <Star size={18} className="text-yellow-500" /> Découverte
                  </h3>
                  <span className="text-sm text-[#1A6FD1] dark:text-blue-400 font-medium cursor-pointer hover:underline" onClick={() => navigate('/Home-Client')}>Voir tout</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {specialists.map((sp, i) => (
                    <div key={i} className="glass-card rounded-2xl p-5 shadow-sm flex flex-col items-center text-center hover:shadow-md hover:border-[#1A6FD1]/30 transition-all cursor-pointer" onClick={() => navigate(`/Service-Provider-Profile/${sp.id}`)}>
                      {sp.avatar ? (
                        <img src={sp.avatar} alt={sp.name} className="w-16 h-16 rounded-full mb-3 object-cover shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-full mb-3 bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                          {sp.name?.charAt(0)}
                        </div>
                      )}
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{sp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-[#8892a4] mb-2">{sp.specialty}</p>
                      <div className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-md mb-3">
                        <Star size={10} className="fill-current" /> {sp.rating}
                      </div>
                      <button className="w-full py-2 bg-gray-50/50 dark:bg-[#0B0F19]/50 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/Service-Provider-Profile/${sp.id}`); }}>
                        Consulter
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>

            {/* Right Column: Historique Rapide */}
            <div className="space-y-6">
              
              <motion.div variants={fadeUpVariant} className="glass-card rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold font-fraunces text-gray-900 dark:text-white">Activité Récente</h3>
                  <Activity size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
                
                {/* Mini Stat */}
                <div className="flex items-center gap-4 p-3 bg-blue-50/50 dark:bg-[#0059B2]/10 rounded-xl mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#0059B2]/20 flex items-center justify-center text-[#1A6FD1] dark:text-blue-400 font-bold">
                    {totalRdvs}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Total Réservations</p>
                    <p className="text-xs text-gray-500 dark:text-[#8892a4]">Depuis votre inscription</p>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-400 dark:text-[#8892a4] uppercase tracking-wider mb-3">Derniers Rendez-vous</h4>
                {loading ? (
                  <div className="space-y-3">{[1, 2, 3].map(i => <SkHistItem key={i} />)}</div>
                ) : recentHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-[#8892a4] text-center py-4">Aucun historique</p>
                ) : (
                  <div className="space-y-4">
                    {recentHistory.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {item.name?.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-[#8892a4] mt-0.5 truncate">{item.specialty} • {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full mt-6 py-2.5 bg-gray-50/50 dark:bg-[#0B0F19]/50 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => navigate('/Mes-Rendez-Vous')}>
                  Voir tout l'historique
                </button>
              </motion.div>

            </div>
          </div>

        </motion.div>
        <Footer />
        <MobileBottomNav />
      </main>
    </div>
  );
};

export default Dashboard;