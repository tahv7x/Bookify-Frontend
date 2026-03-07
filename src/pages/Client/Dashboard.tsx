import React, { useEffect, useState } from 'react';
import { Calendar, MoreVertical, Upload, CheckCircle, Clock, TrendingUp, Activity, Star, ArrowUpRight, ArrowDownRight, Stethoscope, Heart, Brain } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';

interface Appointment { name:string; specialty:string; date:string; time:string; status:string; statusType:'refused'|'accepted'|'waiting'; }
interface HistoryItem { name:string; specialty:string; time:string; avatar:string; }
interface StatusBadgeProps { status:string; statusType:'refused'|'accepted'|'waiting'; }

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const appointments: Appointment[] = [
    { name:"Youssef Tijani",  specialty:"Dentiste",    date:"21 Décembre 2025", time:"02:00PM", status:"Refusé",    statusType:"refused"  },
    { name:"Boutnaame Amin",  specialty:"Cardio",      date:"17 novembre 2025", time:"06:00PM", status:"En attente",statusType:"waiting"  },
    { name:"Adam Massik",     specialty:"Psychologue", date:"25 Fevrier 2025",  time:"10:00AM", status:"En attente",statusType:"waiting"  },
    { name:"Mohamed noldi",   specialty:"Docteur",     date:"31 Janvier 2025",  time:"11:30AM", status:"Accepté",   statusType:"accepted" }
  ];

  const recentHistory: HistoryItem[] = [
    { name:"Mohamed Taher",  specialty:"Dentiste", time:"il y a 2j", avatar:"https://i.pravatar.cc/150?img=12" },
    { name:"Najm Yussef",    specialty:"Dentiste", time:"il y a 3j", avatar:"https://i.pravatar.cc/150?img=33" },
    { name:"Boutnaame Amin", specialty:"Docteur",  time:"il y a 5j", avatar:"https://i.pravatar.cc/150?img=14" }
  ];

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) { try { const u=JSON.parse(s); setUserName(u.nom||u.nomComplet||""); } catch(e){} }
  }, []);

  /* ── STATUS BADGE ── */
  const StatusBadge: React.FC<StatusBadgeProps> = ({ status, statusType }) => {
    const cfg = {
      refused:  { bg:'bg-red-100 dark:bg-red-500/15',        text:'text-red-600 dark:text-red-400',        iconBg:'bg-red-200 dark:bg-red-500/25',        icon:'✕' },
      accepted: { bg:'bg-emerald-100 dark:bg-emerald-500/15', text:'text-emerald-600 dark:text-emerald-400', iconBg:'bg-emerald-200 dark:bg-emerald-500/25', icon:'✓' },
      waiting:  { bg:'bg-yellow-100 dark:bg-yellow-500/15',   text:'text-yellow-600 dark:text-yellow-400',   iconBg:'bg-yellow-200 dark:bg-yellow-500/25',   icon:'⏱' },
    }[statusType];
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        <div className={`w-4 h-4 rounded-full ${cfg.iconBg} flex items-center justify-center text-[10px]`}>{cfg.icon}</div>
        {status}
      </div>
    );
  };

  /* ── STAT CARD (dark-aware, no external component needed) ── */
  const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, trend, trendUp }: any) => (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-dark-muted font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-0.5">{value}</p>
      </div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-emerald-500' : 'text-red-400'}`}>
          {trendUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}{trend}
        </div>
      )}
    </div>
  );

  const specialists = [
    { name:'Dr. Fatima Zahra',  specialty:'Cardiologue',  rating:4.9, next:'Demain 09:00', avatar:'https://i.pravatar.cc/150?img=47', color:'#ec4899', icon:Heart },
    { name:'Dr. Karim Idrissi', specialty:'Neurologue',   rating:4.7, next:'Lun 14:30',    avatar:'https://i.pravatar.cc/150?img=68', color:'#8b5cf6', icon:Brain },
    { name:'Dr. Amina Berrada', specialty:'Généraliste',  rating:4.8, next:'Mar 10:00',    avatar:'https://i.pravatar.cc/150?img=32', color:'#0891b2', icon:Stethoscope },
  ];

  const healthTips = [
    { tip:"Buvez 8 verres d'eau par jour", icon:'💧' },
    { tip:'30 min de marche quotidienne recommandée', icon:'🚶' },
    { tip:'Dormez entre 7 et 9 heures par nuit', icon:'😴' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; }
        @keyframes slideInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .anim-up{animation:slideInUp .5s cubic-bezier(.16,1,.3,1) both;}
        .anim-right{animation:slideInRight .5s cubic-bezier(.16,1,.3,1) both;}
        .stat-card{animation:slideInUp .5s cubic-bezier(.16,1,.3,1) both;}
        .stat-card:nth-child(1){animation-delay:.05s} .stat-card:nth-child(2){animation-delay:.1s} .stat-card:nth-child(3){animation-delay:.15s}
        .appointment-row{animation:slideInUp .5s cubic-bezier(.16,1,.3,1) both;transition:transform .2s ease;}
        .appointment-row:nth-child(1){animation-delay:.3s} .appointment-row:nth-child(2){animation-delay:.4s}
        .appointment-row:nth-child(3){animation-delay:.5s} .appointment-row:nth-child(4){animation-delay:.6s}
        .appointment-row:hover{transform:translateX(4px);}
        .history-item{animation:slideInRight .5s cubic-bezier(.16,1,.3,1) both;transition:all .2s ease;}
        .history-item:nth-child(1){animation-delay:.7s} .history-item:nth-child(2){animation-delay:.8s} .history-item:nth-child(3){animation-delay:.9s}
        .history-item:hover{transform:scale(1.02);}
        .upload-icon{animation:float 3s ease-in-out infinite;}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards;}
      `}</style>

      {isSidebarOpen && <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={()=>setIsSidebarOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen?'translate-x-0':'-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s=>{setActiveSection(s);setIsSidebarOpen(false);}}/>
      </div>

      <main className="min-h-screen">
        <TopBar userName={userName} onMenuToggle={()=>setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen}/>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card"><StatCard icon={Calendar}    iconBg="bg-blue-100 dark:bg-blue-500/15"    iconColor="text-blue-600 dark:text-blue-400"    label="Total Rendez-vous"     value="17" trend="+3" trendUp={true}/></div>
            <div className="stat-card"><StatCard icon={CheckCircle} iconBg="bg-pink-100 dark:bg-pink-500/15"    iconColor="text-pink-600 dark:text-pink-400"    label="Rendez-vous confirmés" value="12" trend="+1" trendUp={true}/></div>
            <div className="stat-card"><StatCard icon={Clock}       iconBg="bg-cyan-100 dark:bg-cyan-500/15"    iconColor="text-cyan-600 dark:text-cyan-400"    label="En attente"            value="5"  trend="-2" trendUp={false}/></div>
          </div>

          {/* ── ROW 1 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Appointments */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-up" style={{animationDelay:'.1s'}}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text">Prochains rendez-vous</h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text transition-colors"><MoreVertical size={20}/></button>
              </div>
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-4 gap-4 px-3 py-2 text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider">
                  <div>Nom</div><div>Date</div><div>Heure</div><div>Statut</div>
                </div>
                {appointments.map((apt,idx)=>(
                  <div key={idx} className="appointment-row bg-gray-50 dark:bg-dark-bg rounded-xl p-3 sm:p-4">
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-start justify-between">
                        <div><p className="font-semibold text-gray-900 dark:text-dark-text text-sm">{apt.name}</p><p className="text-xs text-gray-500 dark:text-dark-muted">{apt.specialty}</p></div>
                        <StatusBadge status={apt.status} statusType={apt.statusType}/>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-dark-muted"><span>{apt.date}</span><span className="font-medium">{apt.time}</span></div>
                    </div>
                    <div className="hidden sm:grid grid-cols-4 gap-4 items-center">
                      <div><p className="font-semibold text-gray-900 dark:text-dark-text text-sm">{apt.name}</p><p className="text-xs text-gray-500 dark:text-dark-muted">{apt.specialty}</p></div>
                      <p className="text-sm text-gray-700 dark:text-dark-text">{apt.date}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-dark-text">{apt.time}</p>
                      <StatusBadge status={apt.status} statusType={apt.statusType}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">

              {/* Upload */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-up" style={{animationDelay:'.15s'}}>
                <h3 className="text-base font-bold text-gray-900 dark:text-dark-text mb-3">Uploader un Document</h3>
                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-6 text-center border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 upload-icon">
                    <Upload className="text-blue-600 dark:text-blue-400" size={22}/>
                  </div>
                  <p className="text-gray-900 dark:text-dark-text text-sm font-semibold mb-1">Upload Files</p>
                  <p className="text-gray-400 dark:text-dark-muted text-xs leading-relaxed">Pour une meilleure analyse,<br/>téléchargez vos documents</p>
                </div>
                <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg">Poster</button>
              </div>

              {/* Donut */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-up" style={{animationDelay:'.2s'}}>
                <h3 className="text-base font-bold text-gray-900 dark:text-dark-text mb-4">Catégories Statistiques</h3>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#38bdf8" strokeWidth="36" strokeDasharray="321 440" strokeDashoffset="0"/>
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#334155" strokeWidth="36" strokeDasharray="70 440" strokeDashoffset="-321"/>
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#0c5a7c" strokeWidth="36" strokeDasharray="49 440" strokeDashoffset="-391"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-dark-text">73%</div>
                      <div className="text-[10px] text-gray-500 dark:text-dark-muted leading-tight">Santé<br/>Médicale</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[{color:'bg-cyan-400',label:'Santé Médicale',val:'73%'},{color:'bg-slate-600',label:'Beauté & Bien-être',val:'16%'},{color:'bg-[#0c5a7c]',label:'Services tech.',val:'11%'}].map((item,i)=>(
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${item.color}`}/><span className="text-xs text-gray-600 dark:text-dark-text">{item.label}</span></div>
                      <span className="text-xs font-bold text-gray-900 dark:text-dark-text">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Specialists + History + Tips ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recommended specialists */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-up" style={{animationDelay:'.25s'}}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-dark-text flex items-center gap-2">
                  <Activity size={16} className="text-blue-500"/>Spécialistes recommandés
                </h3>
                <button className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Voir tout</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {specialists.map((sp, i) => {
                  const SpIcon = sp.icon;
                  return (
                    <div key={i} className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 flex flex-col items-center text-center hover:shadow-md dark:hover:shadow-none transition-all cursor-pointer border border-transparent hover:border-blue-100 dark:hover:border-dark-border">
                      <div className="relative mb-3">
                        <img src={sp.avatar} alt={sp.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-dark-surface"/>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{background:sp.color}}>
                          <SpIcon size={11} color="#fff"/>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-dark-text leading-tight">{sp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted mb-2">{sp.specialty}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={10} className="text-yellow-400 fill-yellow-400"/>
                        <span className="text-xs font-semibold text-gray-700 dark:text-dark-text">{sp.rating}</span>
                      </div>
                      <div className="w-full bg-blue-50 dark:bg-blue-500/10 rounded-lg px-2 py-1.5">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{sp.next}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History + Tips */}
            <div className="space-y-5">

              {/* History */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-right" style={{animationDelay:'.3s'}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-dark-text">Historique</h3>
                  <TrendingUp size={15} className="text-gray-400 dark:text-dark-muted"/>
                </div>
                <div className="space-y-2 mb-4">
                  {recentHistory.map((item,idx)=>(
                    <div key={idx} className="history-item flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-dark-bg rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer">
                      <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-dark-text text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted">{item.specialty} · <span className="text-blue-500">{item.time}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all">Voir plus</button>
              </div>

              {/* Health tips */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-right" style={{animationDelay:'.35s'}}>
                <h3 className="text-base font-bold text-gray-900 dark:text-dark-text mb-4">💡 Conseils Santé</h3>
                <div className="space-y-3">
                  {healthTips.map((t,i)=>(
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <span className="text-lg leading-none">{t.icon}</span>
                      <p className="text-xs text-gray-700 dark:text-dark-text font-medium leading-relaxed">{t.tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
        <Footer/>
      </main>
    </div>
  );
};

export default Dashboard;