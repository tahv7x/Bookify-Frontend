import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, ChevronRight, X, Check, AlertCircle, Phone, Star, RefreshCw, Plus, MessageCircle, CalendarPlus } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getClientAppointment, cancelAppointment } from '../../services/Client/getRdvsClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../context/ThemeContext";
import RescheduleModal from '../../components/Client/RescheduleModal';
import AddReviewModal from '../../components/Client/AddReviewModal';

type Status = 'ACCEPTE' | 'EN_ATTENTE' | 'REFUSE' | 'ANNULE' | 'TERMINE';
type Tab = 'all' | 'upcoming' | 'done' | 'refused';

interface Appointment {
  id: number;
  prestataire: string;
  specialty: string;
  rawDate?: string;
  date: string;
  time: string;
  location: string;
  status: Status;
  rating?: number;
  avatar: string | null;
  phone: string;
  service: string;
  prix: number;
  idPres: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'done', label: 'Terminés' },
  { id: 'refused', label: 'Refusés' },
];

const CFG: Record<Status, { label: string; badgeBg: string; badgeText: string; dot: string; Icon: React.FC<{ size?: number; className?: string }> }> = {
  ACCEPTE:    { label: 'Confirmé',   badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10', badgeText: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', Icon: Check },
  EN_ATTENTE: { label: 'En attente', badgeBg: 'bg-amber-50 dark:bg-amber-500/10',     badgeText: 'text-amber-600 dark:text-amber-400',     dot: 'bg-amber-500',   Icon: Clock },
  REFUSE:     { label: 'Refusé',     badgeBg: 'bg-red-50 dark:bg-red-500/10',         badgeText: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500',     Icon: X     },
  ANNULE:     { label: 'Annulé',     badgeBg: 'bg-gray-100 dark:bg-gray-500/15',      badgeText: 'text-gray-600 dark:text-gray-400',       dot: 'bg-gray-400',    Icon: X     },
  TERMINE:    { label: 'Terminé',    badgeBg: 'bg-blue-50 dark:bg-blue-500/10',       badgeText: 'text-[#1A6FD1] dark:text-blue-400',       dot: 'bg-[#1A6FD1]',    Icon: Check },
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const containerVariant = {
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

const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-4">
    <Sk w={48} h={48} r={24} className="shrink-0" />
    <div className="flex-1 space-y-2.5">
      <Sk w="40%" h={14} />
      <Sk w="25%" h={12} />
      <div className="flex gap-3 mt-1.5">
        <Sk w={80} h={10} />
        <Sk w={60} h={10} />
        <Sk w={100} h={10} />
      </div>
    </div>
    <Sk w={80} h={24} r={12} />
  </div>
);

const SkeletonStatCard = () => (
  <div className="glass-card rounded-2xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Sk w={8} h={8} r={4} />
      <Sk w={64} h={12} />
    </div>
    <Sk w={48} h={32} />
  </div>
);

/* ─── Cancel Modal ─── */
interface CancelModalProps {
  appointment: Appointment;
  onConfirm: () => void;
  onClose: () => void;
  cancelling: boolean;
}

const CancelModal: React.FC<CancelModalProps> = ({ appointment, onConfirm, onClose, cancelling }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      className="glass-card rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <AlertCircle size={100} />
      </div>
      <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10">
        <X size={28} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold font-fraunces text-gray-900 dark:text-white text-center mb-3 relative z-10">
        Annuler ce rendez-vous ?
      </h3>
      <p className="text-sm text-gray-500 dark:text-[#8892a4] text-center mb-8 leading-relaxed relative z-10">
        Êtes-vous sûr de vouloir annuler votre rendez-vous avec{' '}
        <span className="font-semibold text-gray-700 dark:text-white">{appointment.prestataire}</span>{' '}
        le {appointment.date} à {appointment.time} ?
      </p>
      <div className="flex gap-3 relative z-10">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-[#2d3148] text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-[#1a1d27]/50 hover:bg-gray-50 dark:hover:bg-[#1a1d27] transition-all"
        >
          Garder
        </button>
        <button
          onClick={onConfirm}
          disabled={cancelling}
          className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
        >
          {cancelling ? <RefreshCw size={14} className="animate-spin" /> : null}
          {cancelling ? 'Annulation...' : 'Oui, annuler'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Main Component ─── */
const generateGoogleCalendarUrl = (appt: any) => {
  const text = encodeURIComponent(`Rendez-vous avec ${appt.prestataire} (${appt.specialty})`);
  const details = encodeURIComponent(`Réservation via Bookify.`);
  const location = encodeURIComponent(appt.location || '');

  let startDate = '';
  let endDate = '';
  try {
    const raw = appt.rawDate || appt.date; 
    const d = new Date(`${raw}T${appt.time}:00`);
    if(!isNaN(d.getTime())) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dStr = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
      
      const dEnd = new Date(d.getTime() + 60 * 60 * 1000);
      const dEndStr = `${dEnd.getUTCFullYear()}${pad(dEnd.getUTCMonth() + 1)}${pad(dEnd.getUTCDate())}T${pad(dEnd.getUTCHours())}${pad(dEnd.getUTCMinutes())}${pad(dEnd.getUTCSeconds())}Z`;
      
      startDate = dStr;
      endDate = dEndStr;
    }
  } catch(e) {}

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
  if(startDate && endDate) {
    url += `&dates=${startDate}/${endDate}`;
  }
  return url;
};

const MesRendezVous: React.FC = () => {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false);
  const [activeSection, setActiveSection]     = useState('mes-rendez-vous');
  const [userName, setUserName]               = useState('');
  const [activeTab, setActiveTab]             = useState<Tab>('all');
  const [search, setSearch]                   = useState('');
  const [selectedId, setSelectedId]           = useState<number | null>(null);
  const [appointments, setAppointments]       = useState<Appointment[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [cancellingId, setCancellingId]       = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState<number | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRescheduleAppt, setSelectedRescheduleAppt] = useState<Appointment | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewAppt, setSelectedReviewAppt] = useState<Appointment | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('asc');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const filterRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterMenu]);

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserName(u.nom || u.nomComplet || '');
        fetchRdvs(u.idUtilisateur || u.id);
      } catch (e) { /* empty */ }
    }
  }, []);

  const fetchRdvs = async (userId: number) => {
    setLoading(true);
    try {
      const mapped = await getClientAppointment(userId);
      setAppointments(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = () => {
    const s = localStorage.getItem('user');
    if (s) {
      try {
        const u = JSON.parse(s);
        fetchRdvs(u.idUtilisateur || u.id);
      } catch (e) { /* empty */ }
    }
  };

  const handleCancelConfirm = async () => {
    if (!selectedCancelId) return;
    setCancellingId(selectedCancelId);
    try {
      await cancelAppointment(selectedCancelId);
      setAppointments(prev =>
        prev.map(a => a.id === selectedCancelId ? { ...a, status: 'ANNULE' } : a)
      );
      toast.success('Rendez-vous annulé avec succès.');
      setShowCancelModal(false);
    } catch {
      toast.error("Erreur lors de l'annulation");
      setShowCancelModal(false);
    } finally {
      setCancellingId(null);
      setSelectedCancelId(null);
    }
  };

  const stats = {
    total:    appointments.length,
    upcoming: appointments.filter(a => a.status === 'ACCEPTE' || a.status === 'EN_ATTENTE').length,
    done:     appointments.filter(a => a.status === 'TERMINE').length,
    refused:  appointments.filter(a => a.status === 'REFUSE'  || a.status === 'ANNULE').length,
  };

  const filtered = appointments.filter(a => {
    const matchTab =
      activeTab === 'all'      ? true :
      activeTab === 'upcoming' ? (a.status === 'ACCEPTE' || a.status === 'EN_ATTENTE') :
      activeTab === 'done'     ? a.status === 'TERMINE' :
      (a.status === 'REFUSE'   || a.status === 'ANNULE');
    const q = search.toLowerCase();
    const matchSearch = a.prestataire.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q);
    
    // Check date filter
    let matchDate = true;
    if (dateFilter !== 'all' && a.rawDate) {
      const apptDate = new Date(a.rawDate);
      const today = new Date();
      if (dateFilter === 'today') {
        matchDate = apptDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        matchDate = apptDate >= startOfWeek && apptDate <= endOfWeek;
      } else if (dateFilter === 'month') {
        matchDate = apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear();
      }
    }

    // Check specialty filter
    const matchSpecialty = specialtyFilter === 'all' || a.specialty === specialtyFilter;

    return matchTab && matchSearch && matchDate && matchSpecialty;
  }).sort((a, b) => {
    if (!a.rawDate || !b.rawDate) return 0;
    const dateA = new Date(a.rawDate).getTime();
    const dateB = new Date(b.rawDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const uniqueSpecialties = Array.from(new Set(appointments.map(a => a.specialty))).filter(Boolean);

  const nextRdv = appointments
    .filter(a => a.status === 'ACCEPTE' || a.status === 'EN_ATTENTE')
    .sort((a, b) => {
      if (!a.rawDate || !b.rawDate) return 0;
      return new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
    })[0];

  const STAT_CARDS = [
    { label: 'Total',    value: stats.total,    dot: 'bg-[#1A6FD1]',    text: 'text-[#1A6FD1] dark:text-blue-400'       },
    { label: 'À venir',  value: stats.upcoming, dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Terminés', value: stats.done,     dot: 'bg-gray-400',    text: 'text-gray-700 dark:text-white'          },
    { label: 'Refusés',  value: stats.refused,  dot: 'bg-red-500',     text: 'text-red-600 dark:text-red-400'         },
  ];

  const PROGRESS_ITEMS = [
    { label: 'Taux de confirmation', pct: stats.total ? Math.round(stats.upcoming / stats.total * 100) : 0, color: 'bg-emerald-500' },
    { label: 'RDV complétés',        pct: stats.total ? Math.round(stats.done     / stats.total * 100) : 0, color: 'bg-[#1A6FD1]'    },
    { label: 'Taux de refus',        pct: stats.total ? Math.round(stats.refused  / stats.total * 100) : 0, color: 'bg-red-400'     },
  ];

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
          border: 1px solid ${ isDark ? 'rgba(255,255,255,0.09)' : 'rgba(200,215,255,0.6)'};
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
          border-color: ${ isDark ? 'rgba(26,111,209,0.35)' : 'rgba(26,111,209,0.3)'};
        }

        @keyframes shimmer { 0% { background-position: -600px 0 } 100% { background-position: 600px 0 } }
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

        .prog-fill { transition: width .8s cubic-bezier(.16,1,.3,1); }
      `}</style>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40 transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }} />
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedCancelId && (() => {
          const appt = appointments.find(a => a.id === selectedCancelId);
          return appt ? (
            <CancelModal
              appointment={appt}
              onConfirm={handleCancelConfirm}
              onClose={() => { setShowCancelModal(false); setSelectedCancelId(null); }}
              cancelling={cancellingId === selectedCancelId}
            />
          ) : null;
        })()}
        {showRescheduleModal && selectedRescheduleAppt && (
          <RescheduleModal
            isOpen={showRescheduleModal}
            onClose={() => { setShowRescheduleModal(false); setSelectedRescheduleAppt(null); }}
            appointment={selectedRescheduleAppt}
            onSuccess={(idRdv, newDate, newTime) => {
              setAppointments(prev => prev.map(a => 
                a.id === idRdv ? { ...a, date: newDate, time: newTime } : a
              ));
            }}
          />
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-dot-pattern relative pb-20 md:pb-0">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <motion.div variants={containerVariant} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* ── Header ── */}
          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-fraunces text-gray-900 dark:text-white">Mes Rendez-vous</h1>
              <p className="text-sm text-gray-500 dark:text-[#8892a4] mt-0.5">Gérez et suivez tous vos rendez-vous</p>
            </div>
            <button
              onClick={() => navigate('/Explore')}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:brightness-110 shrink-0"
            >
              <Plus size={15} />Nouveau RDV
            </button>
          </motion.div>

          {/* ── Stat Cards ── */}
          <motion.div variants={fadeUpVariant} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {loading
              ? [1,2,3,4].map(i => <SkeletonStatCard key={i} />)
              : STAT_CARDS.map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-xs text-gray-500 dark:text-[#8892a4] font-semibold">{s.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              ))
            }
          </motion.div>

          {/* ── Main layout ── */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left: list ── */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Search + tabs */}
              <motion.div variants={fadeUpVariant} className="glass-card rounded-3xl p-5 shadow-sm relative z-20">
                <div className="flex gap-3 mb-2 relative">
                  <div className="flex-1 flex items-center gap-2 bg-white/50 dark:bg-[#1a1d27]/40 border border-gray-200/80 dark:border-[#2d3148] rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#1A6FD1]/50 transition-all">
                    <Search size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Médecin ou spécialité..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      autoComplete="off"
                      className="bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 w-full"
                    />
                    {search && (
                      <button onClick={() => setSearch('')}>
                        <X size={14} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  <div ref={filterRef}>
                    <button 
                      onClick={() => setShowFilterMenu(!showFilterMenu)}
                      className={`flex items-center justify-center w-11 h-[42px] border ${showFilterMenu ? 'border-[#1A6FD1] bg-blue-50/50 dark:bg-[#1A6FD1]/20 text-[#1A6FD1]' : 'border-gray-200 dark:border-[#2d3148] bg-white/50 dark:bg-[#1a1d27]/40 text-gray-500 dark:text-gray-400'} rounded-xl hover:bg-white dark:hover:bg-[#1a1d27] transition-all shrink-0`}
                    >
                      <Filter size={16} />
                    </button>
                    
                    <AnimatePresence>
                      {showFilterMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-[52px] w-64 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trier par date</h4>
                              <div className="flex gap-2 bg-gray-50 dark:bg-[#0B0F19] p-1 rounded-lg">
                                <button
                                  onClick={() => setSortOrder('asc')}
                                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all ${sortOrder === 'asc' ? 'bg-white dark:bg-[#1a1d27] text-[#1A6FD1] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                  Plus proche
                                </button>
                                <button
                                  onClick={() => setSortOrder('desc')}
                                  className={`flex-1 text-[11px] font-semibold py-1.5 rounded-md transition-all ${sortOrder === 'desc' ? 'bg-white dark:bg-[#1a1d27] text-[#1A6FD1] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                >
                                  Plus éloigné
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Période</h4>
                              <select 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as any)}
                                className="w-full text-xs bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-[#2d3148] text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1A6FD1] transition-colors"
                              >
                                <option value="all">Toutes les dates</option>
                                <option value="today">Aujourd'hui</option>
                                <option value="week">Cette semaine</option>
                                <option value="month">Ce mois-ci</option>
                              </select>
                            </div>

                            {uniqueSpecialties.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Spécialité</h4>
                                <select 
                                  value={specialtyFilter}
                                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                                  className="w-full text-xs bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-[#2d3148] text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1A6FD1] transition-colors"
                                >
                                  <option value="all">Toutes les spécialités</option>
                                  {uniqueSpecialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {(dateFilter !== 'all' || specialtyFilter !== 'all') && (
                              <button 
                                onClick={() => { setDateFilter('all'); setSpecialtyFilter('all'); }}
                                className="w-full text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 py-2 rounded-lg transition-colors"
                              >
                                Réinitialiser les filtres
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-2 relative">
                  {TABS.map(tab => {
                    const count = tab.id === 'all' ? stats.total : tab.id === 'upcoming' ? stats.upcoming : tab.id === 'done' ? stats.done : stats.refused;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'text-[#1A6FD1] dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10'
                            : 'text-gray-500 dark:text-[#8892a4] hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          activeTab === tab.id
                            ? 'bg-[#1A6FD1] text-white'
                            : 'bg-gray-100 dark:bg-[#2d3148] text-gray-500 dark:text-gray-400'
                        }`}>{count}</span>
                        {activeTab === tab.id && (
                          <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A6FD1] dark:bg-blue-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    [1,2,3,4].map(i => <SkeletonCard key={i} />)
                  ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-3xl p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={24} className="text-[#1A6FD1] dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-[#8892a4] font-medium">Aucun rendez-vous trouvé</p>
                    </motion.div>
                  ) : filtered.map((appt, idx) => {
                    const cfg   = CFG[appt.status];
                    const SIcon = cfg.Icon;
                    const isOpen       = selectedId === appt.id;
                    const isCancelling = cancellingId === appt.id;
                    const canAct = appt.status === 'ACCEPTE' || appt.status === 'EN_ATTENTE';

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        key={appt.id}
                        onClick={() => setSelectedId(isOpen ? null : appt.id)}
                        className={`glass-card rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                          isOpen
                            ? 'border-[#1A6FD1]/30 dark:border-[#1A6FD1]/50 shadow-md shadow-blue-500/5'
                            : 'hover:border-[#1A6FD1]/20'
                        }`}
                      >
                        {/* Left accent bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${isOpen ? 'bg-[#1A6FD1] dark:bg-blue-500' : 'bg-transparent'}`} />

                        <div className="flex items-center gap-4 pl-1">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {appt.avatar ? (
                              <img
                                src={appt.avatar}
                                alt={appt.prestataire}
                                className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-[#1a1d27] shadow-sm"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-xl border-2 border-white dark:border-[#1a1d27] shadow-sm">
                                {appt.prestataire?.charAt(0)}
                              </div>
                            )}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a1d27] ${cfg.dot}`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{appt.prestataire}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-[#8892a4]">{appt.specialty}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
                                <SIcon size={10} />{cfg.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-[#8892a4]"><Calendar size={14} className="text-[#1A6FD1] dark:text-blue-400" />{appt.date}</span>
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-[#8892a4]"><Clock size={14} className="text-[#1A6FD1] dark:text-blue-400" />{appt.time}</span>
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-[#8892a4]"><MapPin size={14} className="text-[#1A6FD1] dark:text-blue-400" />{appt.location}</span>
                            </div>
                            {appt.rating && (
                              <div className="flex items-center gap-1 mt-3">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={12} className={s <= appt.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-[#2d3148]'} />
                                ))}
                                <span className="text-[10px] font-semibold text-gray-400 dark:text-[#8892a4] ml-1">Votre avis</span>
                              </div>
                            )}
                          </div>

                          <ChevronRight
                            size={18}
                            className={`text-gray-300 dark:text-gray-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90 text-[#1A6FD1] dark:text-blue-400' : ''}`}
                          />
                        </div>

                        {/* Expanded actions */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 pl-1 border-t border-gray-100 dark:border-[#2d3148]/50 flex flex-wrap gap-3 overflow-hidden"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate("/Messages"); }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-[#1A6FD1] dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-[#1A6FD1] hover:text-white dark:hover:bg-[#1A6FD1] dark:hover:text-white transition-all shadow-sm"
                              >
                                <MessageCircle size={14} />Message
                              </button>

                              <a
                                href={`tel:${appt.phone}`}
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-sm"
                              >
                                <Phone size={14} />Appeler
                              </a>

                              {appt.status === 'ACCEPTE' && (
                                <a
                                  href={generateGoogleCalendarUrl(appt)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4285F4]/10 text-[#4285F4] rounded-xl text-xs font-bold hover:bg-[#4285F4] hover:text-white transition-all shadow-sm"
                                >
                                  <CalendarPlus size={14} />Agenda
                                </a>
                              )}

                              {canAct && (
                                <>
                                  {appt.status === 'EN_ATTENTE' && (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setSelectedRescheduleAppt(appt);
                                        setShowRescheduleModal(true);
                                      }}
                                      className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm"
                                    >
                                      <RefreshCw size={14} />Reprogrammer
                                    </button>
                                  )}
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      setSelectedCancelId(appt.id);
                                      setShowCancelModal(true);
                                    }}
                                    disabled={isCancelling}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all shadow-sm disabled:opacity-50"
                                  >
                                    {isCancelling
                                      ? <><RefreshCw size={14} className="animate-spin" />Annulation...</>
                                      : <><X size={14} />Annuler</>
                                    }
                                  </button>
                                </>
                              )}

                              {appt.status === 'TERMINE' && !appt.rating && (
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setSelectedReviewAppt(appt);
                                    setShowReviewModal(true);
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-all shadow-sm"
                                >
                                  <Star size={14} />Laisser un avis
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="w-full lg:w-[320px] shrink-0 space-y-6">

              {/* Next appointment */}
              <motion.div variants={fadeUpVariant} className="bg-gradient-to-br from-[#1A6FD1] via-[#475569] to-[#0c5a7c] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-4">Prochain rendez-vous</p>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="flex gap-4 items-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 rounded bg-white/20 w-3/4" />
                          <div className="h-2.5 rounded bg-white/15 w-1/2" />
                        </div>
                      </div>
                      {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-white/15" />)}
                      <div className="h-12 rounded-xl bg-white/25 mt-4" />
                    </div>
                  ) : nextRdv ? (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <img src={nextRdv.avatar} alt={nextRdv.prestataire} className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30" />
                        <div>
                          <p className="font-bold text-base">{nextRdv.prestataire}</p>
                          <p className="text-blue-100 text-xs font-medium mt-0.5">{nextRdv.specialty}</p>
                        </div>
                      </div>
                      <div className="space-y-3 mb-6">
                        {[{ Icon: Calendar, val: nextRdv.date }, { Icon: Clock, val: nextRdv.time }, { Icon: MapPin, val: nextRdv.location }].map(({ Icon, val }, i) => (
                          <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/5">
                            <Icon size={16} className="text-blue-100 shrink-0" />
                            <span className="text-sm font-semibold">{val}</span>
                          </div>
                        ))}
                      </div>
                      <a
                        href={`tel:${nextRdv.phone}`}
                        className="relative overflow-hidden flex items-center justify-center gap-2 bg-white text-[#1A6FD1] py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:scale-[1.03] hover:shadow-[0_6px_20px_rgba(26,111,209,0.5)] active:scale-[0.97] group"
                      >
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                          <MessageCircle size={16} />Contacter
                        </span>
                        <span className="ab solute inset-0 rounded-xl bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </a>
                    </>
                  ) : (
                    <div className="py-4">
                      <p className="text-sm text-blue-100 font-medium">Aucun rendez-vous confirmé à venir</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Tips */}
              <motion.div variants={fadeUpVariant} className="glass-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold font-fraunces text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <span>💡</span> Conseils Pratiques
                </h3>
                <div className="space-y-3">
                  {[
                    { e: '⏰', t: 'Arrivez 10 min avant votre rendez-vous' },
                    { e: '📋', t: 'Apportez vos documents médicaux' },
                    { e: '💊', t: 'Listez vos médicaments actuels' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-white/50 dark:bg-[#1a1d27]/50 rounded-xl border border-white/60 dark:border-[#2d3148]">
                      <span className="text-xl leading-none bg-blue-50 dark:bg-blue-500/10 w-8 h-8 rounded-lg flex items-center justify-center">{item.e}</span>
                      <p className="text-xs text-gray-600 dark:text-[#8892a4] font-medium leading-relaxed">{item.t}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Progress summary */}
              <motion.div variants={fadeUpVariant} className="glass-card rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold font-fraunces text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span>📊</span> Résumé
                </h3>
                {loading ? (
                  <div className="space-y-5">
                    {[1,2,3].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="skeleton h-2.5 w-full rounded" />
                        <div className="skeleton h-1.5 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {PROGRESS_ITEMS.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-semibold text-gray-500 dark:text-[#8892a4]">{item.label}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{item.pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-[#1a1d27] rounded-full overflow-hidden border border-white/60 dark:border-[#2d3148]">
                          <div className={`prog-fill h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showCancelModal && selectedCancelId && (
            <CancelModal
              appointment={appointments.find(a => a.id === selectedCancelId)!}
              onConfirm={handleCancelConfirm}
              onClose={() => { setShowCancelModal(false); setSelectedCancelId(null); }}
              cancelling={cancellingId !== null}
            />
          )}
        </AnimatePresence>

        {selectedRescheduleAppt && (
          <RescheduleModal
            isOpen={showRescheduleModal}
            onClose={() => { setShowRescheduleModal(false); setSelectedRescheduleAppt(null); }}
            appointment={{
              id: selectedRescheduleAppt.id,
              prestataireId: selectedRescheduleAppt.idPres,
              prestataireName: selectedRescheduleAppt.prestataire,
              currentDate: selectedRescheduleAppt.rawDate || selectedRescheduleAppt.date,
              currentTime: selectedRescheduleAppt.time
            }}
            onSuccess={loadAppointments}
          />
        )}

        {selectedReviewAppt && (
          <AddReviewModal
            isOpen={showReviewModal}
            onClose={() => { setShowReviewModal(false); setSelectedReviewAppt(null); }}
            onSuccess={loadAppointments}
            prestataireId={selectedReviewAppt.idPres}
            rendezVousId={selectedReviewAppt.id}
            prestataireName={selectedReviewAppt.prestataire}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MesRendezVous;