import React, { useEffect, useState } from 'react';
import {
  BarChart2, Users, Star, Calendar, TrendingUp,
  MoreHorizontal, AlignJustify, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { getMyProviderProfile } from '../../services/provider/providerService';
import { getStats } from '../../services/provider/getStats';
import api from '../../services/api';
import toast from 'react-hot-toast';
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
  let angle = -Math.PI / 2;
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const arcs = data.map(d => {
    const sweep = total === 0 ? 0 : (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const ix1 = cx + ir * Math.cos(angle);
    const iy1 = cy + ir * Math.sin(angle);
    const ix2 = cx + ir * Math.cos(angle - sweep);
    const iy2 = cy + ir * Math.sin(angle - sweep);
    const large = sweep > Math.PI ? 1 : 0;
    return {
      d: sweep === 0 ? "" : `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${ir},${ir} 0 ${large},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z`,
      color: d.color,
    };
  });

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

// ─── CALENDAR (Static for visual) ─────────────────────────────────────────────
const CAL_DAYS  = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const CAL_WEEKS = [
  [28,29,30,31, 1, 2, 3],
  [ 4, 5, 6, 7, 8, 9,10],
  [11,12,13,14,15,16,17],
  [18,19,20,21,22,23,24],
  [25,26,27,28,29,30, 1],
];
const CAL_RANGE = [27,28,29,30];

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [providerProfile, setProviderProfile] = useState<any>(null);
  
  // Real data state
  const [stats, setStats] = useState({ revenus: 0, rdvToday: 0 });
  const [areaData, setAreaData] = useState<AreaChartData[]>([]);
  const [barData, setBarData] = useState<BarChartData[]>([]);
  const [donutData, setDonutData] = useState<DonutChartData[]>([]);
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const prof = await getMyProviderProfile();
      setProviderProfile(prof);

      const statsData = await getStats(prof.id);
      setStats({ revenus: statsData.revenus || 0, rdvToday: statsData.rdvToday || 0 });
      if (statsData.areaData) setAreaData(statsData.areaData);
      if (statsData.barData) setBarData(statsData.barData);
      if (statsData.donutData) setDonutData(statsData.donutData);

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

  const pendingRequests = appointments.filter(a => a.statut === "EN_ATTENTE").map(a => a.client.nomComplet);
  const upcomingAppts = appointments
    .filter(a => a.statut === "ACCEPTE" && new Date(a.dateDebut) >= new Date())
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
          <KpiCard dark icon={<BarChart2 size={24} className="text-white" />} label="Revenus (Mois)" value={`${stats.revenus} MAD`} />
          <KpiCard icon={<Users size={24} className="text-[#0059B2] dark:text-blue-400" />} label="Rendez-vous" value={stats.rdvToday.toString()} />
          <KpiCard icon={<Calendar size={24} className="text-emerald-600 dark:text-emerald-400" />} label="En attente" value={pendingRequests.length.toString()} />
          <KpiCard icon={<Star size={24} className="text-yellow-600 dark:text-yellow-400" />} label="Note Globale" value={providerProfile?.note?.toFixed(1) || "N/A"} />
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

        {/* BAR CHART */}
        <Card delay={0.4}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Cette semaine</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Nbr. de rendez-vous</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors"><MoreHorizontal size={20}/></button>
          </div>
          <BarChartSVG data={barData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* RECENT APPOINTMENTS TABLE */}
          <Card className="flex-1" delay={0.5}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Demandes récentes</h3>
              <button className="text-[#0059B2] dark:text-blue-400 text-sm font-bold hover:underline bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl transition-colors">Voir tout</button>
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
                    <div className="flex-1 text-sm text-gray-600 dark:text-gray-300 font-medium">{d.name}</div>
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
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {CAL_DAYS.map(d => <div key={d} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{d}</div>)}
            </div>
            <div className="flex flex-col gap-2">
              {CAL_WEEKS.map((w, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1 text-center">
                  {w.map((d, di) => {
                    const isRange = CAL_RANGE.includes(d);
                    const isStart = d === CAL_RANGE[0];
                    const isEnd = d === CAL_RANGE[CAL_RANGE.length - 1];
                    return (
                      <div key={di} className={`
                        text-sm py-2 font-semibold transition-colors cursor-pointer rounded-xl
                        ${(isStart || isEnd) 
                          ? 'bg-[#0059B2] text-white shadow-md dark:bg-blue-500 dark:text-white' 
                          : isRange 
                            ? 'bg-blue-50 text-[#0059B2] dark:bg-blue-900/30 dark:text-blue-400' 
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'}
                      `}>
                        {d}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1" delay={0.8}>
            <h3 className="text-2xl text-[#0f2a5e] dark:text-white mb-6" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>À venir</h3>
            <div className="flex flex-col gap-5">
              {upcomingAppts.map((appt, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-white/60 dark:hover:bg-[#1A1D24]/80 transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#0059B2] dark:text-blue-400 flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:-translate-y-0.5">
                      {appt.time.split(':')[0]}
                    </div>
                    {i !== upcomingAppts.length - 1 && <div className="w-px h-full bg-gray-100 dark:bg-white/5 my-2" />}
                  </div>
                  <div className="pt-1 pb-5 flex-1 border-b border-gray-50 dark:border-white/5 group-last:border-0 group-last:pb-1">
                    <p className="text-base font-bold text-[#0f2a5e] dark:text-white group-hover:text-[#0059B2] transition-colors">{appt.name}</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">{appt.service}</p>
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