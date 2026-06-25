import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, MessageSquare, Bell, CheckCircle2, Clock, Trash2, ArrowRight, TrendingUp, Star, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { getMyProviderProfile } from '../../services/provider/providerService';
import { getStats } from '../../services/provider/getStats';
import { getUpcoming } from '../../services/provider/upComing';
import { getLatest } from '../../services/provider/latest';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  rendezVousId?: number;
}

interface StatsData {
  revenus: number;
  rdvThisMonth: number;
  noteMoyenne: number;
  areaData: Array<{ month: string; v1: number; v2: number }>;
  barData: Array<{ day: string; v: number }>;
  donutData: Array<{ name: string; value: number; color: string }>;
}

interface UpcomingRdv {
  client: string;
  time: string;
  statut: string;
}

interface LatestRdv {
  client: string;
  time: string;
  statut: string;
}

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

interface KpiCardProps { icon: React.ReactNode; label: string; value: string; dark?: boolean; delay?: number; }
const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, dark, delay = 0 }) => {
  const { isDark } = useTheme();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      className={`p-6 flex items-center gap-5 rounded-3xl border shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 will-change-transform backdrop-blur-lg ${dark ? (isDark ? 'bg-[#0059B2]/80 border-blue-500/20' : 'bg-[#0059B2] border-blue-600') : (isDark ? 'bg-[#1A1D24]/40 border-white/10 hover:bg-[#1A1D24]/60 hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)]' : 'bg-white/40 border-white hover:bg-white/60 hover:border-blue-500/50 hover:shadow-blue-500/20')}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white/20' : (isDark ? 'bg-blue-900/20' : 'bg-blue-50')}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs mb-1 font-medium tracking-wide uppercase ${dark ? 'text-blue-100' : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>{label}</p>
        <p className={`text-3xl font-extrabold leading-none ${dark ? 'text-white' : (isDark ? 'text-white' : 'text-[#0f2a5e]')}`} style={{ fontFamily: "'Fraunces', serif" }}>{value}</p>
      </div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [prestataireId, setPrestataireId] = useState<number | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingRdv[]>([]);
  const [latest, setLatest] = useState<LatestRdv | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      const name = u.nomComplet || u.nom || 'Prestataire';
      setUserName(name);
      setFirstName(name.split(' ')[0]);
    }
    fetchProviderData();
    fetchNotifications();
  }, []);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const profile = await getMyProviderProfile();
      if (profile?.id) {
        setPrestataireId(profile.id);
        await fetchStats(profile.id);
        await fetchUpcoming(profile.id);
        await fetchLatest(profile.id);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du profil prestataire:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get('/Notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const fetchStats = async (id: number) => {
    try {
      const data = await getStats(id);
      setStats(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des stats:", err);
    }
  };

  const fetchUpcoming = async (id: number) => {
    try {
      const data = await getUpcoming(id);
      setUpcoming(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des RDV à venir:", err);
    }
  };

  const fetchLatest = async (id: number) => {
    try {
      const data = await getLatest(id);
      setLatest(data);
    } catch (err) {
      console.error("Erreur lors de la récupération du dernier RDV:", err);
    }
  };

  const markNotifAsRead = async (notif: NotificationItem) => {
    try {
      await api.put(`/Notifications/${notif.id}/read`);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteNotif = async (notif: NotificationItem) => {
    try {
      await api.delete(`/Notifications/${notif.id}`);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      toast.success("Notification supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    try {
      await Promise.all(unread.map(n => api.put(`/Notifications/${n.id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("Toutes les notifications marquées comme lues");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hier";
    return `Il y a ${days} jours`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative min-h-screen">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); }
      `}</style>

      <div className="relative z-0 pb-10">
        {/* Header matching Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl text-[#0f2a5e] dark:text-white mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
            Bonjour, {firstName} 
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            Bienvenue sur votre espace Bookify. Prêt à faire grandir votre activité aujourd'hui ?
          </p>
        </motion.div>

        {/* Stats Summary (matching Dashboard KpiCards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <KpiCard delay={0.2} icon={<Calendar size={24} className="text-[#0059B2] dark:text-blue-400" />} label="RDV ce mois" value={String(stats?.rdvThisMonth ?? 0)} />
          <KpiCard delay={0.3} icon={<DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />} label="Revenus (ACCEPTE)" value={`${(stats?.revenus ?? 0).toLocaleString()} DH`} />
          <KpiCard delay={0.4} icon={<Star size={24} className="text-yellow-600 dark:text-yellow-400" />} label="Note moyenne" value={stats?.noteMoyenne ? String(stats.noteMoyenne) : '0'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Notifications Section */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="flex-1 p-0 overflow-hidden" delay={0.5}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 pb-4 gap-4">
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white flex items-center gap-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                <Bell size={22} className="text-[#0059B2] dark:text-blue-400" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-bold px-3 py-1 rounded-full">
                    {unreadCount} non lu{unreadCount > 1 ? 'es' : 'e'}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-[#0059B2] dark:text-blue-400 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                >
                  <CheckCircle2 size={14} /> Tout marquer comme lu
                </button>
              )}
            </div>

            {notifLoading ? (
              <div className="p-10 text-center text-gray-500 font-medium">Chargement des notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Bell size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Aucune notification pour le moment.</p>
                <p className="text-gray-400 text-sm mt-1">Vous serez notifié lors de nouvelles réservations ou messages.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {notifications.map((notif, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 + (index * 0.05) }}
                    key={notif.id}
                    className={`p-6 relative group rounded-2xl mx-2 my-1 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      notif.isRead
                        ? 'bg-transparent hover:bg-white/60 dark:hover:bg-[#1A1D24]/80'
                        : 'bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:shadow-blue-500/10'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-2 flex-shrink-0">
                        {!notif.isRead ? (
                          <div className="w-3 h-3 rounded-full bg-[#0059B2] dark:bg-blue-400 shadow-[0_0_8px_rgba(0,89,178,0.5)]" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-base truncate ${
                          !notif.isRead ? 'font-bold text-[#0f2a5e] dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'
                        }`}>
                          {notif.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-5 mt-4">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <Clock size={14} /> {getTimeAgo(notif.createdAt)}
                          </span>
                          {!notif.isRead && (
                            <button 
                              onClick={() => markNotifAsRead(notif)}
                              className="text-xs font-bold text-[#0059B2] dark:text-blue-400 hover:underline flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={14} /> Marquer comme lue
                            </button>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteNotif(notif)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 absolute right-4 top-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Tips */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          <Card delay={0.6}>
            <h3 className="text-2xl text-[#0f2a5e] dark:text-white mb-6" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Accès rapide</h3>
            <div className="flex flex-col gap-4">
              <motion.button 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
                onClick={() => navigate('/Mes-Services-Provider')}
                className="group p-4 rounded-2xl bg-white/40 dark:bg-[#1A1D24]/40 hover:bg-emerald-50/80 dark:hover:bg-[#1A1D24]/60 flex items-center gap-4 text-left border border-white dark:border-white/10 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-400/50 active:translate-y-0 transition-all duration-300 backdrop-blur-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                  <PlusCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0f2a5e] dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Ajouter un service</h4>
                  <p className="text-xs text-gray-500 mt-1">Étoffez votre catalogue</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
              </motion.button>

              <motion.button 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
                onClick={() => navigate('/Messages')}
                className="group p-4 rounded-2xl bg-white/40 dark:bg-[#1A1D24]/40 hover:bg-purple-50/80 dark:hover:bg-[#1A1D24]/60 flex items-center gap-4 text-left border border-white dark:border-white/10 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-400/50 active:translate-y-0 transition-all duration-300 backdrop-blur-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
                  <MessageSquare size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-[#0f2a5e] dark:text-white text-sm group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">Vos messages</h4>
                  <p className="text-xs text-gray-500 mt-1">Répondez à vos clients</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
              </motion.button>
            </div>
          </Card>

          {upcoming.length > 0 && (
            <Card delay={0.8}>
              <h3 className="text-2xl text-[#0f2a5e] dark:text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                <Calendar size={24} className="text-[#0059B2]" />
                Prochains rendez-vous
              </h3>
              <div className="space-y-3">
                {upcoming.map((rdv, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-[#1A1D24]/40 border border-white dark:border-white/10 hover:bg-white/60 dark:hover:bg-[#1A1D24]/60 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar size={18} className="text-[#0059B2] dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f2a5e] dark:text-white text-sm">{rdv.client}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rdv.time}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      rdv.statut === 'CONFIRME' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      rdv.statut === 'TERMINE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      rdv.statut === 'ANNULE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {rdv.statut}
                    </span>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => navigate('/Mes-Rendez-Vous-Provider')}
                className="w-full mt-4 text-center text-sm font-semibold text-[#0059B2] dark:text-blue-400 hover:underline"
              >
                Voir tous les rendez-vous
              </button>
            </Card>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}
            className="rounded-3xl p-8 backdrop-blur-lg border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(0,89,178,0.25)] bg-[#0059B2]/80 dark:bg-[#0059B2]/60 border-blue-400/30 hover:border-blue-300/60 shadow-lg"
          >
            <TrendingUp size={32} className="mb-4 text-blue-100" />
            <h3 className="text-2xl text-white mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Astuce Bookify</h3>
            <p className="text-blue-50 text-sm leading-relaxed mb-6 font-medium">
              Les prestataires qui mettent à jour leurs disponibilités 1 mois à l'avance reçoivent en moyenne 40% de réservations en plus.
            </p>
            <button 
              onClick={() => navigate('/Disponibilites-Provider')}
              className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/30 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Mettre à jour
            </button>
          </motion.div>

        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;