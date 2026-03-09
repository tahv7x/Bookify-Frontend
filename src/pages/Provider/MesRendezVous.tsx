import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, ChevronRight, X, Check, AlertCircle, Phone, Star, RefreshCw, Plus } from 'lucide-react';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import { useNavigate } from 'react-router-dom';

type Status = 'accepted' | 'waiting' | 'refused' | 'done';
type Tab    = 'all' | 'upcoming' | 'done' | 'refused';

interface Appointment {
  id: number; doctor: string; specialty: string; date: string;
  time: string; location: string; status: Status; rating?: number;
  avatar: string; phone: string;
}

const ALL: Appointment[] = [
  { id:1, doctor:'Dr. Youssef Alami',   specialty:'Dentiste',      date:'21 Jan 2025', time:'02:00 PM', location:'Casablanca, Maarif',   status:'accepted', avatar:'https://i.pravatar.cc/150?img=12', phone:'+212 6 11 22 33 44' },
  { id:2, doctor:'Dr. Sara Bennis',     specialty:'Cardiologue',   date:'17 Fév 2025', time:'06:00 PM', location:'Casablanca, Ain Diab',  status:'waiting',  avatar:'https://i.pravatar.cc/150?img=47', phone:'+212 6 22 33 44 55' },
  { id:3, doctor:'Dr. Ahmed Tazi',      specialty:'Psychologue',   date:'25 Fév 2025', time:'10:00 AM', location:'Casablanca, Gauthier',  status:'refused',  avatar:'https://i.pravatar.cc/150?img=68', phone:'+212 6 33 44 55 66' },
  { id:4, doctor:'Dr. Amina Berrada',   specialty:'Généraliste',   date:'31 Jan 2025', time:'11:30 AM', location:'Casablanca, Bourgogne', status:'done', rating:5, avatar:'https://i.pravatar.cc/150?img=32', phone:'+212 6 44 55 66 77' },
  { id:5, doctor:'Dr. Karim Idrissi',   specialty:'Neurologue',    date:'05 Mar 2025', time:'09:00 AM', location:'Casablanca, Racine',    status:'accepted', avatar:'https://i.pravatar.cc/150?img=15', phone:'+212 6 55 66 77 88' },
  { id:6, doctor:'Dr. Fatima Zahra',    specialty:'Dermatologue',  date:'12 Mar 2025', time:'03:30 PM', location:'Casablanca, CIL',       status:'waiting',  avatar:'https://i.pravatar.cc/150?img=44', phone:'+212 6 66 77 88 99' },
  { id:7, doctor:'Dr. Mohamed Nasri',   specialty:'Ophtalmologue', date:'28 Déc 2024', time:'08:30 AM', location:'Casablanca, Anfa',      status:'done', rating:4, avatar:'https://i.pravatar.cc/150?img=57', phone:'+212 6 77 88 99 00' },
];

const CFG = {
  accepted: { label:'Confirmé',   bg:'bg-emerald-100 dark:bg-emerald-500/15', text:'text-emerald-700 dark:text-emerald-400', dot:'bg-emerald-500', Icon:Check },
  waiting:  { label:'En attente', bg:'bg-yellow-100 dark:bg-yellow-500/15',   text:'text-yellow-700 dark:text-yellow-400',   dot:'bg-yellow-500',  Icon:Clock },
  refused:  { label:'Refusé',     bg:'bg-red-100 dark:bg-red-500/15',         text:'text-red-700 dark:text-red-400',         dot:'bg-red-500',     Icon:X    },
  done:     { label:'Terminé',    bg:'bg-blue-100 dark:bg-blue-500/15',        text:'text-blue-700 dark:text-blue-400',        dot:'bg-blue-500',    Icon:Check },
};

const TABS: { id:Tab; label:string }[] = [
  {id:'all',label:'Tous'},{id:'upcoming',label:'À venir'},{id:'done',label:'Terminés'},{id:'refused',label:'Refusés'}
];

const MesRendezVous: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('mes-rendez-vous');
  const [userName, setUserName]           = useState('');
  const [activeTab, setActiveTab]         = useState<Tab>('all');
  const [search, setSearch]               = useState('');
  const [selectedId, setSelectedId]       = useState<number|null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) { try { const u=JSON.parse(s); setUserName(u.nom||u.nomComplet||''); } catch(e){} }
  }, []);

  const filtered = ALL.filter(a => {
    const matchTab =
      activeTab==='all'      ? true :
      activeTab==='upcoming' ? (a.status==='accepted'||a.status==='waiting') :
      activeTab==='done'     ? a.status==='done' : a.status==='refused';
    const q = search.toLowerCase();
    return matchTab && (a.doctor.toLowerCase().includes(q) || a.specialty.toLowerCase().includes(q));
  });

  const stats = {
    total:    ALL.length,
    upcoming: ALL.filter(a=>a.status==='accepted'||a.status==='waiting').length,
    done:     ALL.filter(a=>a.status==='done').length,
    refused:  ALL.filter(a=>a.status==='refused').length,
  };

  const nextRdv = ALL.find(a=>a.status==='accepted');

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;}
        @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
        @keyframes slideUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards;}
        .anim-up   {animation:slideUp    .45s cubic-bezier(.16,1,.3,1) both;}
        .anim-right{animation:slideRight .45s cubic-bezier(.16,1,.3,1) both;}
        .rdv-row{transition:transform .2s ease,box-shadow .2s ease;}
        .rdv-row:hover{transform:translateX(3px);}
      `}</style>

      {isSidebarOpen && <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={()=>setIsSidebarOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen?'translate-x-0':'-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s=>{setActiveSection(s);setIsSidebarOpen(false);}}/>
      </div>

      <main className="min-h-screen">
        <TopBar userName={userName} onMenuToggle={()=>setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen}/>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-up">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Gérez Votre Rendez-vous</h1>
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">Gérez et suivez tous vos rendez-vous</p>
            </div>
            <button onClick={()=>navigate('/Home-Client')} className="flex items-center gap-2 bg-[#0059B2] hover:bg-[#004a99] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg shrink-0">
              <Plus size={15}/>Nouveau RDV
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-up" style={{animationDelay:'.05s'}}>
            {[
              {label:'Total',    value:stats.total,    color:'text-blue-600 dark:text-blue-400',       bg:'bg-blue-50 dark:bg-blue-500/10',       dot:'bg-blue-500'},
              {label:'À venir',  value:stats.upcoming, color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-500/10', dot:'bg-emerald-500'},
              {label:'Terminés', value:stats.done,     color:'text-gray-700 dark:text-dark-text',      bg:'bg-gray-50 dark:bg-dark-border',        dot:'bg-gray-400'},
              {label:'Refusés',  value:stats.refused,  color:'text-red-600 dark:text-red-400',         bg:'bg-red-50 dark:bg-red-500/10',          dot:'bg-red-500'},
            ].map((s,i)=>(
              <div key={i} className="bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`}/>
                  <span className="text-xs text-gray-500 dark:text-dark-muted font-medium">{s.label}</span>
                </div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* MAIN LAYOUT */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* LEFT: list */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Search + tabs */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-up" style={{animationDelay:'.1s'}}>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5">
                    <Search size={14} className="text-gray-400 dark:text-dark-muted shrink-0"/>
                    <input type="text" placeholder="Médecin ou spécialité..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"
                      className="bg-transparent outline-none text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-muted w-full"/>
                    {search && <button onClick={()=>setSearch('')}><X size={12} className="text-gray-400 hover:text-gray-600"/></button>}
                  </div>
                  <button className="flex items-center gap-2 px-4 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border transition-all font-medium shrink-0">
                    <Filter size={14}/>
                  </button>
                </div>
                <div className="flex gap-1 mt-3 overflow-x-auto pb-0.5">
                  {TABS.map(tab=>{
                    const count = tab.id==='all'?stats.total:tab.id==='upcoming'?stats.upcoming:tab.id==='done'?stats.done:stats.refused;
                    return (
                      <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab===tab.id ? 'bg-[#0059B2] text-white' : 'text-gray-500 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                        }`}>
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab===tab.id?'bg-white/25 text-white':'bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-dark-muted'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-dark-border anim-up">
                  <AlertCircle size={32} className="text-gray-300 dark:text-dark-muted mx-auto mb-3"/>
                  <p className="text-gray-500 dark:text-dark-muted font-medium">Aucun rendez-vous trouvé</p>
                </div>
              ) : filtered.map((appt, idx) => {
                const cfg = CFG[appt.status];
                const SIcon = cfg.Icon;
                const isOpen = selectedId === appt.id;
                return (
                  <div key={appt.id} onClick={()=>setSelectedId(isOpen?null:appt.id)}
                    className={`rdv-row bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border cursor-pointer transition-all duration-200 anim-up ${
                      isOpen ? 'border-[#0059B2] dark:border-blue-500 shadow-md' : 'border-gray-100 dark:border-dark-border hover:border-blue-100 dark:hover:border-dark-border hover:shadow-md'
                    }`}
                    style={{animationDelay:`${.12+idx*.05}s`}}>

                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img src={appt.avatar} alt={appt.doctor} className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-dark-surface"/>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-surface ${cfg.dot}`}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-dark-text text-sm">{appt.doctor}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-muted">{appt.specialty}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}>
                            <SIcon size={9}/>{cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted"><Calendar size={10} className="text-[#0059B2] dark:text-blue-400"/>{appt.date}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted"><Clock size={10} className="text-[#0059B2] dark:text-blue-400"/>{appt.time}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted"><MapPin size={10} className="text-[#0059B2] dark:text-blue-400"/>{appt.location}</span>
                        </div>
                        {appt.rating && (
                          <div className="flex items-center gap-0.5 mt-1.5">
                            {[1,2,3,4,5].map(s=><Star key={s} size={10} className={s<=appt.rating!?'text-yellow-400 fill-yellow-400':'text-gray-200 dark:text-dark-border'}/>)}
                            <span className="text-[10px] text-gray-400 dark:text-dark-muted ml-1">Votre avis</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={15} className={`text-gray-300 dark:text-dark-muted shrink-0 transition-transform duration-200 ${isOpen?'rotate-90 text-blue-500':''}`}/>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex flex-wrap gap-2 anim-up">
                        <a href={`tel:${appt.phone}`} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
                          <Phone size={12}/>Appeler
                        </a>
                        {(appt.status==='accepted'||appt.status==='waiting') && <>
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg text-xs font-semibold hover:bg-yellow-100 transition-all">
                            <RefreshCw size={12}/>Reprogrammer
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all">
                            <X size={12}/>Annuler
                          </button>
                        </>}
                        {appt.status==='done' && !appt.rating && (
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-all">
                            <Star size={12}/>Laisser un avis
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT sidebar */}
            <div className="w-full lg:w-68 shrink-0 space-y-4" style={{width:'272px'}}>

              {/* Next RDV card */}
              <div className="bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] rounded-2xl p-5 text-white shadow-lg anim-right" style={{animationDelay:'.15s'}}>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-3">Prochain rendez-vous</p>
                {nextRdv ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={nextRdv.avatar} alt={nextRdv.doctor} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30"/>
                      <div><p className="font-bold text-sm">{nextRdv.doctor}</p><p className="text-blue-200 text-xs">{nextRdv.specialty}</p></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[{Icon:Calendar,val:nextRdv.date},{Icon:Clock,val:nextRdv.time},{Icon:MapPin,val:nextRdv.location}].map(({Icon,val},i)=>(
                        <div key={i} className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                          <Icon size={12} className="text-blue-200 shrink-0"/><span className="text-sm font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                    <a href={`tel:${nextRdv.phone}`} className="flex items-center justify-center gap-2 bg-white text-[#0059B2] py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
                      <Phone size={13}/>Contacter
                    </a>
                  </>
                ) : <p className="text-sm text-blue-200">Aucun rendez-vous à venir</p>}
              </div>

              {/* Tips */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-right" style={{animationDelay:'.2s'}}>
                <h3 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-3">💡 Conseils</h3>
                <div className="space-y-2.5">
                  {[{e:'⏰',t:'Arrivez 10 min avant votre rendez-vous'},{e:'📋',t:'Apportez vos documents médicaux'},{e:'💊',t:'Listez vos médicaments actuels'}].map((item,i)=>(
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <span className="text-base leading-none">{item.e}</span>
                      <p className="text-xs text-gray-700 dark:text-dark-text font-medium leading-relaxed">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats summary */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-right" style={{animationDelay:'.25s'}}>
                <h3 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-4">📊 Résumé</h3>
                <div className="space-y-3">
                  {[{label:'Taux de confirmation',pct:71,color:'bg-emerald-500'},{label:'RDV complétés',pct:29,color:'bg-blue-500'},{label:'Taux de refus',pct:14,color:'bg-red-400'}].map((item,i)=>(
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-dark-muted">{item.label}</span>
                        <span className="font-bold text-gray-900 dark:text-dark-text">{item.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{width:`${item.pct}%`}}/>
                      </div>
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

export default MesRendezVous;