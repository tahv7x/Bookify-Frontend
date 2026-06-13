import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
  X,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyProviderProfile } from "../../services/provider/providerService";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import { proposeAlternativeDate } from "../../services/Client/rendezVousService";

type Tab = "all" | "pending" | "accepted" | "done";

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
  idRendezVous: number; // <-- L'erreur kanet hna, khassha tkon idRendezVous machi id
  client: Client;
  service: Service;
  dateDebut: string;
  dateFin: string;
  statut: string; // EN_ATTENTE, ACCEPTE, REFUSE, TERMINE, ANNULE
  dateCreation: string;
}

const CFG: Record<
  string,
  { label: string; dot: string; bg: string; text: string }
> = {
  EN_ATTENTE: {
    label: "En attente",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  ACCEPTE: {
    label: "Confirmé",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  REFUSE: {
    label: "Refusé",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
  },
  TERMINE: {
    label: "Terminé",
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
  },
  ANNULE: {
    label: "Annulé",
    dot: "bg-gray-400",
    bg: "bg-gray-50 dark:bg-white/5",
    text: "text-gray-600 dark:text-gray-400",
  },
};

const MesRendezVousP: React.FC = () => {
  const { isDark } = useTheme();
  const [providerProfile, setProviderProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const [initialLoad, setInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // NOUVEAU : State pour le modal de reprogrammation
  const [proposeModal, setProposeModal] = useState<{ isOpen: boolean; apptId: number | null }>({ isOpen: false, apptId: null });
  const [proposeDate, setProposeDate] = useState("");
  const [proposeTime, setProposeTime] = useState("");
  const [proposeNote, setProposeNote] = useState("");
  const [isProposing, setIsProposing] = useState(false);

  const navigate = useNavigate();

  const loadData = async (showMainLoader = true) => {
    try {
      if (showMainLoader) setInitialLoad(true);
      else setIsRefreshing(true);

      const prof = await getMyProviderProfile();
      setProviderProfile(prof);

      const res = await api.get(`/RendezVous/prestataire/${prof.id}`);
      setAppointments(res.data);

      if (showMainLoader && res.data.length > 0) {
        setSelectedId(res.data[0].idRendezVous); // <-- Modifié hna
      }
    } catch (err: any) {
      console.error("Error loading provider appointments:", err);
      toast.error("Erreur lors du chargement des rendez-vous.");
    } finally {
      setInitialLoad(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await api.put(`/RendezVous/${id}/accept`);
      toast.success("Rendez-vous accepté !");
      loadData(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de l'acceptation."
      );
    }
  };

  const handleRefuse = async (id: number) => {
    try {
      await api.put(`/RendezVous/${id}/refuse`);
      toast.success("Rendez-vous refusé !");
      loadData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors du refus.");
    }
  };

  const handleOpenProposeModal = (id: number) => {
    const appt = appointments.find((a) => a.idRendezVous === id);
    if (!appt) return;
    
    // Pré-remplir avec la date actuelle
    const d = new Date(appt.dateDebut);
    setProposeDate(d.toISOString().split("T")[0]);
    setProposeTime(d.toTimeString().substring(0, 5));
    setProposeNote("");
    setProposeModal({ isOpen: true, apptId: id });
  };

  const handleSubmitPropose = async () => {
    if (!proposeModal.apptId) return;
    const appt = appointments.find((a) => a.idRendezVous === proposeModal.apptId);
    if (!appt) return;

    if (!proposeDate) {
      toast.error("Veuillez sélectionner une date.");
      return;
    }

    const startDate = new Date(appt.dateDebut);
    const endDate = new Date(appt.dateFin);
    const isFullDay = startDate.getHours() === 0 && endDate.getHours() === 23;

    let startParsed: Date;
    if (isFullDay) {
      startParsed = new Date(`${proposeDate}T00:00:00`);
    } else {
      if (!proposeTime) {
        toast.error("Veuillez sélectionner une heure.");
        return;
      }
      startParsed = new Date(`${proposeDate}T${proposeTime}:00`);
    }

    const durationMs = endDate.getTime() - startDate.getTime();
    const endParsed = new Date(startParsed.getTime() + durationMs);

    try {
      setIsProposing(true);
      await proposeAlternativeDate(
        proposeModal.apptId,
        startParsed.toISOString(),
        endParsed.toISOString(),
        proposeNote.trim() || undefined
      );
      toast.success("Nouvelle date proposée au client avec succès !");
      setProposeModal({ isOpen: false, apptId: null });
      loadData(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la proposition."
      );
    } finally {
      setIsProposing(false);
    }
  };

  const filtered = appointments.filter((a) => {
    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "pending"
          ? a.statut === "EN_ATTENTE"
          : activeTab === "accepted"
            ? a.statut === "ACCEPTE"
            : activeTab === "done"
              ? a.statut === "TERMINE"
              : true;

    const q = search.toLowerCase();
    const name = a.client?.nomComplet || "";
    const service = a.service?.nom || "";
    return (
      matchTab &&
      (name.toLowerCase().includes(q) || service.toLowerCase().includes(q))
    );
  });

  const selectedAppt = appointments.find((a) => a.idRendezVous === selectedId); // <-- Modifié hna

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (initialLoad) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#0059B2] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">
          Chargement de la boîte de réception...
        </p>
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

      {/* MODAL DE REPROGRAMMATION */}
      {proposeModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md anim-fade-in">
          <div className="bg-white dark:bg-[#1A1D24] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5">
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                    Reprogrammer
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Proposez une nouvelle date au client</p>
                </div>
                <button 
                  onClick={() => setProposeModal({ isOpen: false, apptId: null })}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Date proposée</label>
                    <input 
                      type="date" 
                      value={proposeDate}
                      onChange={(e) => setProposeDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#1A6FD1] dark:focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Heure proposée</label>
                    <input 
                      type="time" 
                      value={proposeTime}
                      onChange={(e) => setProposeTime(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#1A6FD1] dark:focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Message pour le client (Optionnel)</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Bonjour, je suis désolé mais je suis indisponible à cette date..."
                    value={proposeNote}
                    onChange={(e) => setProposeNote(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#111318] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#1A6FD1] dark:focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex gap-3">
                <button 
                  onClick={() => setProposeModal({ isOpen: false, apptId: null })}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSubmitPropose}
                  disabled={isProposing}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#1A6FD1] hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProposing ? <Loader2 size={18} className="animate-spin" /> : "Envoyer"}
                </button>
              </div>
            </div>
          </div>
      )}

      {/* CONTENU PRINCIPAL (Devient flou et recule quand le modal est ouvert) */}
      <div 
        className={`h-[calc(100vh-120px)] flex flex-col gap-6 relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          proposeModal.isOpen ? 'blur-[8px] scale-[0.97] opacity-60 pointer-events-none' : 'anim-fade-in'
        }`}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1
              className="text-3xl text-[#0f2a5e] dark:text-white mb-1"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              Gestion des réservations
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
              Traitez vos demandes rapidement et efficacement.
              {isRefreshing && <span className="text-xs text-[#1A6FD1] animate-pulse">(Mise à jour...)</span>}
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="px-4 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold text-sm flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              {appointments.filter((a) => a.statut === "EN_ATTENTE").length} en attente
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {appointments.filter((a) => a.statut === "ACCEPTE").length} confirmés
            </div>
            
            <button
              onClick={() => loadData(false)}
              disabled={isRefreshing}
              className={`p-2.5 rounded-xl border transition-all shadow-sm flex items-center justify-center 
                ${isDark 
                  ? "bg-[#1A1D24] border-white/5 hover:bg-white/10 text-gray-300" 
                  : "bg-white border-gray-100 hover:bg-gray-50 text-gray-600"
                } 
                ${isRefreshing ? "opacity-70 cursor-not-allowed" : "active:scale-95 hover:shadow-md"}`}
              title="Rafraîchir la liste"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin text-[#1A6FD1] dark:text-blue-400" : ""} />
            </button>
          </div>
        </div>

        {/* MAIN INBOX CONTAINER */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          {/* LEFT PANEL: Master List */}
          <div className="w-full lg:w-[380px] flex flex-col gap-4 shrink-0 h-[400px] lg:h-full">
            {/* Search & Tabs */}
            <div className="glass-card rounded-2xl p-4 shrink-0 flex flex-col gap-4 relative">
              
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#111318] border border-gray-100 dark:border-white/5 rounded-xl px-3 py-2.5 transition-colors focus-within:border-blue-300 dark:focus-within:border-blue-500/50">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher (client, service)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                  className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X
                      size={14}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  </button>
                )}
              </div>

              <div className="flex gap-2 bg-gray-50/50 dark:bg-white/5 p-1 rounded-xl">
                {[
                  { id: "all", label: "Tous" },
                  { id: "pending", label: "En attente" },
                  { id: "accepted", label: "Confirmés" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-[#1A1D27] text-[#0059B2] dark:text-blue-400 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className={`flex-1 overflow-y-auto inbox-scroll pr-2 space-y-2 transition-opacity duration-300 ${isRefreshing ? "opacity-60" : "opacity-100"}`}>
              {filtered.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <Inbox
                    size={32}
                    className="text-gray-300 dark:text-gray-600 mb-3"
                  />
                  <p className="text-sm text-gray-500 font-medium">
                    Aucun rendez-vous dans cette catégorie.
                  </p>
                </div>
              ) : (
                filtered.map((appt) => {
                  const cfg = CFG[appt.statut] || CFG.EN_ATTENTE;
                  const isSelected = selectedId === appt.idRendezVous; // <-- Modifié hna
                  const dt = formatDateTime(appt.dateDebut);

                  return (
                    <div
                      key={appt.idRendezVous} // <-- Modifié hna
                      onClick={() => setSelectedId(appt.idRendezVous)} // <-- Modifié hna
                      className={`group p-4 rounded-[20px] cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center ${
                        isSelected
                          ? isDark
                            ? "bg-[#1A1D24] border-[1.5px] border-[#3b82f6] shadow-[0_8px_30px_rgba(59,130,246,0.15)]"
                            : "bg-white border-[1.5px] border-[#1A6FD1] shadow-[0_8px_30px_rgba(26,111,209,0.12)]"
                          : isDark
                            ? "bg-[#1A1D24]/60 border-[1.5px] border-white/5 hover:border-white/10 hover:bg-[#1A1D24]"
                            : "bg-white border-[1.5px] border-transparent hover:border-blue-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(26,111,209,0.08)]"
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute inset-0 opacity-[0.03] ${isDark ? "bg-gradient-to-br from-blue-400 to-transparent" : "bg-gradient-to-br from-blue-600 to-transparent"}`} />
                      )}

                      <div className="flex gap-4 relative z-10 w-full items-center">
                        <div className="relative shrink-0">
                          {appt.client.avatar ? (
                            <img
                              src={appt.client.avatar}
                              alt="Avatar"
                              className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-[#1A6FD1] dark:text-blue-400 font-bold text-lg shadow-sm">
                              {appt.client.nomComplet.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[2.5px] ${isDark ? 'border-[#1A1D24]' : 'border-white'} ${cfg.dot} shadow-sm`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight truncate pr-2">
                              {appt.client.nomComplet}
                            </p>
                            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">
                              {dt.date.split(" ")[0]} {dt.date.split(" ")[1]}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#1A6FD1] dark:text-blue-400 font-medium truncate mb-1.5">
                            {appt.service.nom}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Clock size={12} className="text-gray-400" /> {dt.time}
                          </div>
                        </div>

                        {appt.statut === "EN_ATTENTE" && (
                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(appt.idRendezVous); // <-- Modifié hna
                              }}
                              title="Accepter"
                              disabled={isRefreshing}
                              className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRefuse(appt.idRendezVous); // <-- Modifié hna
                              }}
                              title="Refuser"
                              disabled={isRefreshing}
                              className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Details View */}
          <div className="flex-1 h-full glass-card rounded-3xl overflow-hidden flex flex-col relative">
            {isRefreshing && selectedAppt && (
              <div className="absolute inset-0 bg-white/20 dark:bg-black/10 z-50 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
                <Loader2 className="w-8 h-8 text-[#1A6FD1] animate-spin" />
              </div>
            )}
            
            {!selectedAppt ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6">
                  <Inbox
                    size={32}
                    className="text-[#0059B2] dark:text-blue-400"
                  />
                </div>
                <h3
                  className="text-xl font-bold text-[#0f2a5e] dark:text-white mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Aucune sélection
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Sélectionnez une demande de réservation dans la liste de
                  gauche pour afficher ses détails.
                </p>
              </div>
            ) : (
              (() => {
                const cfg = CFG[selectedAppt.statut] || CFG.EN_ATTENTE;
                const dt = formatDateTime(selectedAppt.dateDebut);
                const isPending = selectedAppt?.statut === "EN_ATTENTE";

                return (
                  <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-8 pb-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-start shrink-0">
                      <div className="flex items-center gap-5">
                        {selectedAppt.client.avatar ? (
                          <img
                            src={selectedAppt.client.avatar}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-50 dark:ring-white/5"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-2xl ring-4 ring-gray-50 dark:ring-white/5">
                            {selectedAppt.client.nomComplet
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {selectedAppt.client.nomComplet}
                          </h2>
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </div>
                        </div>
                      </div>
                      {selectedAppt.statut === "ACCEPTE" && (
                        <div className="flex gap-2">
                          <a
                            href={`tel:${selectedAppt.client.telephone}`}
                            className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#0059B2] dark:text-blue-400 hover:bg-blue-100 flex items-center justify-center transition-colors shadow-sm hover:shadow"
                          >
                            <Phone size={16} />
                          </a>
                          <button
                            onClick={() => navigate("/Messages")}
                            className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 flex items-center justify-center transition-colors shadow-sm hover:shadow"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div
                          className={`p-6 rounded-3xl border ${isDark ? "bg-[#1A1D24] border-white/5" : "bg-white border-[#e0e7ff] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"}`}
                        >
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Service demandé
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            {selectedAppt.service.nom}
                          </p>
                          <p className="text-[#1A6FD1] dark:text-blue-400 font-black text-xl">
                            {selectedAppt.service.prix} MAD
                          </p>
                        </div>

                        <div
                          className={`p-6 rounded-3xl border ${isDark ? "bg-[#1A1D24] border-white/5" : "bg-white border-[#e0e7ff] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"}`}
                        >
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Date & Heure
                          </p>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-white/5 flex items-center justify-center text-[#1A6FD1]">
                              <Calendar size={16} />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-base">
                              {dt.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-white/5 flex items-center justify-center text-[#1A6FD1]">
                              <Clock size={16} />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-base">
                              {dt.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-6 rounded-3xl border ${isDark ? "bg-[#1A1D24] border-white/5" : "bg-white border-[#e0e7ff] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"}`}
                      >
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                          Coordonnées client
                        </p>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                            <span className="text-sm text-gray-500 font-medium">
                              Téléphone
                            </span>
                            <span className="text-[15px] font-semibold text-gray-900 dark:text-white">
                              {selectedAppt.client.telephone}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">
                              Email
                            </span>
                            <span className="text-[15px] font-semibold text-gray-900 dark:text-white">
                              {selectedAppt.client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isPending && (
                      <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-transparent shrink-0">
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleAccept(selectedAppt.idRendezVous)} // <-- Modifié hna
                            disabled={isRefreshing}
                            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-[16px] font-bold text-sm shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all hover:-translate-y-1 active:scale-[0.98]"
                          >
                            <CheckCircle2 size={18} /> Accepter
                          </button>
                          <button
                            onClick={() => handleOpenProposeModal(selectedAppt.idRendezVous)} // <-- Modifié hna
                            disabled={isRefreshing}
                            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-[#1A6FD1] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-[16px] font-bold text-sm shadow-[0_8px_20px_rgba(26,111,209,0.25)] transition-all hover:-translate-y-1 active:scale-[0.98]"
                          >
                            <Calendar size={18} /> Reprogrammer
                          </button>
                          <button
                            onClick={() => handleRefuse(selectedAppt.idRendezVous)} // <-- Modifié hna
                            disabled={isRefreshing}
                            className="flex-1 min-w-[150px] flex items-center justify-center gap-2 bg-white dark:bg-[#1A1D24] text-red-500 border-2 border-red-100 hover:border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded-[16px] font-bold text-sm transition-all hover:-translate-y-1 active:scale-[0.98]"
                          >
                            <XCircle size={18} /> Refuser
                          </button>
                        </div>
                        <p className="text-center text-[11px] text-gray-400 mt-4 font-medium uppercase tracking-wide">
                          En acceptant, un email de confirmation sera envoyé à {selectedAppt.client.nomComplet}.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MesRendezVousP;