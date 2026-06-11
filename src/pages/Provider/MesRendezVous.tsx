import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Phone, MessageSquare, Search, CheckCircle2, XCircle, Loader2, Inbox, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyProviderProfile } from '../../services/provider/providerService';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

type Tab = 'all' | 'pending' | 'accepted' | 'done';

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

const CFG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  EN_ATTENTE: { label: 'En attente', dot: 'bg-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400' },
  ACCEPTE:    { label: 'Confirmé',  dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  REFUSE:     { label: 'Refusé',    dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400' },
  TERMINE:    { label: 'Terminé',   dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400' },
  ANNULE:     { label: 'Annulé',    dot: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-white/5', text: 'text-gray-600 dark:text-gray-400' },
};

const MesRendezVousP: React.FC = () => {
  const { isDark } = useTheme();
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const prof = await getMyProviderProfile();
      setProviderProfile(prof);

      const res = await api.get(`/RendezVous/prestataire/${prof.id}`);
      setAppointments(res.data);
      
      // Auto-select first pending if available
      const pending = res.data.filter((a: any) => a.statut === 'EN_ATTENTE');
      if (pending.length > 0) setSelectedId(pending[0].id);
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
      activeTab === 'done'     ? a.statut === 'TERMINE' : true;

    const q = search.toLowerCase();
    const name = a.client?.nomComplet || '';
    const service = a.service?.nom || '';
    return matchTab && (name.toLowerCase().includes(q) || service.toLowerCase().includes(q));
  });

  const selectedAppt = appointments.find(a => a.id === selectedId);

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#0059B2] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Chargement de la boîte de réception...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .anim-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; translate: 0 10px; } to { opacity: 1; translate: 0 0; } }
        
        /* Custom scrollbar for inbox list */
        .inbox-scroll::-webkit-scrollbar { width: 4px; }
        .inbox-scroll::-webkit-scrollbar-track { background: transparent; }
        .inbox-scroll::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 10px; }
      `}</style>

      <div className="h-[calc(100vh-120px)] flex flex-col gap-6 anim-fade-in">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl text-[#0f2a5e] dark:text-white mb-1" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              Gestion des réservations
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Traitez vos demandes rapidement et efficacement.</p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold text-sm flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {appointments.filter(a => a.statut === 'EN_ATTENTE').length} en attente
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {appointments.filter(a => a.statut === 'ACCEPTE').length} confirmés
            </div>
          </div>
        </div>

        {/* MAIN INBOX CONTAINER */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

          {/* LEFT PANEL: Master List */}
          <div className="w-full lg:w-[380px] flex flex-col gap-4 shrink-0 h-[400px] lg:h-full">
            
            {/* Search & Tabs */}
            <div className="glass-card rounded-2xl p-4 shrink-0 flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#111318] border border-gray-100 dark:border-white/5 rounded-xl px-3 py-2.5 transition-colors focus-within:border-blue-300 dark:focus-within:border-blue-500/50">
                <Search size={16} className="text-gray-400 shrink-0"/>
                <input type="text" placeholder="Rechercher (client, service)..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"/>
                {search && <button onClick={()=>setSearch('')}><X size={14} className="text-gray-400 hover:text-gray-600"/></button>}
              </div>

              <div className="flex gap-2 bg-gray-50/50 dark:bg-white/5 p-1 rounded-xl">
                {[
                  { id: 'pending', label: 'En attente' },
                  { id: 'accepted', label: 'Confirmés' },
                  { id: 'all', label: 'Tous' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab.id ? 'bg-white dark:bg-[#1A1D27] text-[#0059B2] dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto inbox-scroll pr-2 space-y-2">
              {filtered.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <Inbox size={32} className="text-gray-300 dark:text-gray-600 mb-3"/>
                  <p className="text-sm text-gray-500 font-medium">Aucun rendez-vous dans cette catégorie.</p>
                </div>
              ) : filtered.map(appt => {
                const cfg = CFG[appt.statut] || CFG.EN_ATTENTE;
                const isSelected = selectedId === appt.id;
                const dt = formatDateTime(appt.dateDebut);

                return (
                  <div key={appt.id} onClick={() => setSelectedId(appt.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 will-change-transform backdrop-blur-lg border ${
                      isSelected 
                        ? isDark ? 'bg-blue-900/40 border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.15)] -translate-y-1' : 'bg-blue-50/80 border-blue-500/50 shadow-md shadow-blue-500/15 -translate-y-1' 
                        : isDark 
                          ? 'bg-[#1A1D24]/40 border-white/10 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:bg-[#1A1D24]/60 hover:-translate-y-2' 
                          : 'bg-white/40 border-white shadow-sm hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/15 hover:-translate-y-2'
                    }`}>
                    <div className="flex gap-3">
                      <div className="relative shrink-0">
                        {appt.client.avatar ? (
                          <img src={appt.client.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover"/>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                            {appt.client.nomComplet.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1A1D27] ${cfg.dot}`}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{appt.client.nomComplet}</p>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{dt.date.split(' ')[0]} {dt.date.split(' ')[1]}</span>
                        </div>
                        <p className="text-xs text-[#0059B2] dark:text-blue-400 font-semibold truncate mb-1.5">{appt.service.nom}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <Clock size={10} /> {dt.time}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Details View */}
          <div className="flex-1 h-full glass-card rounded-3xl overflow-hidden flex flex-col">
            {!selectedAppt ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6">
                  <Inbox size={32} className="text-[#0059B2] dark:text-blue-400"/>
                </div>
                <h3 className="text-xl font-bold text-[#0f2a5e] dark:text-white mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Aucune sélection</h3>
                <p className="text-gray-500 max-w-sm">Sélectionnez une demande de réservation dans la liste de gauche pour afficher ses détails et la traiter.</p>
              </div>
            ) : (() => {
              const cfg = CFG[selectedAppt.statut] || CFG.EN_ATTENTE;
              const dt = formatDateTime(selectedAppt.dateDebut);
              const isPending = selectedAppt.statut === 'EN_ATTENTE';

              return (
                <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                  {/* Detail Header */}
                  <div className="p-8 pb-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-start shrink-0">
                    <div className="flex items-center gap-5">
                      {selectedAppt.client.avatar ? (
                        <img src={selectedAppt.client.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-50 dark:ring-white/5"/>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-2xl ring-4 ring-gray-50 dark:ring-white/5">
                          {selectedAppt.client.nomComplet.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedAppt.client.nomComplet}</h2>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </div>
                      </div>
                    </div>
                    {/* Quick Contact Actions (only if accepted) */}
                    {selectedAppt.statut === 'ACCEPTE' && (
                      <div className="flex gap-2">
                        <a href={`tel:${selectedAppt.client.telephone}`} className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#0059B2] dark:text-blue-400 hover:bg-blue-100 flex items-center justify-center transition-colors shadow-sm hover:shadow">
                          <Phone size={16} />
                        </a>
                        <button onClick={()=>navigate('/Messages')} className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 flex items-center justify-center transition-colors shadow-sm hover:shadow">
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Detail Body */}
                  <div className="flex-1 p-8 overflow-y-auto">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className={`p-6 rounded-3xl border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white shadow-sm'}`}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Service demandé</p>
                        <p className="text-xl font-bold text-[#0f2a5e] dark:text-white mb-2">{selectedAppt.service.nom}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-black text-2xl">{selectedAppt.service.prix} MAD</p>
                      </div>
                      
                      <div className={`p-6 rounded-3xl border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white shadow-sm'}`}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Date & Heure</p>
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar size={20} className="text-[#0059B2] dark:text-blue-400" />
                          <span className="font-semibold text-gray-900 dark:text-white text-lg">{dt.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={20} className="text-[#0059B2] dark:text-blue-400" />
                          <span className="font-semibold text-gray-900 dark:text-white text-lg">{dt.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-3xl border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white shadow-sm'}`}>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Coordonnées client</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                          <span className="text-sm text-gray-500 font-medium">Téléphone</span>
                          <span className="text-base font-semibold text-gray-900 dark:text-white">{selectedAppt.client.telephone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 font-medium">Email</span>
                          <span className="text-base font-semibold text-gray-900 dark:text-white">{selectedAppt.client.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Footer (Actions) */}
                  {isPending && (
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] shrink-0">
                      <div className="flex gap-4">
                        <button onClick={() => updateStatus(selectedAppt.id, 'accepted')}
                          className="group relative overflow-hidden flex-1 flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-sm shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                          <span className="relative flex items-center gap-2 z-10">
                            <CheckCircle2 size={18} /> Accepter la demande
                          </span>
                        </button>
                        <button 
                          onClick={() => handleRefuse(selectedAppt.id)} 
                          className="px-8 flex items-center justify-center gap-2 bg-white dark:bg-[#1A1D27] hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20 py-4 rounded-xl font-bold text-sm shadow-sm transition-all hover:-translate-y-1"
                        >
                          <XCircle size={20}/> Refuser
                        </button>
                      </div>
                      <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                        En acceptant, un email de confirmation sera envoyé à {selectedAppt.client.nomComplet}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          
        </div>
      </div>
    </>
  );
};

export default MesRendezVousP;