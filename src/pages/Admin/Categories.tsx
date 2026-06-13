import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  X,
  AlertTriangle,
  Tag,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/Admin/adminService";

interface Category {
  idCategorie: number;
  nom: string;
  description?: string;
  isActive: boolean;
  servicesCount: number;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-xl bg-gray-200/60 dark:bg-white/5 ${className}`}
  />
);

// ── Modal ─────────────────────────────────────────────────────────────────────
const CategoryModal: React.FC<{
  isDark: boolean;
  category?: Category;
  onClose: () => void;
  onSave: (data: {
    nom: string;
    description?: string;
    isActive: boolean;
  }) => void;
}> = ({ isDark, category, onClose, onSave }) => {
  const [nom, setNom] = useState(category?.nom ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    onSave({
      nom: nom.trim(),
      description: description.trim() || undefined,
      isActive,
    });
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md rounded-2xl overflow-hidden backdrop-blur-[40px]"
        style={{
          background: isDark ? "rgba(8,14,30,0.88)" : "rgba(255,255,255,0.82)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.9)"}`,
          boxShadow: isDark
            ? "0 32px 80px rgba(0,0,0,0.7)"
            : "0 32px 80px rgba(80,120,200,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? "border-white/[0.08]" : "border-white/50"}`}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
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
              Nom
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              placeholder="Ex: Jardinage, Plomberie…"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${isDark ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500/60" : "bg-black/5 border-black/10 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white/70"}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description…"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${isDark ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-blue-500/60" : "bg-black/5 border-black/10 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white/70"}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Statut
            </label>
            <div className="flex gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setIsActive(val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    isActive === val
                      ? val
                        ? "bg-green-50 dark:bg-green-500/10 border-green-400 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-500/10 border-red-400 text-red-700 dark:text-red-400"
                      : isDark
                        ? "border-gray-700 text-gray-400 hover:bg-slate-800"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {val ? "Actif" : "Inactif"}
                </button>
              ))}
            </div>
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
              {category ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const Categories = () => {
  const { isDark } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const load = () => setRefreshCounter((c) => c + 1);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) {
          setCategories(data);
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

  const handleAdd = async ({
    nom,
    description,
    isActive,
  }: {
    nom: string;
    description?: string;
    isActive: boolean;
  }) => {
    try {
      await createCategory({ nom, description });
      toast.success(`"${nom}" ajoutée !`);
      setShowAddModal(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erreur lors de la création.");
    }
  };

  const handleEdit = async ({
    nom,
    description,
    isActive,
  }: {
    nom: string;
    description?: string;
    isActive: boolean;
  }) => {
    if (!editTarget) return;
    try {
      await updateCategory(editTarget.idCategorie, {
        nom,
        description,
        isActive,
      });
      toast.success("Catégorie mise à jour.");
      setEditTarget(null);
      load();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.idCategorie);
      toast.success(`"${deleteTarget.nom}" supprimée.`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Catégories de Services
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading
              ? "…"
              : `${categories.length} catégorie${categories.length !== 1 ? "s" : ""} au total`}
          </p>
        </div>
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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> Ajouter une Catégorie
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : (
            <AnimatePresence>
              {categories.map((cat) => (
                <motion.div
                  key={cat.idCategorie}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? "border-gray-800 bg-slate-800/30 hover:bg-slate-800/60" : "border-gray-100 bg-white hover:shadow-md hover:border-blue-100"}`}
                >
                  <div className="flex items-center gap-4">
                    <button className="text-gray-300 dark:text-gray-600 cursor-grab">
                      <GripVertical size={20} />
                    </button>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-slate-700" : "bg-blue-50"}`}
                    >
                      <Tag size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {cat.nom}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {cat.description ||
                          `${cat.servicesCount} prestataire${cat.servicesCount !== 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cat.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
                    >
                      {cat.isActive ? "Actif" : "Inactif"}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditTarget(cat)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {!loading && categories.length === 0 && (
            <div className="py-14 text-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Tag size={40} strokeWidth={1.5} />
                <p className="font-medium">Aucune catégorie</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Ajouter la première
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <CategoryModal
            isDark={isDark}
            onClose={() => setShowAddModal(false)}
            onSave={handleAdd}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editTarget && (
          <CategoryModal
            isDark={isDark}
            category={editTarget}
            onClose={() => setEditTarget(null)}
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>
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
                className="w-full max-w-sm rounded-2xl p-6 backdrop-blur-[40px]"
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
                      Supprimer la catégorie
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Action irréversible.
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm mb-6 p-3 rounded-xl ${isDark ? "bg-white/5 text-gray-300" : "bg-black/[0.04] text-gray-700"}`}
                >
                  Supprimer{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    "{deleteTarget.nom}"
                  </span>{" "}
                  ?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${isDark ? "border-gray-700 text-gray-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmDelete}
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

export default Categories;
