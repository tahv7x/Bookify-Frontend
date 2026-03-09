import React, { useState } from 'react';
import Navbar from '../../components/Provider/Navbar';
import TopBar from '../../components/Provider/TopBar';
import Footer from '../../components/Provider/Footer';
import {
  BarChart2, Users, Star, Calendar, TrendingUp,
  MoreHorizontal, AlignJustify, CheckCircle2, XCircle
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────
const areaData = [
  { month: "SEP", v1: 6,  v2: 3  },
  { month: "OCT", v1: 8,  v2: 5  },
  { month: "NOV", v1: 14, v2: 8  },
  { month: "DEC", v1: 10, v2: 6  },
  { month: "JAN", v1: 8,  v2: 4  },
  { month: "FEV", v1: 13, v2: 9  },
];
const barData = [
  { day: "L", v: 18 }, { day: "M", v: 28 }, { day: "M", v: 22 },
  { day: "J", v: 32 }, { day: "V", v: 25 }, { day: "S", v: 12 },
  { day: "D", v: 8  },
];
const pieData = [
  { name: "Accepter",   value: 63, color: "#1e3a8a" },
  { name: "Refuser",    value: 25, color: "#93c5fd" },
  { name: "En attente", value: 12, color: "#dbeafe" },
];
const pendingRequests = [
  "Khalid Ibnchahboune",
  "Youssef Titiou",
  "Nossair Zaatout",
  "Yassine Anaianai",
  "Amine El Jaoui",
];
const upcomingAppts = [
  { name: "Yassir El ghazi",  date: "24.Jan.2026",  time: "10:00AM", service: "Consultation"        },
  { name: "Hafsa bara",       date: "8.Fev.2026",   time: "02:00PM", service: "Visite"              },
  { name: "Hassan Bara",      date: "10.Fev.2026",  time: "11:30AM", service: "Traitement"          },
  { name: "Yassine Aniyanya", date: "15.Fev.2026",  time: "03:30PM", service: "Consultation online" },
  { name: "Reda Jamali",      date: "31.Mars.2026", time: "05:00PM", service: "Consultation"        },
];
const recentRequests = [
  { name: "Aya Eddahmani",  date: "26 Mars 2025",  service: "Consultation"        },
  { name: "Hassbi taha",    date: "17 Avril 2024",  service: "Visite"              },
  { name: "Marwa Habchi",   date: "19 Fev 2025",   service: "Consultation online" },
  { name: "Abouali Amine",  date: "15 Juin 2025",  service: "Consultation"        },
];

// ─── CALENDAR ────────────────────────────────────────────────────────────────
const CAL_DAYS  = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const CAL_WEEKS = [
  [28,29,30,31, 1, 2, 3],
  [ 4, 5, 6, 7, 8, 9,10],
  [11,12,13,14,15,16,17],
  [18,19,20,21,22,23,24],
  [25,26,27,28,29,30, 1],
  [ 2, 3, 4, 5, 6, 7, 8],
];
const CAL_RANGE = [27,28,29,30];

// ─── KPI CARD ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  dark?: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, dark }) => (
  <div className={`rounded-2xl p-4 flex items-center gap-3 shadow-sm ${dark ? 'bg-[#1e3a8a]' : 'bg-white dark:bg-dark-surface'}`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white/10' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
      {icon}
    </div>
    <div>
      <p className={`text-xs mb-0.5 ${dark ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>{label}</p>
      <p className={`text-xl font-extrabold leading-none ${dark ? 'text-white' : 'text-[#0f2a5e] dark:text-white'}`}>{value}</p>
    </div>
  </div>
);

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-dark-surface rounded-2xl shadow-sm p-5 ${className}`}>
    {children}
  </div>
);

// ─── SVG AREA CHART ──────────────────────────────────────────────────────────
const AreaChartSVG: React.FC = () => {
  const W = 340, H = 120, pad = { t: 10, r: 10, b: 24, l: 28 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const maxV = 16;
  const pts = (key: 'v1' | 'v2') =>
    areaData.map((d, i) => ({
      x: pad.l + (i / (areaData.length - 1)) * iW,
      y: pad.t + iH - (d[key] / maxV) * iH,
    }));
  const toPath = (pts: {x:number;y:number}[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const toArea = (pts: {x:number;y:number}[]) =>
    `${toPath(pts)} L${(pad.l+iW).toFixed(1)},${(pad.t+iH).toFixed(1)} L${pad.l},${(pad.t+iH).toFixed(1)} Z`;

  const p1 = pts('v1'), p2 = pts('v2');
  const lastP1 = p1[p1.length - 1];
  const midIdx = areaData.findIndex(d => d.v1 === 14);
  const midP1 = p1[midIdx];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 130 }}>
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

      {/* Grid lines */}
      {[0,0.25,0.5,0.75,1].map((t,i) => (
        <line key={i}
          x1={pad.l} y1={(pad.t + t*iH).toFixed(1)}
          x2={pad.l+iW} y2={(pad.t + t*iH).toFixed(1)}
          stroke="#f3f4f6" strokeWidth="1"
        />
      ))}

      {/* Areas */}
      <path d={toArea(p2)} fill="url(#svgG2)"/>
      <path d={toArea(p1)} fill="url(#svgG1)"/>

      {/* Lines */}
      <path d={toPath(p2)} fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round"/>
      <path d={toPath(p1)} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinejoin="round"/>

      {/* Tooltip bubble on peak */}
      <rect x={midP1.x-14} y={midP1.y-22} width="28" height="18" rx="5" fill="#1e3a8a"/>
      <text x={midP1.x} y={midP1.y-9} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">14</text>
      <polygon points={`${midP1.x-4},${midP1.y-4} ${midP1.x+4},${midP1.y-4} ${midP1.x},${midP1.y}`} fill="#1e3a8a"/>

      {/* Dot on last v1 */}
      <circle cx={lastP1.x} cy={lastP1.y} r="4" fill="white" stroke="#1e3a8a" strokeWidth="2"/>

      {/* X axis labels */}
      {areaData.map((d, i) => (
        <text key={i}
          x={(pad.l + (i/(areaData.length-1))*iW).toFixed(1)}
          y={H - 6}
          textAnchor="middle" fill="#9ca3af" fontSize="9"
        >{d.month}</text>
      ))}

      {/* Y axis labels */}
      {[0,8,16].map((v,i) => (
        <text key={i}
          x={pad.l - 4}
          y={(pad.t + iH - (v/maxV)*iH + 3).toFixed(1)}
          textAnchor="end" fill="#9ca3af" fontSize="9"
        >{v}</text>
      ))}
    </svg>
  );
};

// ─── SVG BAR CHART ───────────────────────────────────────────────────────────
const BarChartSVG: React.FC = () => {
  const W = 280, H = 110, pad = { t: 5, r: 5, b: 20, l: 24 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const maxV = 35;
  const barW = iW / barData.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
      {barData.map((d, i) => {
        const bH = (d.v / maxV) * iH;
        const x  = pad.l + i * barW + barW * 0.2;
        const y  = pad.t + iH - bH;
        const fill = i === 3 ? "#1e3a8a" : i < 3 ? "#93c5fd" : "#bfdbfe";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW*0.6} height={bH} rx="3" fill={fill}/>
            <text x={x + barW*0.3} y={H-5} textAnchor="middle" fill="#9ca3af" fontSize="9">{d.day}</text>
          </g>
        );
      })}
      {[0,0.5,1].map((t,i)=>(
        <text key={i} x={pad.l-3} y={(pad.t + (1-t)*iH + 3).toFixed(1)} textAnchor="end" fill="#9ca3af" fontSize="9">
          {Math.round(t*maxV)}
        </text>
      ))}
    </svg>
  );
};

// ─── SVG DONUT CHART ─────────────────────────────────────────────────────────
const DonutChartSVG: React.FC = () => {
  const cx = 70, cy = 65, r = 48, ir = 30;
  let angle = -Math.PI / 2;
  const arcs = pieData.map(d => {
    const sweep = (d.value / 100) * 2 * Math.PI;
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
      d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${ir},${ir} 0 ${large},0 ${ix2.toFixed(2)},${iy2.toFixed(2)} Z`,
      color: d.color,
    };
  });

  return (
    <svg viewBox="0 0 140 130" className="w-full" style={{ height: 130 }}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} stroke="white" strokeWidth="2"/>
      ))}
    </svg>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [userName] = useState('');
  const [activeSection, setActiveSection] = useState<string>('dashboardp');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      {isSidebarOpen && <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={()=>setIsSidebarOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen?'translate-x-0':'-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s=>{setActiveSection(s);setIsSidebarOpen(false);}}/>
      </div>

      <main className={`min-h-screen transition-all duration-300 lg:${isSidebarOpen?'ml-64':'ml-0'}`}>
        <TopBar userName={userName} onMenuToggle={()=>setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen}/>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">


          {/* Title */}
          <h1 className="text-xl md:text-2xl font-extrabold text-[#0f2a5e] dark:text-white">
            Prestataires Dashboard
          </h1>

          {/* ── KPI CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <KpiCard label="Clients qui click profile" value="228"
              icon={<BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400"/>}
            />
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <img src="https://i.pravatar.cc/44?img=12" className="w-11 h-11 rounded-full border-2 border-gray-100 flex-shrink-0" alt="avatar"/>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Rendez-vous</p>
                <p className="text-2xl font-extrabold text-[#0f2a5e] dark:text-white leading-none">50</p>
              </div>
            </div>
            <KpiCard label="Votre Note" value="4.5"
              icon={<Star className="w-5 h-5 text-blue-600 dark:text-blue-400"/>}
            />
            <KpiCard label="Total Clients" value="54" 
              icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400"/>}
            />
            <KpiCard label="Total Rendez-vous" value="70"
              icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400"/>}
            />
          </div>

          {/* ── ROW 2: Area | Pending | Calendar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Area Chart */}
            <Card className="lg:col-span-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Total Visiteur de profil</p>
                  <h2 className="text-lg font-extrabold text-[#0f2a5e] dark:text-white">Rendez-vous</h2>
                  <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>
                    On track <span className="text-gray-400 font-normal ml-1">↗ +2.45%</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5"/>
                  Cette Jour
                </div>
              </div>
              <AreaChartSVG/>
            </Card>

            {/* Pending */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#0f2a5e] dark:text-white">
                  Demandes en attente ({pendingRequests.length})
                </h3>
                <MoreHorizontal className="w-4 h-4 text-gray-400"/>
              </div>
              {pendingRequests.map((name, i) => (
                <div key={i} className={`flex justify-between items-center py-2.5 ${i < pendingRequests.length-1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                  <AlignJustify className="w-3.5 h-3.5 text-gray-300"/>
                </div>
              ))}
            </Card>

            {/* Calendar */}
            <Card>
              <div className="flex justify-between items-center mb-3">
                <button className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">April ▾</button>
                <button className="text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">2025 ▾</button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {CAL_DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>
              {CAL_WEEKS.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((day, di) => {
                    const isToday = day === 30 && wi === 4;
                    const inRange = CAL_RANGE.includes(day) && wi >= 3 && wi <= 4 && !isToday;
                    const isGray  = (wi === 0 && day > 10) || (wi === 5 && day < 10);
                    return (
                      <div key={di} className={`text-center text-[11px] py-1.5 rounded-md cursor-pointer
                        ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
                        ${inRange ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : ''}
                        ${isGray  ? 'text-gray-300 dark:text-gray-600' : !isToday && !inRange ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                      `}>{day}</div>
                    );
                  })}
                </div>
              ))}
            </Card>
          </div>

          {/* ── ROW 3: Bar | Pie | Upcoming ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Bar */}
            <Card>
              <div className="mb-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">Rendez-vous cette semaine</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0f2a5e] dark:text-white">29</span>
                  <span className="text-xs font-semibold text-green-500 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3"/> +34.54%
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Clients</p>
              </div>
              <BarChartSVG/>
            </Card>

            {/* Pie */}
            <Card>
              <div className="flex justify-between mb-1">
                <h3 className="text-sm font-bold text-[#0f2a5e] dark:text-white">Taux d'acceptation</h3>
                <span className="text-xs text-gray-400">Monthly ▾</span>
              </div>
              <DonutChartSVG/>
              <div className="flex justify-center gap-3 mt-1 flex-wrap">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }}/>
                    <span className="text-gray-500 dark:text-gray-400">{d.name}</span>
                    <span className="font-bold text-[#0f2a5e] dark:text-white">{d.value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming */}
            <Card>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-[#0f2a5e] dark:text-white">Prochains rendez-vous</h3>
                <MoreHorizontal className="w-4 h-4 text-gray-400"/>
              </div>
              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-50 dark:border-gray-800">
                {["Nom","Date","Heure","Service"].map(h => (
                  <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
                ))}
              </div>
              {upcomingAppts.map((appt, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 items-center">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{appt.name}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{appt.date}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{appt.time}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{appt.service}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* ── RECENT REQUESTS TABLE ── */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#0f2a5e] dark:text-white">Demandes récentes</h3>
              <MoreHorizontal className="w-4 h-4 text-gray-400"/>
            </div>
            <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              {["NAME","DATE","SERVICE","ACTION"].map(h => (
                <p key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</p>
              ))}
            </div>
            {recentRequests.map((req, i) => (
              <div key={i} className={`grid grid-cols-4 gap-4 py-3.5 items-center ${i < recentRequests.length-1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{req.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{req.date}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{req.service}</span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5"/> Accepter
                  </button>
                  <button className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    <XCircle className="w-3.5 h-3.5"/> Refuser
                  </button>
                </div>
              </div>
            ))}
          </Card>

        </div>

        <Footer/>
      </main>
    </div>
  );
};

export default Dashboard;