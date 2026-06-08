/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, TrendingUp, Activity, Star, ArrowUpRight, ArrowDownRight, Stethoscope, Heart, Brain, ChevronRight, FileText, MoreVertical } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import { useNavigate } from 'react-router-dom';
import { getClientAppointment } from '../../services/Client/getRdvsClient';

interface Appointment { name: string; specialty: string; date: string; time: string; status: string; statusType: 'refused' | 'accepted' | 'waiting'; }
interface HistoryItem { name: string; specialty: string; time: string; avatar: string; }
interface StatusBadgeProps { status: string; statusType: 'refused' | 'accepted' | 'waiting'; }

/* ─── Skeleton primitives ─── */
const Sk = ({ w = '100%', h = 16, r = 8, className = '' }: { w?: string | number; h?: number; r?: number; className?: string }) => (
  <div className={`skeleton ${className}`} style={{ width: w, height: h, borderRadius: r }} />
);

const SkStatCard = () => (
  <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-transparent flex items-center gap-5">
    <Sk w={56} h={56} r={16} />
    <div className="flex-1 space-y-3">
      <Sk w="50%" h={14} />
      <Sk w="70%" h={28} r={8} />
    </div>
  </div>
);

const SkRow = () => (
  <div className="bg-gray-50 dark:bg-[#0B0F19] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 dark:border-transparent">
    <div className="flex-1 space-y-2">
      <Sk w="60%" h={14} />
      <Sk w="40%" h={12} />
    </div>
    <Sk w={90} h={14} />
    <Sk w={70} h={14} />
    <Sk w={90} h={30} r={20} />
  </div>
);

const SkSpecialist = () => (
  <div className="bg-gray-50 dark:bg-[#0B0F19] rounded-2xl p-5 flex flex-col items-center gap-4 border border-gray-100 dark:border-transparent">
    <Sk w={72} h={72} r={36} />
    <Sk w="80%" h={16} />
    <Sk w="50%" h={12} />
    <Sk w="100%" h={36} r={10} />
  </div>
);

const SkHistItem = () => (
  <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-[#0B0F19] rounded-2xl border border-gray-100 dark:border-transparent">
    <Sk w={48} h={48} r={24} />
    <div className="flex-1 space-y-2">
      <Sk w="70%" h={14} />
      <Sk w="45%" h={12} />
    </div>
  </div>
);

/* ─── Main ─── */
const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]); // display: last 5
  const [allRdvs, setAllRdvs] = useState<Appointment[]>([]);           // stats: all
  const navigate = useNavigate();

  const specialists = [
    { name: 'Dr. Fatima Zahra', specialty: 'Cardiologue', rating: 4.9, next: 'Demain 09:00', avatar: 'https://i.pravatar.cc/150?img=47', color: '#ec4899', icon: Heart },
    { name: 'Dr. Karim Idrissi', specialty: 'Neurologue', rating: 4.7, next: 'Lun 14:30', avatar: 'https://i.pravatar.cc/150?img=68', color: '#8b5cf6', icon: Brain },
    { name: 'Dr. Amina Berrada', specialty: 'Généraliste', rating: 4.8, next: 'Mar 10:00', avatar: 'https://i.pravatar.cc/150?img=32', color: '#0891b2', icon: Stethoscope },
  ];

  const healthTips = [
    { tip: "L'hydratation est clé : visez 8 verres d'eau par jour.", icon: '💧' },
    { tip: 'Une marche de 30 min réduit le stress de 40%.', icon: '🚶' },
    { tip: 'Un sommeil de 7-8h booste votre immunité.', icon: '😴' },
  ];

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
  const confirmedRdvs = allRdvs.filter(a => a.statusType === 'accepted').length;
  const waitingRdvs  = allRdvs.filter(a => a.statusType === 'waiting').length;
  const refusedRdvs  = allRdvs.filter(a => a.statusType === 'refused').length;

  // History: 3 most recent from full list
  const recentHistory: HistoryItem[] = allRdvs.slice(0, 3).map(a => ({
    name: a.name,
    specialty: a.specialty,
    time: a.date,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(a.name)}`,
  }));




  /* ─── Sub-components ─── */
  const StatusBadge: React.FC<StatusBadgeProps> = ({ status, statusType }) => {
    const cfg = {
      refused: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
      accepted: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
      waiting: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    }[statusType];
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {status}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, trend, trendUp }: any) => (
    <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-transparent sleek-card flex items-center gap-5 relative overflow-hidden group">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold mb-0.5 ${trendUp ? 'text-emerald-500' : 'text-red-400'}`}>
              {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{trend}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19] transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * { font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif; }

        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26,111,209,0.06) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
        }

        .sleek-card { transition: all 0.3s ease; }
        .sleek-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(26,111,209,0.15);
        }
        .dark .sleek-card:hover {
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.4);
        }

        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite linear;
        }
        .dark .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 600px 100%;
        }

        .anim { opacity: 0; animation: fadeInUp 0.5s ease forwards; }
        .anim-1 { animation-delay:.05s } .anim-2 { animation-delay:.10s } .anim-3 { animation-delay:.15s }
        .anim-4 { animation-delay:.20s } .anim-5 { animation-delay:.25s } .anim-6 { animation-delay:.30s }
        .anim-7 { animation-delay:.35s } .anim-8 { animation-delay:.40s }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40 transition-all duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className={`fixed left-0 top-0 h-full w-64 border-r border-gray-200 dark:border-transparent transform transition-transform duration-300 ease-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }} />
      </div>

      <main className="min-h-screen bg-dot-pattern relative">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="p-5 sm:p-8 space-y-6 max-w-7xl mx-auto">

          {/* ── Page header ── */}
          <div className="anim anim-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Bonjour{userName ? `, ${userName}` : ''}
            </h1>
            <p className="mt-1.5 text-gray-500 dark:text-gray-400 text-sm">Voici un aperçu de vos activités de santé d'aujourd'hui.</p>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {loading ? (
              [1, 2, 3, 4].map(i => <SkStatCard key={i} />)
            ) : (
              <>
                <div className="anim anim-1"><StatCard icon={Calendar}     iconBg="bg-blue-50 dark:bg-blue-500/10"    iconColor="text-blue-600 dark:text-blue-400"    label="Total RDVs"    value={totalRdvs}     trend="" trendUp={true}  /></div>
                <div className="anim anim-2"><StatCard icon={CheckCircle}  iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400" label="Confirmés"    value={confirmedRdvs} trend="" trendUp={true}  /></div>
                <div className="anim anim-3"><StatCard icon={Clock}        iconBg="bg-amber-50 dark:bg-amber-500/10"  iconColor="text-amber-500 dark:text-amber-400"  label="En attente"    value={waitingRdvs}   trend="" trendUp={false} /></div>
                <div className="anim anim-4"><StatCard icon={Activity}     iconBg="bg-red-50 dark:bg-red-500/10"      iconColor="text-red-500 dark:text-red-400"      label="Refusés"       value={refusedRdvs}   trend="" trendUp={false} /></div>
              </>
            )}

          </div>

          {/* ── ROW 1 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Appointments table */}
            <div className="lg:col-span-2 bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Prochains rendez-vous</h3>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[#0B0F19] text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"><MoreVertical size={16} /></button>
              </div>
              {loading ? (
                <div className="space-y-4">{[1, 2, 3, 4].map(i => <SkRow key={i} />)}</div>
              ) : (
                <div className="space-y-2">
                  <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <div>Professionnel</div><div>Date</div><div>Heure</div><div>Statut</div>
                  </div>
                  {appointments.map((apt, idx) => (
                    <div key={idx} className="group bg-gray-50 dark:bg-[#0B0F19] rounded-xl p-4 border border-gray-100 dark:border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-colors duration-200 cursor-pointer">
                      {/* Mobile */}
                      <div className="sm:hidden space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                              {apt.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{apt.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{apt.specialty}</p>
                            </div>
                          </div>
                          <StatusBadge status={apt.status} statusType={apt.statusType} />
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> {apt.date}</span>
                          <span className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400" /> {apt.time}</span>
                        </div>
                      </div>
                      {/* Desktop */}
                      <div className="hidden sm:grid grid-cols-4 gap-4 items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {apt.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{apt.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{apt.specialty}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> {apt.date}</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5"><Clock size={13} className="text-gray-400" /> {apt.time}</p>
                        <div>
                          <StatusBadge status={apt.status} statusType={apt.statusType} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Health Goals + Donut */}
            <div className="space-y-6">
              {/* Objectifs Santé */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Activité Physique</h3>
                {loading ? (
                  <div className="space-y-4">
                    <Sk h={14} /><Sk h={14} /><Sk h={14} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: 'Pas quotidiens', val: '6,450', max: '10,000', pct: 64, color: 'bg-emerald-500', track: 'bg-emerald-500/10' },
                      { label: 'Hydratation', val: '1.2L', max: '2.5L', pct: 48, color: 'bg-blue-500', track: 'bg-blue-500/10' },
                      { label: 'Sommeil', val: '6h 30m', max: '8h', pct: 81, color: 'bg-indigo-500', track: 'bg-indigo-500/10' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{item.val} <span className="text-gray-400 font-normal">/ {item.max}</span></span>
                        </div>
                        <div className={`h-1.5 w-full ${item.track} rounded-full overflow-hidden`}>
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Donut */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Statistiques</h3>
                {loading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Sk w={120} h={120} r={60} />
                    <div className="w-full space-y-2">
                      <Sk h={12} /><Sk h={12} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative w-32 h-32 mx-auto mb-5">
                      <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
                        {/* Track */}
                        <circle cx="100" cy="100" r="75" fill="none" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="16" />
                        {/* Segments */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#1A6FD1" strokeWidth="16" strokeDasharray="344 471" strokeDashoffset="0" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="75 471" strokeDashoffset="-344" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#0ea5e9" strokeWidth="16" strokeDasharray="52 471" strokeDashoffset="-419" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">73%</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Santé</div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { color: 'bg-[#1A6FD1]', label: 'Santé Médicale', val: '73%' },
                        { color: 'bg-purple-500', label: 'Beauté & Bien-être', val: '16%' },
                        { color: 'bg-sky-500', label: 'Services tech.', val: '11%' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 2 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column in ROW 2 */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Specialists (Condensed) */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star size={18} className="text-yellow-500" /> Spécialistes
                  </h3>
                  <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1">
                    Voir tout <ChevronRight size={16} />
                  </button>
                </div>
                {loading ? (
                  <div className="grid sm:grid-cols-3 gap-4">{[1, 2, 3].map(i => <SkHistItem key={i} />)}</div>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {specialists.map((sp, i) => {
                      const SpIcon = sp.icon;
                      return (
                        <div key={i} className="group bg-gray-50 dark:bg-[#0B0F19] rounded-2xl p-4 flex items-center gap-3 border border-gray-100 dark:border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 cursor-pointer">
                          <div className="relative shrink-0">
                            <img src={sp.avatar} alt={sp.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-[#151B2B] shadow-sm group-hover:scale-105 transition-transform" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#151B2B]" style={{ background: sp.color }}>
                              <SpIcon size={10} color="#fff" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{sp.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sp.specialty}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star size={10} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{sp.rating}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* My Sauce: Traitements en cours */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-7 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> Traitements en cours
                  </h3>
                  <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Renouveler
                  </button>
                </div>
                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-4">{[1, 2].map(i => <SkHistItem key={i} />)}</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                    {[
                      { name: 'Doliprane 1000mg', type: 'Fièvre & Douleur', time: 'Après le repas', icon: '💊', color: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
                      { name: 'Amoxicilline', type: 'Antibiotique', time: 'Dans 2 heures', icon: '🦠', color: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
                    ].map((med, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0B0F19] rounded-2xl border border-gray-100 dark:border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform ${med.color}`}>
                            {med.icon}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{med.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{med.type}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${med.color} ${med.text}`}>
                              <Clock size={10} className="inline mr-1 mb-0.5" />
                              {med.time}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* History + Tips */}
            <div className="space-y-6">
              {/* Activité Physique */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-7">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Activité Physique</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Pas quotidiens', value: 6450, max: 10000, unit: '/ 10,000', color: 'bg-emerald-500' },
                    { label: 'Hydratation',    value: 1.2,  max: 2.5,   unit: 'L / 2.5L', color: 'bg-blue-500',    isFloat: true },
                    { label: 'Sommeil',         value: 6.5,  max: 8,     unit: 'h / 8h',   color: 'bg-violet-500',  isFloat: true },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.isFloat ? item.value.toFixed(1) : item.value.toLocaleString()} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                          style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistiques RDVs */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card anim anim-8">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">Statistiques</h3>
                {loading ? (
                  <div className="flex flex-col items-center gap-4"><div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" /><div className="space-y-2 w-full">{[1,2,3].map(i=><div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"/>)}</div></div>
                ) : (() => {
                  const cats = [
                    { label: 'Santé Médicale',    dot: '#3b82f6', keywords: ['médecin','dentiste','cardio','psy','généraliste','neurologue','pédiatre','ophtalmo','dermato'] },
                    { label: 'Beauté & Bien-être', dot: '#a855f7', keywords: ['coiffeur','barbier','maquill','ongl','esthét','spa','massage'] },
                    { label: 'Services tech.',     dot: '#06b6d4', keywords: ['mécanicien','plombier','électricien','nettoyage','technic'] },
                  ];
                  const total = allRdvs.length || 1;
                  const counts = cats.map(c => ({
                    ...c,
                    count: allRdvs.filter(a => c.keywords.some(k => a.specialty?.toLowerCase().includes(k))).length
                  }));
                  const labeled = counts.map(c => ({ ...c, pct: Math.round((c.count / total) * 100) }));
                  const mainPct = labeled[0].pct || 73;
                  const r = 42, circ = 2 * Math.PI * r;
                  return (
                    <>
                      <div className="flex justify-center mb-5">
                        <svg width="112" height="112" viewBox="0 0 112 112">
                          <circle cx="56" cy="56" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" className="dark:stroke-gray-700"/>
                          <circle cx="56" cy="56" r={r} fill="none"
                            stroke="url(#statGrad)" strokeWidth="10"
                            strokeDasharray={circ}
                            strokeDashoffset={circ - (circ * mainPct / 100)}
                            strokeLinecap="round"
                            transform="rotate(-90 56 56)"
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                          />
                          <defs>
                            <linearGradient id="statGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6"/>
                              <stop offset="100%" stopColor="#a855f7"/>
                            </linearGradient>
                          </defs>
                          <text x="56" y="52" textAnchor="middle" className="fill-gray-900 dark:fill-white" style={{fontSize:18,fontWeight:700,fill:'currentColor'}}>{mainPct}%</text>
                          <text x="56" y="66" textAnchor="middle" style={{fontSize:10,fill:'#9ca3af'}}>Santé</text>
                        </svg>
                      </div>
                      <div className="space-y-2.5">
                        {labeled.map((c, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.dot }} />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{c.label}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{c.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>
          </div>

        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;