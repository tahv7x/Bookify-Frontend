import React, { useEffect, useState } from 'react';
import {
  BarChart2, Users, Star, Calendar, TrendingUp,
  MoreHorizontal, AlignJustify, CheckCircle2, XCircle, Loader2, Award
} from 'lucide-react';
import { getMyProviderProfile } from '../../services/provider/providerService';
import { getStats } from '../../services/provider/getStats';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

// ─── SVG AREA CHART (Dynamic) ────────────────────────────────────────────────────────
interface AreaChartData { month: string; v1: number; v2: number; }
const AreaChartSVG: React.FC<{ data: AreaChartData[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const W = 340, H = 120, pad = { t: 10, r: 10, b: 24, l: 28 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const maxV = Math.max(10, ...data.map(d => Math.max(d.v1, d.v2))) * 1.2;

  const pts = (key: 'v1' | 'v2') =>
    data.map((d, i) => ({
      x: pad.l + (i / (data.length - 1 || 1)) * iW,
      y: pad.t + iH - (d[key] / maxV) * iH,
    }));
  const toPath = (pts: {x:number;y:number}[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const toArea = (pts: {x:number;y:number}[]) =>
    `${toPath(pts)} L${(pad.l+iW).toFixed(1)},${(pad.t+iH).toFixed(1)} L${pad.l},${(pad.t+iH).toFixed(1)} Z`;

  const p1 = pts('v1'), p2 = pts('v2');
  const lastP1 = p1[p1.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full transition-all duration-500" style={{ height: 130 }}>
      <defs>
        <linearGradient id="svgG1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1e3a8a" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="svgG2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#93c5fd" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {[0,0.25,0.5,0.75,1].map((t,i) => (
        <line key={i} x1={pad.l} y1={(pad.t + t*iH).toFixed(1)} x2={pad.l+iW} y2={(pad.t + t*iH).toFixed(1)} stroke="#f3f4f6" strokeWidth="1" className="dark:stroke-white/5" />
      ))}

      <path d={toArea(p2)} fill="url(#svgG2)" className="hover:opacity-80 transition-opacity" />
      <path d={toArea(p1)} fill="url(#svgG1)" className="hover:opacity-80 transition-opacity" />

      <path d={toPath(p2)} fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
      <path d={toPath(p1)} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinejoin="round" />

      {lastP1 && <circle cx={lastP1.x} cy={lastP1.y} r="4" fill="white" stroke="#1e3a8a" strokeWidth="2" className="animate-pulse" />}

      {data.map((d, i) => (
        <text key={i} x={(pad.l + (i/(data.length-1 || 1))*iW).toFixed(1)} y={H - 6} textAnchor="middle" fill="#9ca3af" fontSize="9">{d.month}</text>
      ))}

      {[0, maxV/2, maxV].map((v,i) => (
        <text key={i} x={pad.l - 4} y={(pad.t + iH - (v/maxV)*iH + 3).toFixed(1)} textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(v)}</text>
      ))}
    </svg>
  );
};

// ─── SVG BAR CHART (Dynamic) ───────────────────────────────────────────────────────────
interface BarChartData { day: string; v: number; }
const BarChartSVG: React.FC<{ data: BarChartData[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const W = 280, H = 110, pad = { t: 5, r: 5, b: 20, l: 24 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const maxV = Math.max(10, ...data.map(d => d.v)) * 1.2;
  const barW = iW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full transition-all duration-500" style={{ height: 110 }}>
      {data.map((d, i) => {
        const bH = (d.v / maxV) * iH;
        const x  = pad.l + i * barW + barW * 0.2;
        const y  = pad.t + iH - bH;
        const fill = i === new Date().getDay() - 1 ? "#1e3a8a" : i < 3 ? "#93c5fd" : "#bfdbfe"; // Highlight current day approx
        return (
          <g key={i} className="group">
            <rect x={x} y={y} width={barW*0.6} height={bH} rx="3" fill={fill} className="transition-all duration-300 group-hover:opacity-80 group-hover:scale-y-105 origin-bottom" />
            <text x={x + barW*0.3} y={H-5} textAnchor="middle" fill="#9ca3af" fontSize="9" className="font-semibold">{d.day}</text>
          </g>
        );
      })}
      {[0,0.5,1].map((t,i)=>(
        <text key={i} x={pad.l-3} y={(pad.t + (1-t)*iH + 3).toFixed(1)} textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(t*maxV)}</text>
      ))}
    </svg>
  );
};

// ─── SVG DONUT CHART (Dynamic) ─────────────────────────────────────────────────────────
interface DonutChartData { name: string; value: number; color: string; }
const DonutChartSVG: React.FC<{ data: DonutChartData[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const cx = 70, cy = 65, r = 48, ir = 30;
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const arcs = data.reduce((acc, d) => {
    const sweep = total === 0 ? 0 : (d.value / total) * 2 * Math.PI;
    const angle = acc.currentAngle;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const endAngle = angle + sweep;
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(endAngle);
    const iy1 = cy + ir * Math.sin(endAngle);
    const ix2 = cx + ir * Math.cos(angle);
    const iy2 = cy + ir * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    acc.items.push({
      d: sweep === 0 ? "" : `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${ir},${ir} 0 ${large},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z`,
      color: d.color,
    });
    acc.currentAngle = endAngle;
    return acc;
  }, { items: [] as { d: string; color: string }[], currentAngle: -Math.PI / 2 }).items;

  return (
    <svg viewBox="0 0 140 130" className="w-full transition-all duration-500" style={{ height: 130 }}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity cursor-pointer dark:stroke-[#1A1D27]" />
      ))}
    </svg>
  );
};

// ─── KPI CARD ────────────────────────────────────────────────────────────────
interface KpiCardProps { icon: React.ReactNode; label: string; value: string; dark?: boolean; }
const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, dark }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 flex items-center gap-5 rounded-3xl border shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 will-change-transform backdrop-blur-lg ${dark ? (isDark ? 'bg-[#0059B2]/80 border-blue-500/20' : 'bg-[#0059B2] border-blue-600') : (isDark ? 'bg-[#1A1D24]/40 border-white/10 hover:bg-[#1A1D24]/60 hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]' : 'bg-white/40 border-white hover:bg-white/60 hover:border-blue-500/50 hover:shadow-blue-500/20')}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white/20' : (isDark ? 'bg-blue-900/20' : 'bg-blue-50')}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs mb-1 font-medium tracking-wide uppercase ${dark ? 'text-blue-100' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>{label}</p>
        <p className={`text-3xl font-extrabold leading-none ${dark ? 'text-white' : (isDark ? 'text-white' : 'text-[#0f2a5e]')}`} style={{ fontFamily: "'Fraunces', serif" }}>{value}</p>
      </div>
    </div>
  );
};

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number; }
const Card: React.FC<CardProps> = ({ children, className = "", style, delay = 0 }) => {
  const { isDark } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      style={style} 
      className={`rounded-3xl p-8 border backdrop-blur-lg transition-all duration-300 will-change-transform ${
        isDark 
          ? 'bg-[#1A1D24]/40 border-white/10 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:bg-[#1A1D24]/60 hover:-translate-y-2' 
          : 'bg-white/40 border-white shadow-sm hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

// ─── CALENDAR (Dynamic) ─────────────────────────────────────────────────────
const CAL_DAYS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];

type RdvDay = { day: number; statut: string };

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; ring: string; label: string }> = {
  ACCEPTE:    { bg: 'bg-emerald-50',    text: 'text-emerald-700',  dot: 'bg-emerald-500',  ring: 'ring-emerald-200',  label: 'Confirmé' },
  EN_ATTENTE: { bg: 'bg-blue-50',       text: 'text-blue-700',     dot: 'bg-blue-500',     ring: 'ring-blue-200',     label: 'En attente' },
  ANNULE:     { bg: 'bg-red-50',        text: 'text-red-700',      dot: 'bg-red-500',      ring: 'ring-red-200',      label: 'Annulé' },
};
const STATUS_COLORS_DARK: Record<string, { bg: string; text: string; ring: string }> = {
  ACCEPTE:    { bg: 'bg-emerald-900/30', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  EN_ATTENTE: { bg: 'bg-blue-900/30',    text: 'text-blue-400',    ring: 'ring-blue-500/30' },
  ANNULE:     { bg: 'bg-red-900/30',     text: 'text-red-400',     ring: 'ring-red-500/30' },
};

const DynamicCalendar: React.FC<{ rdvDays: RdvDay[] }> = ({ rdvDays }) => {
  const { isDark } = useTheme();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Build a map: day → statut
  const rdvMap = new Map<number, string>();
  rdvDays.forEach(({ day, statut }) => rdvMap.set(day, statut));

  // Day of week of first day (Mon=0 ... Sun=6)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <p className="text-sm font-bold text-center text-gray-500 dark:text-gray-400 mb-4 capitalize">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {CAL_DAYS.map(d => <div key={d} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>)}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 text-center">
            {w.map((d, di) => {
              const isToday = d === today;
              const statut = d !== null ? rdvMap.get(d) : undefined;
              const hasRdv = !!statut;
              const lightC = statut ? (STATUS_COLORS[statut] || STATUS_COLORS.EN_ATTENTE) : null;
              const darkC  = statut ? (STATUS_COLORS_DARK[statut] || STATUS_COLORS_DARK.EN_ATTENTE) : null;
              return (
                <div key={di} className={`
                  text-sm py-1.5 font-semibold rounded-xl transition-colors
                  ${!d ? 'text-transparent' : ''}
                  ${isToday ? 'bg-[#0059B2] text-white shadow-md dark:bg-blue-500' : ''}
                  ${hasRdv && !isToday && !isDark ? `${lightC!.bg} ${lightC!.text} ring-1 ${lightC!.ring}` : ''}
                  ${hasRdv && !isToday && isDark  ? `${darkC!.bg} ${darkC!.text} ring-1 ${darkC!.ring}` : ''}
                  ${!isToday && !hasRdv && d ? 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer' : ''}
                `}>
                  {d ?? ''}
                  {hasRdv && !isToday && <div className={`w-1 h-1 ${lightC!.dot} rounded-full mx-auto mt-0.5`} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#0059B2]"/><span className="text-xs text-gray-500 dark:text-gray-400">Aujourd'hui</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/><span className="text-xs text-gray-500 dark:text-gray-400">Confirmé</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/><span className="text-xs text-gray-500 dark:text-gray-400">En attente</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><span className="text-xs text-gray-500 dark:text-gray-400">Annulé</span></div>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [providerProfile, setProviderProfile] = useState<any>(null);
  
  // Real data state
  const [stats, setStats] = useState({ revenus: 0, rdvThisMonth: 0, noteMoyenne: 0, totalClients: 0, clientsThisMonth: 0, rdvEnAttente: 0, rdvDaysThisMonth: [] as RdvDay[] });
  const [areaData, setAreaData] = useState<AreaChartData[]>([]);
  const [barData, setBarData] = useState<BarChartData[]>([]);
  const [donutData, setDonutData] = useState<DonutChartData[]>([]);
  const [topServices, setTopServices] = useState<{ name: string; count: number; revenue: number }[]>([]);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const prof = await getMyProviderProfile();
      setProviderProfile(prof);

      const statsData = await getStats(prof.id);
      setStats({
        revenus: statsData.revenus || 0,
        rdvThisMonth: statsData.rdvThisMonth || 0,
        noteMoyenne: statsData.noteMoyenne || 0,
        totalClients: statsData.totalClients || 0,
        clientsThisMonth: statsData.clientsThisMonth || 0,
        rdvEnAttente: statsData.rdvEnAttente || 0,
        rdvDaysThisMonth: statsData.rdvDaysThisMonth || [],
      });
      if (statsData.areaData) setAreaData(statsData.areaData);
      if (statsData.barData) setBarData(statsData.barData);
      if (statsData.donutData) setDonutData(statsData.donutData);
      if (statsData.topServices) setTopServices(statsData.topServices);

      const apptsRes = await api.get(`/RendezVous/prestataire/${prof.id}`);
      setAppointments(apptsRes.data);
    } catch (error) {
      console.error("Error loading provider dashboard data:", error);
      toast.error("Erreur lors du chargement des statistiques.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await api.put(`/RendezVous/${id}/accept`);
      toast.success("Rendez-vous accepté !");
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'acceptation.");
    }
  };

  const handleRefuse = async (id: number) => {
    try {
      await api.put(`/RendezVous/${id}/refuse`);
      toast.success("Rendez-vous refusé !");
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du refus.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#0059B2] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Chargement du dashboard...</p>
      </div>
    );
  }

  const pendingRequests = appointments.filter(a => a.statut === "EN_ATTENTE");
  const upcomingAppts = appointments
    .filter(a => a.statut === "ACCEPTE" && new Date(a.dateDebut) >= new Date())
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .slice(0, 5)
    .map(appt => {
      const d = new Date(appt.dateDebut);
      return {
        name: appt.client?.nomComplet || "Client",
        date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        service: appt.service?.nom || "Consultation"
      };
    });

  const recentRequests = appointments.slice(0, 5).map(appt => {
    const d = new Date(appt.dateDebut);
    return {
      id: appt.idRendezVous,
      name: appt.client?.nomComplet || "Client",
      date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      service: appt.service?.nom || "Service",
      status: appt.statut === "EN_ATTENTE" ? "En attente" : appt.statut === "ACCEPTE" ? "Confirmé" : appt.statut === "REFUSE" ? "Refusé" : appt.statut === "TERMINE" ? "Terminé" : "Annulé",
      statusCode: appt.statut
    };
  });

  return (
    <div className="relative min-h-screen">
      <div className="relative z-0 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl text-[#0f2a5e] dark:text-white mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            Vue d'ensemble
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Analysez vos performances et gérez votre activité.</p>
        </motion.div>

        {/* KPI CARDS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
        <KpiCard dark icon={<BarChart2 size={24} className="text-white" />} label="Revenus ce mois" value={`${stats.revenus.toLocaleString('fr-FR')} MAD`} />
          <KpiCard icon={<Calendar size={24} className="text-[#0059B2] dark:text-blue-400" />} label="RDV ce mois" value={stats.rdvThisMonth.toString()} />
          <KpiCard icon={<Users size={24} className="text-emerald-600 dark:text-emerald-400" />} label="Clients ce mois" value={stats.clientsThisMonth.toString()} />
          <KpiCard icon={<Star size={24} className="text-yellow-600 dark:text-yellow-400" />} label="Note moyenne" value={stats.noteMoyenne ? stats.noteMoyenne.toFixed(1) : 'N/A'} />
        </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* AREA CHART */}
        <Card className="lg:col-span-2" delay={0.3}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Évolution mensuelle</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Rendez-vous vs Revenus (K)</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><MoreHorizontal size={20}/></button>
          </div>
          <AreaChartSVG data={areaData} />
        </Card>

        {/* TOP SERVICES */}
        <Card delay={0.4}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Top services</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Les plus demandés</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Award size={18} className="text-[#0059B2] dark:text-blue-400" />
            </div>
          </div>
          {topServices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun service réservé pour l'instant.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {topServices.map((svc, i) => {
                const maxCount = topServices[0]?.count || 1;
                const pct = Math.round((svc.count / maxCount) * 100);
                const medals = ['🥇','🥈','🥉'];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{medals[i] ?? ''}</span>
                        <span className="text-sm font-bold text-[#0f2a5e] dark:text-white truncate max-w-[130px]">{svc.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#0059B2] dark:text-blue-400">{svc.count} RDV</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: i === 0 ? '#0059B2' : i === 1 ? '#60a5fa' : '#bfdbfe' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* RECENT APPOINTMENTS TABLE */}
          <Card className="flex-1" delay={0.5}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Demandes récentes</h3>
              <button className="text-[#0059B2] dark:text-blue-400 text-sm font-bold hover:underline bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl transition-colors" onClick={() => navigate('/Mes-Rendez-Vous-Provider') }>Voir tout</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">
                    <th className="pb-4 font-semibold pl-2">Client</th>
                    <th className="pb-4 font-semibold">Date & Heure</th>
                    <th className="pb-4 font-semibold">Statut</th>
                    <th className="pb-4 font-semibold text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-white/60 dark:hover:bg-[#1A1D24]/80 transition-all duration-300">
                      <td className="py-5 pl-2 font-bold text-sm text-[#0f2a5e] dark:text-white">{req.name}<div className="text-xs text-gray-500 font-medium mt-1">{req.service}</div></td>
                      <td className="py-5 text-sm text-gray-600 dark:text-gray-300 font-medium">{req.date}<br/><span className="text-xs text-gray-400 mt-1 block">{req.time}</span></td>
                      <td className="py-5">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                          req.statusCode === "EN_ATTENTE" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          req.statusCode === "ACCEPTE" ? "bg-blue-100 text-[#0059B2] dark:bg-blue-900/30 dark:text-blue-400" :
                          req.statusCode === "TERMINE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-5 text-right pr-2">
                        {req.statusCode === "EN_ATTENTE" ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleAccept(req.id)} className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"><CheckCircle2 size={18} /></button>
                            <button onClick={() => handleRefuse(req.id)} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"><XCircle size={18} /></button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {recentRequests.length === 0 && (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-500 text-sm font-medium">Aucune demande récente.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* DONUT CHART */}
          <Card delay={0.6}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Répartition</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Par statut des rendez-vous</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><MoreHorizontal size={20}/></button>
            </div>
            <div className="flex items-center justify-between gap-8">
              <div className="w-1/2 flex justify-center"><DonutChartSVG data={donutData} /></div>
              <div className="w-1/2 flex flex-col gap-4">
                {donutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                    <div className="flex-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      {d.name === 'EN_ATTENTE' ? 'En attente' : d.name === 'ACCEPTE' ? 'Accepté' : d.name === 'TERMINE' ? 'Terminé' : d.name === 'ANNULE' ? 'Annulé' : d.name === 'REFUSE' ? 'Refusé' : d.name}
                    </div>
                    <div className="text-sm font-bold text-[#0f2a5e] dark:text-white">{d.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* SIDE CALENDAR & UPCOMING */}
        <div className="flex flex-col gap-8">
          <Card delay={0.7}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Calendrier</h3>
              <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><MoreHorizontal size={18} className="text-gray-500"/></button>
            </div>
            <DynamicCalendar rdvDays={stats.rdvDaysThisMonth} />
          </Card>

          <Card className="flex-1" delay={0.8}>
            <h3 className="text-2xl text-[#0f2a5e] dark:text-white mb-6" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>À venir</h3>
            <div className="flex flex-col gap-5">
              {upcomingAppts.map((appt, i) => (
                <div key={i} className="flex items-start gap-4 p-3 -mx-3 rounded-2xl cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 hover:shadow-sm border border-transparent hover:border-blue-100/50 dark:hover:border-blue-800/30 transition-all duration-300 group">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#0059B2] dark:text-blue-400 flex flex-col items-center justify-center shadow-sm group-hover:bg-[#0059B2] group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-all duration-300">
                      <span className="font-bold text-lg leading-none">{appt.date.split(' ')[0]}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{appt.date.split(' ')[1]}</span>
                    </div>
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-[#0f2a5e] dark:text-white text-base group-hover:text-[#0059B2] dark:group-hover:text-blue-400 transition-colors">
                        {appt.name}
                      </h4>
                      <span className="text-xs font-bold text-[#0059B2] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-lg">
                        {appt.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{appt.service}</p>
                  </div>
                </div>
              ))}
              {upcomingAppts.length === 0 && (
                <p className="text-sm text-gray-500 font-medium text-center py-6 bg-gray-50 dark:bg-white/5 rounded-2xl">Aucun rendez-vous à venir.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard;