import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MessageSquare,
  HelpCircle,
  Search,
  X,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  Clock,
  Circle,
  User,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { supportService } from "../../services/supportService";
import type { Ticket } from "../../services/supportService";
import { faqService } from "../../services/faqService";
import type { FaqItem } from "../../services/faqService";

// ── Types ─────────────────────────────────────────────────────────────────────
type TicketStatus = "Ouvert" | "En attente" | "Résolu";
type Tab = "messages" | "faq";

// Data will be fetched from API

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  TicketStatus,
  { color: string; bg: string; icon: React.ElementType }
> = {
  Ouvert: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-500/10",
    icon: Circle,
  },
  "En attente": {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-500/10",
    icon: Clock,
  },
  Résolu: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-500/10",
    icon: CheckCircle,
  },
};

// ── Ticket detail modal ───────────────────────────────────────────────────────
const TicketModal: React.FC<{
  isDark: boolean;
  ticket: Ticket;
  onClose: () => void;
  onReply: (id: number, text: string) => void;
  onResolve: (id: number) => void;
}> = ({ isDark, ticket, onClose, onReply, onResolve }) => {
  const [reply, setReply] = useState("");
  const cfg = STATUS_CONFIG[ticket.status];

  const handleSend = () => {
    if (!reply.trim()) return;
    onReply(ticket.idTicket, reply.trim());
    setReply("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-2xl rounded-2xl flex flex-col max-h-[85vh] overflow-hidden backdrop-blur-[40px]"
        style={{
          background: isDark ? "rgba(8,14,30,0.90)" : "rgba(255,255,255,0.85)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.9)"}`,
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 32px 80px rgba(80,120,200,0.12), inset 0 1px 0 rgba(255,255,255,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-start justify-between gap-4 ${isDark ? "border-white/[0.08]" : "border-white/50"}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
              >
                <cfg.icon size={11} />
                {ticket.status}
              </span>
              <span className="text-xs text-gray-400">
                #{ticket.idTicket} · {new Date(ticket.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {ticket.subject}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ticket.userName} · {ticket.userEmail}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {ticket.status !== "Résolu" && (
              <button
                onClick={() => onResolve(ticket.idTicket)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors"
              >
                <CheckCircle size={14} /> Résoudre
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-4 ${isDark ? "bg-black/20" : "bg-black/[0.03]"}`}
        >
          {ticket.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.from === "admin" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                  msg.from === "admin"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-gray-400 to-gray-600"
                }`}
              >
                {msg.from === "admin" ? "A" : ticket.userName.charAt(0)}
              </div>
              <div
                className={`max-w-[75%] ${msg.from === "admin" ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "admin"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : isDark
                        ? "bg-slate-800 text-gray-200 rounded-tl-sm"
                        : "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[11px] text-gray-400 px-1">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reply input */}
        {ticket.status !== "Résolu" && (
          <div
            className={`p-4 border-t ${isDark ? "border-white/[0.08] bg-black/20" : "border-white/50 bg-white/40"}`}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Écrire une réponse…"
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  isDark
                    ? "bg-slate-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white"
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!reply.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ── FAQ Modal ─────────────────────────────────────────────────────────────────
const FaqModal: React.FC<{
  isDark: boolean;
  item?: FaqItem;
  onClose: () => void;
  onSave: (data: { question: string; reponse: string }) => void;
}> = ({ isDark, item, onClose, onSave }) => {
  const [question, setQuestion] = useState(item?.question ?? "");
  const [reponse, setReponse] = useState(item?.reponse ?? "");
  const isEdit = !!item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !reponse.trim()) return;
    onSave({ question: question.trim(), reponse: reponse.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden backdrop-blur-[40px]"
        style={{
          background: isDark ? "rgba(8,14,30,0.88)" : "rgba(255,255,255,0.82)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.9)"}`,
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 32px 80px rgba(80,120,200,0.12), inset 0 1px 0 rgba(255,255,255,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? "border-white/[0.08]" : "border-white/50"}`}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {isEdit ? "Modifier la FAQ" : "Nouvelle question FAQ"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Comment réserver un service ?"
              required
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                isDark
                  ? "bg-slate-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Réponse
            </label>
            <textarea
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              placeholder="Rédigez une réponse claire et concise…"
              required
              rows={4}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none transition-colors ${
                isDark
                  ? "bg-slate-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white"
              }`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm shadow-blue-600/20"
            >
              {isEdit ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Support = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("messages");

  // ── Messages state ──
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null);

  // ── FAQ state ──
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editFaq, setEditFaq] = useState<FaqItem | null>(null);
  const [deleteFaq, setDeleteFaq] = useState<FaqItem | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (error) {
      toast.error("Erreur de chargement des tickets");
    }
  };

  const fetchFaqs = async () => {
    try {
      const data = await faqService.getFaqs();
      setFaqItems(data);
    } catch (error) {
      toast.error("Erreur de chargement des FAQs");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Async data fetching on mount
    fetchTickets();
    fetchFaqs();
  }, []);

  // ── Ticket helpers ──
  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) => {
        const matchStatus = filter === "all" || t.status === filter;
        const matchSearch =
          !search ||
          t.userName.toLowerCase().includes(search.toLowerCase()) ||
          t.subject.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
      }),
    [tickets, filter, search],
  );

  const ticketCounts = useMemo(
    () => ({
      all: tickets.length,
      Ouvert: tickets.filter((t) => t.status === "Ouvert").length,
      "En attente": tickets.filter((t) => t.status === "En attente").length,
      Résolu: tickets.filter((t) => t.status === "Résolu").length,
    }),
    [tickets],
  );

  const handleReply = async (id: number, text: string) => {
    try {
      await supportService.addMessage(id, text);
      toast.success("Réponse envoyée.");
      fetchTickets();
      if (openTicket && openTicket.idTicket === id) {
        const updated = await supportService.getTicket(id);
        setOpenTicket(updated);
      }
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la réponse");
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await supportService.updateStatus(id, "Résolu");
      toast.success("Ticket marqué comme résolu.");
      fetchTickets();
      if (openTicket && openTicket.idTicket === id) {
        setOpenTicket({ ...openTicket, status: "Résolu" });
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du ticket");
    }
  };

  // ── FAQ helpers ──
  const handleAddFaq = async ({
    question,
    reponse,
  }: {
    question: string;
    reponse: string;
  }) => {
    try {
      await faqService.addFaq(question, reponse);
      toast.success("Question FAQ ajoutée !");
      setShowFaqModal(false);
      fetchFaqs();
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la FAQ");
    }
  };

  const handleEditFaq = async ({
    question,
    reponse,
  }: {
    question: string;
    reponse: string;
  }) => {
    if (!editFaq) return;
    try {
      await faqService.updateFaq(editFaq.idFaq, question, reponse);
      toast.success("FAQ mise à jour.");
      setEditFaq(null);
      fetchFaqs();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteFaq = async () => {
    if (!deleteFaq) return;
    try {
      await faqService.deleteFaq(deleteFaq.idFaq);
      toast.success(`FAQ supprimée.`);
      setDeleteFaq(null);
      fetchFaqs();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support & FAQ
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Gérez les demandes d'assistance et la base de connaissances.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "messages"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <MessageSquare size={16} />
            Messages
            {ticketCounts["Ouvert"] > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                {ticketCounts["Ouvert"]}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "faq"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <HelpCircle size={16} />
            FAQ
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "faq"
                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300"
                  : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              {faqItems.length}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════════════════════════════
            MESSAGES TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "messages" && (
          <motion.div
            key="messages"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Status chips */}
            <div className="flex flex-wrap gap-2">
              {(["all", "Ouvert", "En attente", "Résolu"] as const).map((s) => {
                const isActive = filter === s;
                const cfg = s !== "all" ? STATUS_CONFIG[s] : null;
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                      isActive
                        ? s === "all"
                          ? isDark
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-slate-800 border-slate-700 text-white"
                          : `${cfg!.bg} border-current ${cfg!.color}`
                        : isDark
                          ? "border-gray-800 text-gray-400 hover:bg-slate-800"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s === "all" ? "Tous" : s}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : isDark
                            ? "bg-slate-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {ticketCounts[s === "all" ? "all" : s]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div
                className={`p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
              >
                <div className="relative w-full sm:w-72">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={17}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un ticket…"
                    className={`w-full pl-10 pr-8 py-2.5 rounded-xl text-sm border outline-none transition-colors ${
                      isDark
                        ? "bg-slate-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Ticket list */}
              <div className="divide-y dark:divide-gray-800">
                <AnimatePresence>
                  {filteredTickets.map((ticket) => {
                    const cfg = STATUS_CONFIG[ticket.status];
                    return (
                      <motion.button
                        key={ticket.idTicket}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenTicket(ticket)}
                        className={`w-full text-left flex items-center gap-4 px-5 py-4 transition-colors ${
                          isDark
                            ? "hover:bg-slate-800/40"
                            : "hover:bg-gray-50/80"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {ticket.userName.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {ticket.userName}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0">
                              {ticket.date}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {ticket.preview}
                          </p>
                        </div>

                        {/* Status */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.color}`}
                        >
                          <cfg.icon size={11} />
                          {ticket.status}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>

                {filteredTickets.length === 0 && (
                  <div className="py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <MessageSquare size={34} strokeWidth={1.5} />
                      <p className="font-medium">Aucun ticket trouvé</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className={`px-5 py-3 border-t text-xs text-gray-400 ${isDark ? "border-gray-800" : "border-gray-100"}`}
              >
                {filteredTickets.length} ticket
                {filteredTickets.length !== 1 ? "s" : ""} affiché
                {filteredTickets.length !== 1 ? "s" : ""}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FAQ TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "faq" && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <button
                onClick={() => setShowFaqModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={18} /> Ajouter une question
              </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <AnimatePresence>
                {faqItems.map((item, index) => (
                  <motion.div
                    key={item.idFaq}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`border-b last:border-0 ${isDark ? "border-gray-800" : "border-gray-100"}`}
                  >
                    {/* Question row */}
                    <div
                      className={`flex items-center gap-3 px-5 py-4 transition-colors ${
                        isDark ? "hover:bg-slate-800/30" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === item.idFaq ? null : item.idFaq)
                        }
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isDark
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm flex-1 truncate">
                          {item.question}
                        </span>
                        <motion.div
                          animate={{ rotate: expandedId === item.idFaq ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400 flex-shrink-0"
                        >
                          <ChevronDown size={18} />
                        </motion.div>
                      </button>

                      {/* Edit / Delete */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditFaq(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteFaq(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Answer (expandable) */}
                    <AnimatePresence>
                      {expandedId === item.idFaq && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div
                            className={`px-5 pb-5 pt-0 ml-9 text-sm leading-relaxed ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {item.reponse}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              {faqItems.length === 0 && (
                <div className="py-14 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <HelpCircle size={40} strokeWidth={1.5} />
                    <p className="font-medium">Aucune question FAQ</p>
                    <button
                      onClick={() => setShowFaqModal(true)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Ajouter la première
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ticket detail modal ── */}
      {createPortal(
        <AnimatePresence>
          {openTicket && (
            <TicketModal
              isDark={isDark}
              ticket={openTicket}
              onClose={() => setOpenTicket(null)}
              onReply={handleReply}
              onResolve={handleResolve}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── FAQ add/edit modal ── */}
      {createPortal(
        <AnimatePresence>
          {showFaqModal && (
            <FaqModal
              isDark={isDark}
              onClose={() => setShowFaqModal(false)}
              onSave={handleAddFaq}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
      {createPortal(
        <AnimatePresence>
          {editFaq && (
            <FaqModal
              isDark={isDark}
              item={editFaq}
              onClose={() => setEditFaq(null)}
              onSave={handleEditFaq}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── FAQ delete confirm ── */}
      {createPortal(
        <AnimatePresence>
          {deleteFaq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteFaq(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-2xl p-6 backdrop-blur-[40px]"
              style={{
                background: isDark
                  ? "rgba(8,14,30,0.88)"
                  : "rgba(255,255,255,0.82)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.9)"}`,
                boxShadow: isDark
                  ? "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)"
                  : "0 32px 80px rgba(80,120,200,0.12), inset 0 1px 0 rgba(255,255,255,1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle
                    size={24}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Supprimer la FAQ
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Action irréversible.
                  </p>
                </div>
              </div>
              <p
                className={`text-sm mb-6 p-3 rounded-xl ${isDark ? "bg-slate-800 text-gray-300" : "bg-gray-50 text-gray-700"}`}
              >
                Supprimer la question :{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  "{deleteFaq.question}"
                </span>{" "}
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteFaq(null)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteFaq}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
};

export default Support;
