import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  MoreVertical,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
} from "../../services/Admin/adminService";

type UserRole = "CLIENT" | "PRESTATAIRE";

interface User {
  idUtilisateur: number;
  nomComplet: string;
  email: string;
  role: string;
  isBlocked: boolean;
  creerA?: string;
  avatar?: string;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-lg bg-gray-200/60 dark:bg-white/5 ${className}`}
  />
);

const Users = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<UserRole>("CLIENT");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = () => setRefreshCounter((c) => c + 1);

  useEffect(() => {
    let active = true;
    getAllUsers()
      .then((data) => {
        if (active) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          toast.error("Erreur de chargement.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [refreshCounter]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.role?.toUpperCase() === activeTab &&
      (u.nomComplet.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())),
  );

  const counts: Record<UserRole, number> = {
    CLIENT: users.filter((u) => u.role?.toUpperCase() === "CLIENT").length,
    PRESTATAIRE: users.filter((u) => u.role?.toUpperCase() === "PRESTATAIRE")
      .length,
  };

  const handleToggleBlock = async (user: User) => {
    setOpenMenuId(null);
    try {
      const res = await toggleBlockUser(user.idUtilisateur);
      setUsers((prev) =>
        prev.map((u) =>
          u.idUtilisateur === user.idUtilisateur
            ? { ...u, isBlocked: res.isBlocked }
            : u,
        ),
      );
      toast.success(res.message);
    } catch {
      toast.error("Erreur lors du blocage.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.idUtilisateur);
      setUsers((prev) =>
        prev.filter((u) => u.idUtilisateur !== deleteTarget.idUtilisateur),
      );
      toast.success(`${deleteTarget.nomComplet} supprimé.`);
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
    setDeleteTarget(null);
  };

  const formatDate = (u: User) => {
    if (!u.creerA) return "—";
    return new Date(u.creerA).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Utilisateurs
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className={`p-2 rounded-xl border transition-colors ${isDark ? "border-gray-700 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}
          >
            <RefreshCw
              size={16}
              className={`text-gray-400 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <div className="flex gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            {(["CLIENT", "PRESTATAIRE"] as UserRole[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
              >
                {tab === "CLIENT" ? "Clients" : "Prestataires"}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300" : "bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300"}`}
                >
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row justify-between gap-4 ${isDark ? "border-gray-800" : "border-gray-100"}`}
        >
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou email…"
              className={`w-full pl-10 pr-8 py-2.5 rounded-xl text-sm border outline-none transition-colors ${isDark ? "bg-slate-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white"}`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <span className="self-center text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`text-sm ${isDark ? "bg-slate-800/50 text-gray-400" : "bg-gray-50/50 text-gray-500"}`}
              >
                <th className="px-6 py-4 font-medium border-b dark:border-gray-800">
                  Nom
                </th>
                <th className="px-6 py-4 font-medium border-b dark:border-gray-800">
                  Email
                </th>
                <th className="px-6 py-4 font-medium border-b dark:border-gray-800">
                  Inscription
                </th>
                <th className="px-6 py-4 font-medium border-b dark:border-gray-800">
                  Statut
                </th>
                <th className="px-6 py-4 font-medium border-b dark:border-gray-800 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className={`border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                <AnimatePresence>
                  {filtered.map((user) => (
                    <motion.tr
                      key={user.idUtilisateur}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`group border-b last:border-0 transition-colors ${isDark ? "border-gray-800 hover:bg-slate-800/30" : "border-gray-100 hover:bg-gray-50/50"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                              alt=""
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                              {user.nomComplet.charAt(0)}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {user.nomComplet}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(user)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.isBlocked ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"}`}
                        >
                          {user.isBlocked ? (
                            <XCircle size={12} />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          {user.isBlocked ? "Bloqué" : "Actif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`p-2 transition-colors rounded-lg ${user.isBlocked ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10" : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`}
                            title={user.isBlocked ? "Réactiver" : "Bloquer"}
                          >
                            {user.isBlocked ? <Shield size={16} /> : <ShieldOff size={16} />}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search size={34} strokeWidth={1.5} />
                      <p className="font-medium">Aucun utilisateur trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div
          className={`p-4 border-t flex justify-between items-center text-sm ${isDark ? "border-gray-800 text-gray-400" : "border-gray-100 text-gray-500"}`}
        >
          <span>
            Affichage de {filtered.length} sur{" "}
            {users.filter((u) => u.role?.toUpperCase() === activeTab).length}
          </span>
        </div>
      </div>

      {/* Delete modal */}
      {createPortal(
        <AnimatePresence>
          {deleteTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-md rounded-2xl p-6 backdrop-blur-[40px]"
                style={{
                  background: isDark
                    ? "rgba(8,14,30,0.88)"
                    : "rgba(255,255,255,0.82)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.9)"}`,
                  boxShadow: isDark
                    ? "0 32px 80px rgba(0,0,0,0.7)"
                    : "0 32px 80px rgba(80,120,200,0.12)",
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
                      Supprimer l'utilisateur
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cette action est irréversible.
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm mb-6 p-3 rounded-xl ${isDark ? "bg-white/5 text-gray-300" : "bg-black/[0.04] text-gray-700"}`}
                >
                  Supprimer{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {deleteTarget.nomComplet}
                  </span>{" "}
                  ({deleteTarget.email}) ?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-gray-700 hover:bg-slate-800 text-gray-300" : "border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
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

export default Users;
