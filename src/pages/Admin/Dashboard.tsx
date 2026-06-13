import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  UserPlus,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getAdminStats,
  getRecentActivity,
} from "../../services/Admin/adminService";

interface Stats {
  totalUsers: number;
  usersTrend: number;
  totalBookings: number;
  bookingsTrend: number;
  acceptanceRate: number;
  totalRevenue: number;
  revenueTrend: number;
  bookingsByDay: { name: string; total: number }[];
  bookingsByStatus: { name: string; value: number; color: string }[];
}

interface Activity {
  type: string;
  text: string;
  sub: string;
  timeAgo: string;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-xl bg-gray-200/40 dark:bg-white/5 ${className}`}
  />
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  gradient,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
  gradient: string;
  loading: boolean;
}) => (
  <div className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-4">
    {loading ? (
      <>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
        </div>
        <Skeleton className="h-5 w-32" />
      </>
    ) : (
      <>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </h3>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${gradient}`}
          >
            <Icon size={22} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              trendUp
                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight size={11} />
            ) : (
              <ArrowDownRight size={11} />
            )}{" "}
            {trend}
          </span>
          <span className="text-xs text-gray-400">vs mois dernier</span>
        </div>
      </>
    )}
  </div>
);

const Dashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getAdminStats(), getRecentActivity()])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const activityIcons: Record<
    string,
    { icon: React.ElementType; color: string; bg: string }
  > = {
    user: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
    booking: { icon: Calendar, color: "text-green-500", bg: "bg-green-500/10" },
    block: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    default: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  };

  if (error)
    return (
      <div className="glass-card rounded-2xl p-10 text-center text-gray-400">
        <p className="font-medium">Impossible de charger les statistiques.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-blue-500 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          loading={loading}
          title="Total Utilisateurs"
          value={stats ? stats.totalUsers.toLocaleString("fr-FR") : "—"}
          icon={Users}
          trend={`${Math.abs(stats?.usersTrend ?? 0)}%`}
          trendUp={(stats?.usersTrend ?? 0) >= 0}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          loading={loading}
          title="Rendez-vous"
          value={stats ? stats.totalBookings.toLocaleString("fr-FR") : "—"}
          icon={Calendar}
          trend={`${Math.abs(stats?.bookingsTrend ?? 0)}%`}
          trendUp={(stats?.bookingsTrend ?? 0) >= 0}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        />
        <StatCard
          loading={loading}
          title="Taux d'acceptation"
          value={stats ? `${stats.acceptanceRate}%` : "—"}
          icon={CheckCircle}
          trend="—"
          trendUp={true}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          loading={loading}
          title="Revenus Générés"
          value={
            stats ? `${stats.totalRevenue.toLocaleString("fr-FR")} DH` : "—"
          }
          icon={TrendingUp}
          trend={`${Math.abs(stats?.revenueTrend ?? 0)}%`}
          trendUp={(stats?.revenueTrend ?? 0) >= 0}
          gradient="bg-gradient-to-br from-orange-500 to-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Évolution des Rendez-vous
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            7 derniers jours
          </p>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.bookingsByDay ?? []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#1e293b" : "#f1f5f9"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1e293b" : "#fff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: "0.75rem",
                      fontSize: "13px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Statut des Réservations
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Répartition globale
          </p>
          {loading ? (
            <Skeleton className="h-52 w-full mt-2" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.bookingsByStatus ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(stats?.bookingsByStatus ?? []).map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#fff",
                        borderColor: isDark ? "#334155" : "#e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2 mt-1">
                {(stats?.bookingsByStatus ?? []).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        {s.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {s.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5">
          Activité Récente
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            Aucune activité récente.
          </p>
        ) : (
          <div className="space-y-1">
            {activity.map((item, i) => {
              const cfg = activityIcons[item.type] ?? activityIcons.default;
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}
                  >
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.sub}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {item.timeAgo}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
