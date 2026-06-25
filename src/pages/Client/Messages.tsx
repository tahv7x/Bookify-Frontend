import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Send,
  Check,
  CheckCheck,
  MoreVertical,
  Smile,
  AlertCircle,
  ChevronLeft,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Navbar from "../../components/Client/Navbar";
import TopBar from "../../components/Client/TopBar";
import MobileBottomNav from "../../components/Client/MobileBottomNav";
import ProviderNavbar from "../../components/Provider/Navbar";
import ProviderTopBar from "../../components/Provider/TopBar";
import { useTheme } from "../../context/ThemeContext";
import AddReviewModal from "../../components/Client/AddReviewModal";
import {
  getContacts,
  getConversation,
  sendMessage,
  type Contact,
} from "../../services/Client/messageService";
import { acceptAlternativeDate } from "../../services/Client/rendezVousService";

const Messages: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"CLIENT" | "PRESTATAIRE">("CLIENT");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [acceptingProposalId, setAcceptingProposalId] = useState<number | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousMessagesLengthRef = useRef(0);
  // Use ref for activeContactId in intervals to avoid stale closures
  const activeContactIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  // ── Auto-scroll only when new messages arrive ──
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (messages.length > previousMessagesLengthRef.current) {
      scrollToBottom("smooth");
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  // Scroll instantly when switching contacts
  useEffect(() => {
    if (activeContactId) {
      setTimeout(() => scrollToBottom("instant"), 50);
    }
  }, [activeContactId]);

  // ── Auto-grow textarea ──
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 128) + "px";
    }
  };

  // ── Load contacts (stable, doesn't reset active contact) ──
  const loadContactsRef = useRef<(() => Promise<void>) | null>(null);
  loadContactsRef.current = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
      // Only set first contact if none is selected yet
      if (data.length > 0 && activeContactIdRef.current === null) {
        setActiveContactId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadContactsRef.current?.();
    const interval = setInterval(() => loadContactsRef.current?.(), 5000);
    return () => clearInterval(interval);
  }, []);

  const parseProposal = (content: string) => {
    const isAuto = content.startsWith("BOOKIFY_AUTO_PROPOSAL|");
    if (!content.startsWith("BOOKIFY_PROPOSAL|") && !isAuto) return null;
    const parts = content.split("|");
    if (parts.length < 5) return null;

    const rdvId = Number(parts[1]);
    const startIso = parts[2];
    const endIso = parts[3];
    const note = parts.slice(4).join("|");
    if (Number.isNaN(rdvId) || !startIso) return null;

    return { rdvId, startIso, endIso, note, isAuto };
  };

  const handleAcceptProposal = async (rdvId: number, startIso: string, endIso: string) => {
    try {
      setAcceptingProposalId(rdvId);
      await acceptAlternativeDate(
        rdvId,
        startIso,
        endIso
      );
      if (activeContactIdRef.current) {
        await loadMessagesSilentlyRef.current?.(activeContactIdRef.current);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors de l'acceptation de la proposition.",
      );
    } finally {
      setAcceptingProposalId(null);
    }
  };

  // ── Load messages silently (stable ref to avoid stale closure) ──
  const loadMessagesSilentlyRef = useRef<
    ((contactId: number) => Promise<void>) | null
  >(null);
  loadMessagesSilentlyRef.current = async (contactId: number) => {
    try {
      const data = await getConversation(contactId);
      // Only update if we're still viewing this contact
      if (activeContactIdRef.current !== contactId) return;
      const formattedMessages = data.map((m) => {
        const proposal = parseProposal(m.content);
        const isProposalAccepted = m.content.startsWith(
          "BOOKIFY_PROPOSAL_ACCEPTED|",
        );

        return {
          id: m.id,
          sender: m.senderId === contactId ? "other" : "me",
          text: m.content,
          time: new Date(m.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isRead: m.lu,
          proposal,
          isProposalAccepted,
        };
      });
      setMessages(formattedMessages);
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, unread: 0 } : c)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeContactId) {
      setMessages([]);
      setLoadingMessages(true);
      previousMessagesLengthRef.current = 0;
      loadMessagesSilentlyRef
        .current?.(activeContactId)
        .finally(() => setLoadingMessages(false));
      const interval = setInterval(() => {
        if (activeContactIdRef.current) {
          loadMessagesSilentlyRef.current?.(activeContactIdRef.current);
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeContactId]);

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserName(u.nomComplet || u.nom || "");
        setRole(u.role || "CLIENT");
      } catch { /* intentionally ignored */ }
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContactId || isSending) return;

    const tempId = Date.now();
    const text = messageText.trim();
    const newMessage = {
      id: tempId,
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
      pending: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsSending(true);

    try {
      const res = await sendMessage(activeContactId, text);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: res.id,
                time: new Date(res.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                pending: false,
              }
            : m,
        ),
      );
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? { ...c, lastMessage: text, time: newMessage.time }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, failed: true, pending: false } : m,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const activeContact = contacts.find((c) => c.id === activeContactId);
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.specialty &&
        c.specialty.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // ── CSS vars depending on theme ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
    .ff { font-family: 'Fraunces', serif; }

    .gls {
      background: ${
        isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))"
          : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,255,0.85))"
      };
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(200,215,255,0.6)"};
      box-shadow: ${
        isDark
          ? "0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)"
      };
    }

    .c-active {
      background: ${isDark ? "rgba(26,111,209,0.16)" : "rgba(26,111,209,0.09)"};
      border: 1px solid ${isDark ? "rgba(26,111,209,0.38)" : "rgba(26,111,209,0.2)"};
      box-shadow: 0 2px 12px rgba(26,111,209,0.12);
    }
    .c-idle {
      border: 1px solid transparent;
    }
    .c-idle:hover {
      background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(26,111,209,0.04)"};
      border-color: ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.12)"};
    }

    .bm {
      background: linear-gradient(135deg, #2176d8 0%, #0f4fa0 100%);
      border-radius: 20px 20px 4px 20px;
      box-shadow: 0 4px 20px rgba(26,111,209,0.32);
      color: #fff;
      word-break: break-word;
    }
    .bo {
      background: ${
        isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.05))"
          : "linear-gradient(145deg, rgba(255,255,255,1), rgba(241,246,255,0.95))"
      };
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.5)"};
      border-radius: 20px 20px 20px 4px;
      box-shadow: ${isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(26,111,209,0.07)"};
      color: ${isDark ? "#f1f5f9" : "#1e2a3b"};
      word-break: break-word;
    }
    .bm-pending { opacity: 0.65; }
    .bm-failed { box-shadow: 0 4px 20px rgba(239,68,68,0.3) !important; background: linear-gradient(135deg,#dc2626,#991b1b) !important; }

    .ia {
      background: ${
        isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
          : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,248,255,0.9))"
      };
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-top: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"};
    }
    .ib {
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.98)"};
      border: 1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(190,210,255,0.5)"};
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ib:focus-within {
      border-color: #1a6fd1;
      box-shadow: 0 0 0 3px rgba(26,111,209,0.14);
    }

    .hd {
      background: ${
        isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))"
          : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,248,255,0.9))"
      };
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"};
    }

    .si {
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(240,245,255,0.95)"};
      border: 1.5px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.45)"};
      color: ${isDark ? "#f1f5f9" : "#1e2a3b"};
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .si::placeholder { color: ${isDark ? "rgba(255,255,255,0.28)" : "#aab8d0"}; }
    .si:focus { border-color: #1a6fd1; box-shadow: 0 0 0 3px rgba(26,111,209,0.12); outline: none; }

    textarea::placeholder { color: ${isDark ? "rgba(255,255,255,0.28)" : "#aab8d0"} !important; }

    .dot-bg {
      background-image: radial-gradient(${isDark ? "rgba(255,255,255,0.022)" : "rgba(26,111,209,0.06)"} 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .odot {
      background: #22c55e;
      box-shadow: 0 0 0 2.5px ${isDark ? "#0d1117" : "#fff"}, 0 0 8px rgba(34,197,94,0.5);
    }
    .sba::-webkit-scrollbar { width: 4px; height: 4px; }
    .sba::-webkit-scrollbar-track { background: transparent; }
    .sba::-webkit-scrollbar-thumb { background: ${isDark ? "rgba(255,255,255,0.11)" : "rgba(26,111,209,0.18)"}; border-radius: 4px; }
    .sba::-webkit-scrollbar-thumb:hover { background: ${isDark ? "rgba(255,255,255,0.22)" : "rgba(26,111,209,0.35)"}; }

    .sk {
      background: linear-gradient(90deg,
        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(200,215,255,0.35)"} 25%,
        ${isDark ? "rgba(255,255,255,0.09)" : "rgba(220,232,255,0.65)"} 50%,
        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(200,215,255,0.35)"} 75%
      );
      background-size: 200% 100%;
      animation: sk 1.4s infinite;
      border-radius: 8px;
    }
    @keyframes sk { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    .send-on {
      background: linear-gradient(135deg, #2176d8, #0f4fa0);
      box-shadow: 0 4px 20px rgba(26,111,209,0.38);
      color: #fff;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .send-on:hover { transform: scale(1.07); box-shadow: 0 6px 26px rgba(26,111,209,0.48); }
    .send-off {
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(200,215,255,0.35)"};
      color: ${isDark ? "rgba(255,255,255,0.22)" : "#b0c0d8"};
    }
  `;

  const avatarEl = (name: string, specialty: string, size = "w-11 h-11") => (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-bold text-base ${specialty === "Administration" ? "bg-gradient-to-br from-gray-600 to-gray-800" : "bg-gradient-to-br from-[#2176d8] to-[#0f4fa0]"}`}
      style={{ boxShadow: "0 2px 12px rgba(26,111,209,0.28)", flexShrink: 0 }}
    >
      {specialty === "Administration" ? (
        <AlertCircle size={18} />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: isDark ? "#0d1117" : "#eef2fc",
      }}
    >
      <style>{css}</style>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(10,14,22,0.72)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 ease-out z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {role === "PRESTATAIRE" ? (
          <ProviderNavbar
            activeSection="messages"
            onSectionChange={() => setIsSidebarOpen(false)}
          />
        ) : (
          <Navbar
            activeSection="messages"
            onSectionChange={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10 dot-bg">
        {role === "PRESTATAIRE" ? (
          <ProviderTopBar
            userName={userName}
            onMenuToggle={() => setIsSidebarOpen((v) => !v)}
            isMobileMenuOpen={isSidebarOpen}
          />
        ) : (
          <TopBar
            userName={userName}
            onMenuToggle={() => setIsSidebarOpen((v) => !v)}
            isMobileMenuOpen={isSidebarOpen}
          />
        )}

        <div
          className="flex-1 min-h-0 p-3 md:p-5 flex gap-3 md:gap-4 pb-20 md:pb-5"
          style={{ height: "calc(100% - 64px)" }}
        >
          {/* ═══ Contacts sidebar ═══ */}
          <div
            className={`gls rounded-2xl w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col overflow-hidden ${activeContactId ? "hidden md:flex" : "flex"}`}
          >
            {/* Header */}
            <div
              className="px-4 pt-4 pb-3 flex-shrink-0"
              style={{
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(26,111,209,0.07)"}`,
              }}
            >
              <h1
                className="ff text-lg font-bold mb-3"
                style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
              >
                Discussions
              </h1>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.3)" : "#aab8d0",
                  }}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="si w-full rounded-xl pl-9 pr-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto sba p-2 space-y-0.5">
              {loadingContacts ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="sk w-11 h-11 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="sk h-3 w-28" />
                      <div className="sk h-2.5 w-36" />
                    </div>
                  </div>
                ))
              ) : filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-50">
                  <MessageSquare
                    size={30}
                    style={{ color: isDark ? "#94a3b8" : "#94a3b8" }}
                  />
                  <p
                    className="mt-2 text-xs"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.35)" : "#94a3b8",
                    }}
                  >
                    Aucun contact
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${activeContactId === contact.id ? "c-active" : "c-idle"}`}
                  >
                    <div className="relative shrink-0">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-11 h-11 rounded-full object-cover"
                          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
                        />
                      ) : (
                        avatarEl(contact.name, contact.specialty)
                      )}
                      {contact.isOnline && (
                        <div className="odot absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{
                            color:
                              activeContactId === contact.id
                                ? "#2176d8"
                                : isDark
                                  ? "#f1f5f9"
                                  : "#1a2540",
                          }}
                        >
                          {contact.name}
                        </p>
                        <span
                          className="text-[10px] whitespace-nowrap ml-1"
                          style={{
                            color:
                              contact.unread > 0
                                ? "#2176d8"
                                : isDark
                                  ? "rgba(255,255,255,0.28)"
                                  : "#aab8d0",
                            fontWeight: contact.unread > 0 ? 600 : 400,
                          }}
                        >
                          {contact.time}
                        </span>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{
                          color:
                            contact.unread > 0
                              ? isDark
                                ? "#f1f5f9"
                                : "#1a2540"
                              : isDark
                                ? "rgba(255,255,255,0.38)"
                                : "#94a3b8",
                          fontWeight: contact.unread > 0 ? 500 : 400,
                        }}
                      >
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unread > 0 && (
                      <div
                        className="shrink-0 w-5 h-5 rounded-full bg-[#2176d8] flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ boxShadow: "0 2px 8px rgba(26,111,209,0.38)" }}
                      >
                        {contact.unread}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* ═══ Chat window ═══ */}
          <div
            className={`gls rounded-2xl flex-1 min-w-0 flex flex-col overflow-hidden ${!activeContactId ? "hidden md:flex" : "flex"}`}
          >
            {!activeContact ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: isDark
                      ? "rgba(26,111,209,0.1)"
                      : "rgba(26,111,209,0.07)",
                    border: `1px solid ${isDark ? "rgba(26,111,209,0.22)" : "rgba(26,111,209,0.14)"}`,
                  }}
                >
                  <Send size={30} style={{ color: "#2176d8", marginLeft: 3 }} />
                </div>
                <h2
                  className="ff text-lg font-bold mb-1.5"
                  style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                >
                  Vos messages
                </h2>
                <p
                  className="text-sm max-w-xs leading-relaxed"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                  }}
                >
                  {role === "PRESTATAIRE"
                    ? "Sélectionnez une conversation pour discuter avec vos clients."
                    : "Sélectionnez une conversation pour discuter avec vos prestataires."}
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="hd px-4 md:px-5 py-3 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveContactId(null)}
                      className="md:hidden p-1.5 rounded-xl"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.45)" : "#64748b",
                      }}
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <div className="relative shrink-0">
                      {activeContact.avatar ? (
                        <img
                          src={activeContact.avatar}
                          alt={activeContact.name}
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
                        />
                      ) : (
                        avatarEl(
                          activeContact.name,
                          activeContact.specialty,
                          "w-10 h-10",
                        )
                      )}
                      {activeContact.isOnline && (
                        <div className="odot absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" />
                      )}
                    </div>
                    <div
                      className={
                        activeContact.specialty !== "Administration" &&
                        activeContact.specialty !== "Client" &&
                        activeContact.providerId
                          ? "cursor-pointer"
                          : ""
                      }
                      onClick={() => {
                        if (
                          activeContact.specialty !== "Administration" &&
                          activeContact.specialty !== "Client" &&
                          activeContact.providerId
                        )
                          navigate(
                            `/Service-Provider-Profile/${activeContact.providerId}`,
                          );
                      }}
                    >
                      <h2
                        className="font-bold text-sm md:text-base leading-tight"
                        style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                      >
                        {activeContact.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "#2176d8" }}
                        >
                          {activeContact.specialty === "Administration"
                            ? "Support Officiel"
                            : activeContact.specialty}
                        </p>
                        {activeContact.isOnline && (
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold"
                            style={{ color: "#22c55e" }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            En ligne
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                        background: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(26,111,209,0.05)",
                      }}
                    >
                      <MoreVertical size={17} />
                    </button>
                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                        <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border z-50 p-1.5 transition-all ${isDark ? 'bg-[#1a1d27] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-800'}`}>
                          {activeContact.specialty !== "Administration" && activeContact.specialty !== "Client" && activeContact.providerId && (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                navigate(`/Service-Provider-Profile/${activeContact.providerId}`);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              Accéder au profil
                            </button>
                          )}
                          {role === "CLIENT" && activeContact.specialty !== "Administration" && activeContact.specialty !== "Client" && activeContact.providerId && (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsReviewOpen(true);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isDark ? 'hover:bg-white/5 text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              Donner un avis
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesAreaRef}
                  className="flex-1 overflow-y-auto sba px-4 md:px-6 py-4"
                >
                  {/* Date separator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(26,111,209,0.08)",
                      }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8",
                        background: isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(26,111,209,0.05)",
                      }}
                    >
                      Aujourd'hui
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(26,111,209,0.08)",
                      }}
                    />
                  </div>

                  {loadingMessages ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => {
                        const isMe = i % 2 !== 0;
                        return (
                          <div
                            key={i}
                            className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {!isMe && (
                              <div className="sk w-8 h-8 rounded-full shrink-0" />
                            )}
                            <div
                              className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}
                            >
                              <div
                                className={`sk rounded-2xl h-10 ${isMe ? "w-44" : "w-60"}`}
                              />
                              <div className="sk h-2 w-10" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg, index) => {
                        const isMe = msg.sender === "me";
                        const nextMsg = messages[index + 1];
                        const prevMsg = messages[index - 1];
                        const showAvatar =
                          !isMe && (!prevMsg || prevMsg.sender === "me");
                        const isLastInGroup =
                          !nextMsg || nextMsg.sender !== msg.sender;

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 14, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                            style={{
                              marginBottom: isLastInGroup ? "12px" : "3px",
                            }}
                          >
                            {/* Avatar */}
                            {!isMe && (
                              <div className="w-8 shrink-0">
                                {showAvatar &&
                                  (activeContact.avatar ? (
                                    <img
                                      src={activeContact.avatar}
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${activeContact.specialty === "Administration" ? "bg-gray-700" : "bg-gradient-to-br from-[#2176d8] to-[#0f4fa0]"}`}
                                    >
                                      {activeContact.specialty ===
                                      "Administration"
                                        ? "A"
                                        : activeContact.name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Bubble */}
                            <div
                              className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%] md:max-w-[58%]`}
                            >
                              <div
                                className={`px-4 py-2.5 text-sm leading-relaxed ${isMe ? `bm${msg.pending ? " bm-pending" : msg.failed ? " bm-failed" : ""}` : "bo"}`}
                              >
                                {msg.proposal ? (() => {
                                   const start = new Date(msg.proposal.startIso);
                                   const end = new Date(msg.proposal.endIso);
                                   const isFullDay = (start.getHours() === 0 && end.getHours() === 23) ||
                                                     (start.getHours() === 9 && end.getHours() === 8);

                                   const formatDateStr = (date: Date) => date.toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric' });
                                   const formatDateTimeStr = (date: Date) => date.toLocaleString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' à');

                                   return (
                                     <div className="space-y-2">
                                       <div className="font-semibold">
                                         {msg.proposal.isAuto ? "Décalage automatique du rendez-vous" : "Proposition de nouvelle date"}
                                       </div>
                                       <div className="text-xs opacity-80">
                                         {isFullDay ? (
                                           start.toDateString() === end.toDateString() || Math.abs(end.getTime() - start.getTime()) <= 24 * 60 * 60 * 1000 + 10000 ? (
                                             <>Le {formatDateStr(start)} (Journée entière)</>
                                           ) : (
                                             <>
                                               Du {formatDateStr(start)}
                                               <br/>
                                               Au {formatDateStr(end)} (Journée entière)
                                             </>
                                           )
                                         ) : (
                                           <>
                                             Du {formatDateTimeStr(start)}
                                             <br/>
                                             Au {formatDateTimeStr(end)}
                                           </>
                                         )}
                                       </div>
                                       {msg.proposal.note && (
                                         <div className={`text-xs opacity-90 border-t ${isDark ? 'border-white/20' : 'border-slate-300'} pt-1 mt-1`}>
                                           {msg.proposal.note}
                                         </div>
                                       )}
                                       {!isMe && (
                                         <div className="flex flex-col gap-2 mt-2">
                                           <button
                                             type="button"
                                             disabled={
                                               acceptingProposalId ===
                                               msg.proposal.rdvId
                                             }
                                             onClick={() =>
                                               handleAcceptProposal(
                                                 msg.proposal.rdvId,
                                                 msg.proposal.startIso,
                                                 msg.proposal.endIso,
                                               )
                                             }
                                             className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-60 transition-colors w-full"
                                           >
                                             {acceptingProposalId ===
                                             msg.proposal.rdvId
                                               ? "Validation..."
                                               : "Accepter la nouvelle date"}
                                           </button>
                                           <button
                                             type="button"
                                             onClick={() =>
                                               navigate(`/Service-Provider-Profile/${activeContact.providerId}?rescheduleRdvId=${msg.proposal.rdvId}`)
                                             }
                                             className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors w-full ${
                                               isDark 
                                                 ? 'bg-white/10 hover:bg-white/20 text-white' 
                                                 : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                             }`}
                                           >
                                             Choisir une autre heure
                                           </button>
                                         </div>
                                       )}
                                     </div>
                                   );
                                 })() : msg.isProposalAccepted ? (
                                  <div className="text-xs font-semibold">
                                    ✅ Nouvelle date acceptée
                                  </div>
                                ) : (
                                  msg.text
                                )}
                              </div>
                              {isLastInGroup && (
                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                  <span
                                    className="text-[10px] font-medium"
                                    style={{
                                      color: isDark
                                        ? "rgba(255,255,255,0.28)"
                                        : "#b0c0d8",
                                    }}
                                  >
                                    {msg.time}
                                  </span>
                                  {isMe &&
                                    (msg.pending ? (
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                        style={{
                                          color: isDark
                                            ? "rgba(255,255,255,0.3)"
                                            : "#b0c0d8",
                                        }}
                                      />
                                    ) : msg.failed ? (
                                      <span className="text-[10px] text-red-400">
                                        ✕
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          color: msg.isRead
                                            ? "#2176d8"
                                            : isDark
                                              ? "rgba(255,255,255,0.3)"
                                              : "#b0c0d8",
                                        }}
                                      >
                                        {msg.isRead ? (
                                          <CheckCheck size={13} />
                                        ) : (
                                          <Check size={13} />
                                        )}
                                      </span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="ia px-3 md:px-4 py-3 flex-shrink-0">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 md:gap-3 max-w-4xl mx-auto"
                  >
                    <div className="ib flex-1 rounded-2xl flex items-end overflow-hidden">
                      <button
                        type="button"
                        className="p-3 shrink-0 hidden sm:block transition-colors"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.3)" : "#aab8d0",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#f59e0b")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = isDark
                            ? "rgba(255,255,255,0.3)"
                            : "#aab8d0")
                        }
                      >
                        <Smile size={19} />
                      </button>
                      <textarea
                        ref={textareaRef}
                        value={messageText}
                        onChange={handleTextareaInput}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Écrivez votre message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3.5 px-2 resize-none outline-none min-h-[50px] max-h-32"
                        style={{
                          color: isDark ? "#f1f5f9" : "#1a2540",
                          lineHeight: "1.5",
                        }}
                        rows={1}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isSending}
                      className={`p-3 md:p-3.5 rounded-xl shrink-0 flex items-center justify-center ${messageText.trim() && !isSending ? "send-on" : "send-off"}`}
                    >
                      {isSending ? (
                        <Loader2 size={19} className="animate-spin" />
                      ) : (
                        <Send
                          size={19}
                          style={{ marginLeft: messageText.trim() ? 1 : 0 }}
                        />
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isReviewOpen && activeContact && activeContact.providerId && (
        <AddReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={() => {}}
          prestataireId={activeContact.providerId}
          rendezVousId={null}
          prestataireName={activeContact.name}
        />
      )}

      <MobileBottomNav />
    </div>
  );
};

export default Messages;
