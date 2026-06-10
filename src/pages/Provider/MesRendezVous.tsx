import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Phone, MessageSquare, Check, X, AlertCircle, Search, Filter, ChevronRight, CheckCircle2, XCircle, ArrowUpRight, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '../../components/Provider/Navbar';
import TopBar from '../../components/Provider/TopBar';
import Footer from '../../components/Provider/Footer';
import { useNavigate } from 'react-router-dom';
import { getMyProviderProfile } from '../../services/provider/providerService';
import api from '../../services/api';
import toast from 'react-hot-toast';

type Status = 'accepted' | 'waiting' | 'refused' | 'done' | 'cancelled';
type Tab    = 'all' | 'pending' | 'accepted' | 'done' | 'refused';

interface Client {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
  telephone: string;
  avatar: string | null;
}

interface Service {
  nom: string;
  prix: number;
}

interface Appointment {
  id: number;
  client: Client;
  service: Service;
  dateDebut: string;
  dateFin: string;
  statut: string; // EN_ATTENTE, ACCEPTE, REFUSE, TERMINE, ANNULE
  dateCreation: string;
}

const CFG: Record<string, { label: string; bg: string; text: string; dot: string; Icon: any }> = {
  EN_ATTENTE: { label: 'En attente', bg: 'bg-yellow-100 dark:bg-yellow-500/15', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', Icon: Clock },
  ACCEPTE:    { label: 'Confirmé',  bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', Icon: Check },
  REFUSE:     { label: 'Refusé',    bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', Icon: X },
  TERMINE:    { label: 'Terminé',   bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', Icon: ShieldCheck },
  ANNULE:     { label: 'Annulé',    bg: 'bg-gray-100 dark:bg-dark-border', text: 'text-gray-500 dark:text-dark-muted', dot: 'bg-gray-400', Icon: X },
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',      label: 'Tous' },
  { id: 'pending',  label: 'En attente' },
  { id: 'accepted', label: 'Confirmés' },
  { id: 'done',     label: 'Terminés' },
  { id: 'refused',  label: 'Refusés / Annulés' }
];

const MesRendezVousP: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection] = useState('mes-rendez-vous');
  const [userName, setUserName] = useState('');
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const prof = await getMyProviderProfile();
      setProviderProfile(prof);
      setUserName(prof.nom || '');

      const res = await api.get(`/RendezVous/prestataire/${prof.id}`);
      setAppointments(res.data);
    } catch (err: any) {
      console.error("Error loading provider appointments:", err);
      toast.error("Erreur lors du chargement des rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await api.put(`/RendezVous/${id}/accept`);
      toast.success("Rendez-vous accepté !");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'acceptation.");
    }
  };

  const handleRefuse = async (id: number) => {
    try {
      await api.put(`/RendezVous/${id}/refuse`);
      toast.success("Rendez-vous refusé !");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du refus.");
    }
  };

  const filtered = appointments.filter(a => {
    const matchTab =
      activeTab === 'all'      ? true :
      activeTab === 'pending'  ? a.statut === 'EN_ATTENTE' :
      activeTab === 'accepted' ? a.statut === 'ACCEPTE' :
      activeTab === 'done'     ? a.statut === 'TERMINE' : (a.statut === 'REFUSE' || a.statut === 'ANNULE');

    const q = search.toLowerCase();
    const name = a.client?.nomComplet || '';
    const service = a.service?.nom || '';
    return matchTab && (name.toLowerCase().includes(q) || service.toLowerCase().includes(q));
  });

  const stats = {
    total:    appointments.length,
    pending:  appointments.filter(a => a.statut === 'EN_ATTENTE').length,
    accepted: appointments.filter(a => a.statut === 'ACCEPTE').length,
    done:     appointments.filter(a => a.statut === 'TERMINE').length,
    refused:  appointments.filter(a => a.statut === 'REFUSE' || a.statut === 'ANNULE').length,
  };

  // Find the next accepted appointment in the future
  const nextRdv = appointments
    .filter(a => a.statut === 'ACCEPTE' && new Date(a.dateDebut) >= new Date())
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())[0];

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#0059B2] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200 font-poppins selection:bg-blue-200 selection:text-blue-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif; }
        @keyframes fadeIn   {from{opacity:0}to{opacity:1}}
        @keyframes slideUp  {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards;}
        .anim-up   {animation:slideUp    .45s cubic-bezier(.16,1,.3,1) both;}
        .anim-right{animation:slideRight .45s cubic-bezier(.16,1,.3,1) both;}
        .rdv-row{transition:transform .2s ease,box-shadow .2s ease;}
        .rdv-row:hover{transform:translateX(3px);}
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 4px 24px -4px rgba(0,0,0,0.03);
        }
        .dark .glass-card {
          background: rgba(26, 29, 39, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {isSidebarOpen && <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={()=>setIsSidebarOpen(false)}/>}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen?'translate-x-0':'-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s=>{setIsSidebarOpen(false);}}/>
      </div>

      <main className={`min-h-screen transition-all duration-300 lg:${isSidebarOpen?'ml-64':'ml-0'}`}>
        <TopBar userName={userName} onMenuToggle={()=>setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen}/>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-up">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Vos Rendez-vous</h1>
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">Consultez et gérez les réservations de vos clients</p>
            </div>
            <button onClick={()=>navigate('/Disponibilites-Provider')} className="flex items-center gap-2 bg-[#0059B2] hover:bg-[#004a99] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg shrink-0">
              <Calendar size={15}/>Mes disponibilités
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 anim-up" style={{animationDelay:'.05s'}}>
            {[
              {label:'Total',    value:stats.total,    color:'text-blue-600 dark:text-blue-400',       bg:'bg-blue-50 dark:bg-blue-500/10',       dot:'bg-blue-500'},
              {label:'En attente',  value:stats.pending, color:'text-yellow-600 dark:text-yellow-400', bg:'bg-yellow-50 dark:bg-yellow-500/10', dot:'bg-yellow-500'},
              {label:'Confirmés', value:stats.accepted, color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-500/10', dot:'bg-emerald-500'},
              {label:'Terminés', value:stats.done,     color:'text-gray-700 dark:text-dark-text',      bg:'bg-gray-50 dark:bg-dark-border',        dot:'bg-gray-400'},
              {label:'Annulés/Refusés',  value:stats.refused,  color:'text-red-600 dark:text-red-400',         bg:'bg-red-50 dark:bg-red-500/10',          dot:'bg-red-500'},
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

            {/* LEFT: List of Appointments */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Search + tabs */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-up" style={{animationDelay:'.1s'}}>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5">
                    <Search size={14} className="text-gray-400 dark:text-dark-muted shrink-0"/>
                    <input type="text" placeholder="Rechercher par client ou service..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"
                      className="bg-transparent outline-none text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-muted w-full"/>
                    {search && <button onClick={()=>setSearch('')}><X size={12} className="text-gray-400 hover:text-gray-600"/></button>}
                  </div>
                  <button className="flex items-center gap-2 px-4 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-border transition-all font-medium shrink-0">
                    <Filter size={14}/>
                  </button>
                </div>
                <div className="flex gap-1 mt-3 overflow-x-auto pb-0.5 scrollbar-hide">
                  {TABS.map(tab=>{
                    const count = tab.id==='all'?stats.total:tab.id==='pending'?stats.pending:tab.id==='accepted'?stats.accepted:tab.id==='done'?stats.done:stats.refused;
                    return (
                      <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab===tab.id ? 'bg-[#0059B2] text-white shadow-sm' : 'text-gray-500 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                        }`}>
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab===tab.id?'bg-white/25 text-white':'bg-gray-100 dark:bg-dark-border text-gray-500 dark:text-dark-muted'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Appointment cards */}
              {filtered.length === 0 ? (
                <div className="bg-white dark:bg-dark-surface rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-dark-border anim-up">
                  <AlertCircle size={32} className="text-gray-300 dark:text-dark-muted mx-auto mb-3"/>
                  <p className="text-gray-500 dark:text-dark-muted font-medium">Aucun rendez-vous trouvé</p>
                </div>
              ) : filtered.map((appt, idx) => {
                const cfg = CFG[appt.statut] || CFG.EN_ATTENTE;
                const SIcon = cfg.Icon;
                const isOpen = selectedId === appt.id;
                const dt = formatDateTime(appt.dateDebut);

                return (
                  <div key={appt.id} onClick={()=>setSelectedId(isOpen?null:appt.id)}
                    className={`rdv-row bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-sm border cursor-pointer transition-all duration-200 anim-up ${
                      isOpen ? 'border-[#0059B2] dark:border-blue-500 shadow-md' : 'border-gray-100 dark:border-dark-border hover:border-blue-100 dark:hover:border-dark-border hover:shadow-md'
                    }`}
                    style={{animationDelay:`${.12+idx*.05}s`}}>

                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {appt.client.avatar ? (
                          <img src={appt.client.avatar} alt={appt.client.nomComplet} className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-dark-surface"/>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold ring-2 ring-white dark:ring-dark-surface">
                            {appt.client.nomComplet.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-surface ${cfg.dot}`}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-dark-text text-sm">{appt.client.nomComplet}</p>
                            <p className="text-xs text-[#0059B2] dark:text-blue-400 font-medium">{appt.service.nom} • {appt.service.prix} DH</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}>
                            <SIcon size={9}/>{cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted"><Calendar size={10} className="text-[#0059B2] dark:text-blue-400"/>{dt.date}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted"><Clock size={10} className="text-[#0059B2] dark:text-blue-400"/>{dt.time}</span>
                        </div>
                      </div>
                      <ChevronRight size={15} className={`text-gray-300 dark:text-dark-muted shrink-0 transition-transform duration-200 ${isOpen?'rotate-90 text-blue-500':''}`}/>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex flex-wrap items-center justify-between gap-2 anim-up" onClick={e=>e.stopPropagation()}>
                        <div className="flex gap-2">
                          <a href={`tel:${appt.client.telephone}`} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
                            <Phone size={12}/>Appeler
                          </a>
                          <button onClick={()=>navigate('/Messages')} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-all">
                            <MessageSquare size={12}/>Contacter
                          </button>
                        </div>
                        
                        {appt.statut === 'EN_ATTENTE' && (
                          <div className="flex gap-2">
                            <button onClick={()=>handleAccept(appt.id)} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-all">
                              <CheckCircle2 size={12}/>Accepter
                            </button>
                            <button onClick={()=>handleRefuse(appt.id)} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all">
                              <XCircle size={12}/>Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Sidebar Next RDV & Stats */}
            <div className="w-full lg:w-68 shrink-0 space-y-4" style={{width:'272px'}}>

              {/* Next RDV card */}
              <div className="bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] rounded-2xl p-5 text-white shadow-lg anim-right" style={{animationDelay:'.15s'}}>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-3">Prochain rendez-vous</p>
                {nextRdv ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      {nextRdv.client.avatar ? (
                        <img src={nextRdv.client.avatar} alt={nextRdv.client.nomComplet} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30"/>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shrink-0 ring-2 ring-white/30">
                          {nextRdv.client.nomComplet.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm truncate max-w-[150px]">{nextRdv.client.nomComplet}</p>
                        <p className="text-blue-200 text-xs truncate max-w-[150px]">{nextRdv.service.nom}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-xs font-semibold">
                      <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                        <Calendar size={12} className="text-blue-200 shrink-0"/>
                        <span>{formatDateTime(nextRdv.dateDebut).date}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
                        <Clock size={12} className="text-blue-200 shrink-0"/>
                        <span>{formatDateTime(nextRdv.dateDebut).time}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${nextRdv.client.telephone}`} className="flex-1 flex items-center justify-center gap-2 bg-white text-[#0059B2] py-2 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all">
                        <Phone size={12}/>Appeler
                      </a>
                    </div>
                  </>
                ) : <p className="text-sm text-blue-200 font-medium">Aucun rendez-vous à venir</p>}
              </div>

              {/* Tips */}
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border transition-colors duration-200 anim-right" style={{animationDelay:'.2s'}}>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">💡 Conseils</h3>
                <div className="space-y-2.5">
                  {[
                    {e:'📅',t:'Vérifiez vos disponibilités régulièrement pour éviter les conflits.'},
                    {e:'⚡',t:'Répondez rapidement aux demandes pour maximiser vos confirmations.'},
                    {e:'📞',t:'En cas d\'empêchement, prévenez le client par appel.'}
                  ].map((item,i)=>(
                    <div key={i} className="flex items-start gap-2.5 p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <span className="text-base leading-none">{item.e}</span>
                      <p className="text-xs text-gray-700 dark:text-dark-text font-medium leading-relaxed">{item.t}</p>
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

export default MesRendezVousP;