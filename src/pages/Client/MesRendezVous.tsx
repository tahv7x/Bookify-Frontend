import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, ChevronRight, X, Check, AlertCircle, Phone, Star, RefreshCw, Plus } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getClientAppointment, cancelAppointment } from '../../services/Client/getRdvsClient';

type Status = 'ACCEPTE' | 'EN_ATTENTE' | 'REFUSE' | 'ANNULE' | 'TERMINE';
type Tab = 'all' | 'upcoming' | 'done' | 'refused';

interface Appointment {
  id: number;
  prestataire: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: Status;
  rating?: number;
  avatar: string;
  phone: string;
  service: string;
  prix: number;
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
  TERMINE:    { label: 'Terminé',    badgeBg: 'bg-blue-50 dark:bg-blue-500/10',       badgeText: 'text-blue-600 dark:text-blue-400',       dot: 'bg-blue-500',    Icon: Check },
};

/* ─── Skeleton primitives ─── */
const Sk = ({ w = '100%', h = 16, r = 8, className = '' }: { w?: string | number; h?: number; r?: number; className?: string }) => (
  <div className={`skeleton ${className}`} style={{ width: w, height: h, borderRadius: r }} />
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-4 border border-gray-200 dark:border-transparent shadow-sm sleek-card mb-4 flex items-center gap-4">
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
  <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card">
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
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    style={{ animation: 'fadeIn .2s ease both' }}
    onClick={onClose}
  >
    <div
      className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-transparent"
      style={{ animation: 'popIn .25s cubic-bezier(.16,1,.3,1) both' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <X size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white text-center mb-2">
        Annuler ce rendez-vous ?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
        Êtes-vous sûr de vouloir annuler votre rendez-vous avec{' '}
        <span className="font-semibold text-gray-700 dark:text-white">{appointment.prestataire}</span>{' '}
        le {appointment.date} à {appointment.time} ?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#0B0F19] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          Garder
        </button>
        <button
          onClick={onConfirm}
          disabled={cancelling}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {cancelling ? <RefreshCw size={14} className="animate-spin" /> : null}
          {cancelling ? 'Annulation...' : 'Oui, annuler'}
        </button>
      </div>
    </div>
  </div>
);

/* ─── Main Component ─── */
const MesRendezVous: React.FC = () => {
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
  const navigate = useNavigate();

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserName(u.nom || u.nomComplet || '');
        fetchRdvs(u.idUtilisateur);
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

  const handleCancelConfirm = async () => {
    if (!selectedCancelId) return;
    setCancellingId(selectedCancelId);
    setShowCancelModal(false);
    try {
      await cancelAppointment(selectedCancelId);
      setAppointments(prev =>
        prev.map(a => a.id === selectedCancelId ? { ...a, status: 'ANNULE' } : a)
      );
      toast.success('Rendez-vous annulé avec succès.');
    } catch {
      toast.error("Erreur lors de l'annulation");
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
    return matchTab && (
      a.prestataire.toLowerCase().includes(q) ||
      a.specialty.toLowerCase().includes(q)
    );
  });

  const nextRdv = appointments.find(a => a.status === 'ACCEPTE');

  const STAT_CARDS = [
    { label: 'Total',    value: stats.total,    dot: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-400'       },
    { label: 'À venir',  value: stats.upcoming, dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Terminés', value: stats.done,     dot: 'bg-gray-400',    text: 'text-gray-700 dark:text-white'          },
    { label: 'Refusés',  value: stats.refused,  dot: 'bg-red-500',     text: 'text-red-600 dark:text-red-400'         },
  ];

  const PROGRESS_ITEMS = [
    { label: 'Taux de confirmation', pct: stats.total ? Math.round(stats.upcoming / stats.total * 100) : 0, color: 'bg-emerald-500' },
    { label: 'RDV complétés',        pct: stats.total ? Math.round(stats.done     / stats.total * 100) : 0, color: 'bg-blue-500'    },
    { label: 'Taux de refus',        pct: stats.total ? Math.round(stats.refused  / stats.total * 100) : 0, color: 'bg-red-400'     },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19] transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif; }

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

        @keyframes shimmer { 0% { background-position: -600px 0 } 100% { background-position: 600px 0 } }
        .skeleton {
          background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite linear;
        }
        .dark .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 600px 100%;
        }

        @keyframes fadeIn     { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeUp     { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(16px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes popIn      { from { opacity: 0; transform: scale(.95) } to { opacity: 1; transform: scale(1) } }

        .anim-up    { animation: fadeUp     .45s cubic-bezier(.16,1,.3,1) both; }
        .anim-right { animation: slideRight .45s cubic-bezier(.16,1,.3,1) both; }

        .rdv-card { transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
        .rdv-card:hover { transform: translateX(3px); }

        .prog-fill { transition: width .8s cubic-bezier(.16,1,.3,1); }
      `}</style>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40 transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#0B0F19] border-r border-gray-200 dark:border-transparent transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }} />
      </div>

      {/* Cancel Modal */}
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

      <main className="min-h-screen bg-dot-pattern relative">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-up">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Rendez-vous</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gérez et suivez tous vos rendez-vous</p>
            </div>
            <button
              onClick={() => navigate('/Home-Client')}
              className="flex items-center gap-2 bg-[#0059B2] hover:bg-[#004a99] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0"
            >
              <Plus size={15} />Nouveau RDV
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-up" style={{ animationDelay: '.05s' }}>
            {loading
              ? [1,2,3,4].map(i => <SkeletonStatCard key={i} />)
              : STAT_CARDS.map((s, i) => (
                <div key={i} className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm sleek-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{s.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                </div>
              ))
            }
          </div>

          {/* ── Main layout ── */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Left: list ── */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Search + tabs */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-4 border border-gray-200 dark:border-transparent shadow-sm anim-up sleek-card" style={{ animationDelay: '.1s' }}>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-transparent rounded-xl px-3 py-2.5 hover:border-gray-200 dark:hover:border-gray-800 transition-colors">
                    <Search size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
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
                        <X size={12} className="text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  <button className="flex items-center gap-2 px-3.5 border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0B0F19] transition-all shrink-0">
                    <Filter size={14} />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                  {TABS.map(tab => {
                    const count = tab.id === 'all' ? stats.total : tab.id === 'upcoming' ? stats.upcoming : tab.id === 'done' ? stats.done : stats.refused;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#0059B2] text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#0B0F19]'
                        }`}
                      >
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          activeTab === tab.id
                            ? 'bg-white/25 text-white'
                            : 'bg-gray-100 dark:bg-[#0B0F19] text-gray-500 dark:text-gray-400'
                        }`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List */}
              {loading ? (
                [1,2,3,4].map(i => <SkeletonCard key={i} />)
              ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-12 text-center border border-gray-200 dark:border-transparent shadow-sm anim-up">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-[#0B0F19] rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucun rendez-vous trouvé</p>
                </div>
              ) : filtered.map((appt, idx) => {
                const cfg   = CFG[appt.status];
                const SIcon = cfg.Icon;
                const isOpen       = selectedId === appt.id;
                const isCancelling = cancellingId === appt.id;
                const canAct = appt.status === 'ACCEPTE' || appt.status === 'EN_ATTENTE';

                return (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedId(isOpen ? null : appt.id)}
                    className={`bg-white dark:bg-[#151B2B] rounded-2xl p-4 cursor-pointer relative overflow-hidden anim-up sleek-card ${
                      isOpen
                        ? 'border border-[#0059B2] dark:border-blue-500 shadow-md shadow-blue-100 dark:shadow-blue-500/10'
                        : 'border border-gray-200 dark:border-transparent shadow-sm'
                    }`}
                    style={{ animationDelay: `${.12 + idx * .05}s` }}
                  >
                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${isOpen ? 'bg-[#0059B2] dark:bg-blue-500' : 'bg-transparent'}`} />

                    <div className="flex items-center gap-4 pl-2">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={appt.avatar}
                          alt={appt.prestataire}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-[#151B2B] shadow-sm"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#151B2B] ${cfg.dot}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{appt.prestataire}</p>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{appt.specialty}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
                            <SIcon size={10} />{cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"><Calendar size={12} className="text-[#0059B2] dark:text-blue-400" />{appt.date}</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"><Clock size={12} className="text-[#0059B2] dark:text-blue-400" />{appt.time}</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"><MapPin size={12} className="text-[#0059B2] dark:text-blue-400" />{appt.location}</span>
                        </div>
                        {appt.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={12} className={s <= appt.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'} />
                            ))}
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 ml-1">Votre avis</span>
                          </div>
                        )}
                      </div>

                      <ChevronRight
                        size={16}
                        className={`text-gray-300 dark:text-gray-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90 text-[#0059B2] dark:text-blue-400' : ''}`}
                      />
                    </div>

                    {/* Expanded actions */}
                    {isOpen && (
                      <div className="mt-4 pt-4 pl-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2" style={{ animation: 'fadeUp .3s both' }}>
                        <a
                          href={`tel:${appt.phone}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all shadow-sm"
                          onClick={e => e.stopPropagation()}
                        >
                          <Phone size={14} />Appeler
                        </a>

                        {canAct && (
                          <>
                            <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all shadow-sm">
                              <RefreshCw size={14} />Reprogrammer
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedCancelId(appt.id);
                                setShowCancelModal(true);
                              }}
                              disabled={isCancelling}
                              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all shadow-sm disabled:opacity-50"
                            >
                              {isCancelling
                                ? <><RefreshCw size={14} className="animate-spin" />Annulation...</>
                                : <><X size={14} />Annuler</>
                              }
                            </button>
                          </>
                        )}

                        {appt.status === 'TERMINE' && !appt.rating && (
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all shadow-sm">
                            <Star size={14} />Laisser un avis
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Right sidebar ── */}
            <div className="w-full lg:w-[300px] shrink-0 space-y-6">

              {/* Next appointment */}
              <div className="bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] rounded-2xl p-6 text-white shadow-lg anim-right sleek-card" style={{ animationDelay: '.15s' }}>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-4">Prochain rendez-vous</p>
                {loading ? (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 rounded bg-white/20 w-3/4" />
                        <div className="h-2.5 rounded bg-white/15 w-1/2" />
                      </div>
                    </div>
                    {[1,2,3].map(i => <div key={i} className="h-9 rounded-xl bg-white/15" />)}
                    <div className="h-10 rounded-xl bg-white/25 mt-3" />
                  </div>
                ) : nextRdv ? (
                  <>
                    <div className="flex items-center gap-3 mb-5">
                      <img src={nextRdv.avatar} alt={nextRdv.prestataire} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30" />
                      <div>
                        <p className="font-bold text-sm">{nextRdv.prestataire}</p>
                        <p className="text-blue-200 text-xs font-medium">{nextRdv.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2.5 mb-5">
                      {[{ Icon: Calendar, val: nextRdv.date }, { Icon: Clock, val: nextRdv.time }, { Icon: MapPin, val: nextRdv.location }].map(({ Icon, val }, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-3.5 py-2.5">
                          <Icon size={14} className="text-blue-200 shrink-0" />
                          <span className="text-sm font-semibold">{val}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      href={`tel:${nextRdv.phone}`}
                      className="flex items-center justify-center gap-2 bg-white text-[#0059B2] py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                    >
                      <Phone size={14} />Contacter
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-blue-200 font-medium">Aucun rendez-vous confirmé à venir</p>
                )}
              </div>

              {/* Tips */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm anim-right sleek-card" style={{ animationDelay: '.2s' }}>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>💡</span> Conseils
                </h3>
                <div className="space-y-2.5">
                  {[
                    { e: '⏰', t: 'Arrivez 10 min avant votre rendez-vous' },
                    { e: '📋', t: 'Apportez vos documents médicaux' },
                    { e: '💊', t: 'Listez vos médicaments actuels' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100/50 dark:border-transparent">
                      <span className="text-lg leading-none">{item.e}</span>
                      <p className="text-xs text-blue-900 dark:text-blue-300 font-medium leading-relaxed">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress summary */}
              <div className="bg-white dark:bg-[#151B2B] rounded-2xl p-6 border border-gray-200 dark:border-transparent shadow-sm anim-right sleek-card" style={{ animationDelay: '.25s' }}>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
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
                  <div className="space-y-4">
                    {PROGRESS_ITEMS.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-gray-500 dark:text-gray-400">{item.label}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{item.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-[#0B0F19] rounded-full overflow-hidden">
                          <div className={`prog-fill h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default MesRendezVous;