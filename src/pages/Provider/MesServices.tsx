import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Briefcase,
  Clock,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Image as ImageIcon,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import toast from "react-hot-toast";

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: number;
  unitDuration: "HEURE" | "JOUR";
  isFullDay: boolean;
  images: string[];
}

const MesServices = () => {
  const { isDark } = useTheme();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<number | null>(
    null,
  );
  const [confirmMode, setConfirmMode] = useState<"add" | "edit" | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Services/mine");
      const mapped = res.data.map((s: any) => ({
        id: s.idService,
        title: s.nom,
        description: s.description,
        price: s.prix,
        duration: s.duree,
        unitDuration: (String(s.uniteDuree || "HEURE").toUpperCase() === "JOUR"
          ? "JOUR"
          : "HEURE") as "HEURE" | "JOUR",
        isFullDay: Boolean(s.isFullDay),
        images: s.images || [],
      }));
      setServices(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des services.");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<{
    title: string;
    price: number | "";
    duration: number | "";
    description: string;
    mode: "HOURLY" | "FULL_DAY";
    images: { url: string; file?: File }[];
  }>({
    title: "",
    price: "",
    duration: "",
    description: "",
    mode: "HOURLY",
    images: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      price: "",
      duration: "",
      description: "",
      mode: "HOURLY",
      images: [],
    });
    setEditingService(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      price: service.price,
      duration: service.duration,
      description: service.description,
      mode:
        service.isFullDay || service.unitDuration === "JOUR"
          ? "FULL_DAY"
          : "HOURLY",
      images: service.images.map((url) => ({ url })),
    });
    setShowFormModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (formData.images.length + files.length > 4) {
        toast.error(
          "Vous ne pouvez pas ajouter plus de 4 photos par prestation.",
        );
        return;
      }
      const newItems = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        file,
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newItems],
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (index: number, direction: 1 | -1) => {
    setFormData((prev) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.images.length) return prev;
      const newImages = [...prev.images];
      const temp = newImages[index];
      newImages[index] = newImages[newIndex];
      newImages[newIndex] = temp;
      return { ...prev, images: newImages };
    });
  };

  const handleFormSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Le titre du service est obligatoire.");
      return;
    }
    if (formData.price === "" || Number(formData.price) <= 0) {
      toast.error("Veuillez saisir un prix valide.");
      return;
    }
    if (formData.duration === "" || Number(formData.duration) <= 0) {
      toast.error(
        formData.mode === "FULL_DAY"
          ? "Veuillez saisir une durée en jours valide."
          : "Veuillez saisir une durée en heures valide.",
      );
      return;
    }

    setConfirmMode(editingService ? "edit" : "add");
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("Nom", formData.title);
      payload.append("Description", formData.description);
      payload.append("Prix", String(formData.price));
      payload.append("Duree", String(formData.duration));
      payload.append(
        "UniteDuree",
        formData.mode === "FULL_DAY" ? "JOUR" : "HEURE",
      );
      payload.append("IsFullDay", String(formData.mode === "FULL_DAY"));

      if (formData.images) {
        formData.images.forEach((img) => {
          if (img.file) {
            payload.append("ExistingImages", "__NEW__");
            payload.append("ImagesFiles", img.file);
          } else {
            payload.append("ExistingImages", img.url);
          }
        });
      }

      if (confirmMode === "add") {
        await api.post("/Services", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Service créé avec succès !");
      } else if (confirmMode === "edit" && editingService) {
        await api.put(`/Services/${editingService.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Service modifié avec succès !");
      }

      await fetchServices();
      setConfirmMode(null);
      setShowFormModal(false);
      setEditingService(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingServiceId) {
      setIsSaving(true);
      try {
        await api.delete(`/Services/${deletingServiceId}`);
        toast.success("Service supprimé avec succès.");
        setServices(services.filter((s) => s.id !== deletingServiceId));
      } catch (err) {
        toast.error("Erreur lors de la suppression.");
      } finally {
        setIsSaving(false);
        setDeletingServiceId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#0059B2] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">
          Chargement de vos prestations...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="p-6 max-w-7xl mx-auto relative z-0"
      >
        {/* Hide default number arrows (spinners) globally for this component */}
        <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} flex items-center gap-2`}
            >
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <Briefcase size={24} />
              </div>
              Vos Prestations
            </h1>
            <p
              className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Gérez votre catalogue de services, modifiez vos tarifs et ajoutez
              des photos attractives.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="group relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            <span className="relative flex items-center gap-2 z-10">
              <Plus
                size={18}
                className="transition-transform group-hover:rotate-90 duration-300"
              />
              Ajouter un service
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-3xl p-6 border backdrop-blur-lg h-full flex flex-col relative group transition-all duration-300 will-change-transform ${
                isDark
                  ? "bg-[#1A1D24]/40 border-white/10 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.25)] hover:bg-[#1A1D24]/60 hover:-translate-y-2"
                  : "bg-white/40 border-white shadow-sm hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2"
              }`}
              onMouseLeave={() => setOpenDropdownId(null)}
            >
              {/* Image header */}
              <div className="relative h-48 bg-gray-100 dark:bg-[#1A1D24] overflow-hidden rounded-2xl mb-6">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <ImageIcon size={48} />
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Actions */}
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenEdit(service);
                    }}
                    className={`p-2 rounded-xl backdrop-blur-md shadow-lg transition-colors ${isDark ? "bg-black/60 text-white hover:bg-blue-500/80 hover:text-white" : "bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingServiceId(service.id);
                    }}
                    className={`p-2 rounded-xl backdrop-blur-md shadow-lg transition-colors ${isDark ? "bg-black/60 text-white hover:bg-rose-500/80 hover:text-white" : "bg-white/90 text-gray-700 hover:bg-rose-50 hover:text-rose-600"}`}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3
                  className={`text-lg font-bold mb-2 line-clamp-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-sm mb-5 line-clamp-2 flex-1 ${isDark ? "text-gray-400" : "text-gray-500"} leading-relaxed`}
                >
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black text-lg">
                    <span>
                      {service.price}{" "}
                      <span className="text-sm font-bold uppercase tracking-wider opacity-70 ml-0.5">
                        MAD
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                    <Clock size={14} className="text-gray-400" />{" "}
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {service.duration}{" "}
                      {service.unitDuration === "JOUR" ? "j" : "h"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {services.length === 0 && (
            <div
              className={`col-span-full flex flex-col items-center justify-center p-16 rounded-[2rem] border-2 border-dashed ${isDark ? "border-gray-700 bg-white/[0.02] backdrop-blur-md" : "border-gray-300 bg-white/50 backdrop-blur-md"}`}
            >
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 shadow-inner">
                <Briefcase size={40} className="text-blue-500" />
              </div>
              <h3
                className={`text-2xl font-bold mb-3 ${isDark ? "text-gray-300" : "text-gray-800"}`}
              >
                Aucun service disponible
              </h3>
              <p
                className={`text-center max-w-md text-sm leading-relaxed ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Vous n'avez pas encore configuré votre catalogue. Créez votre
                première prestation pour permettre à vos clients de réserver.
              </p>
              <button
                onClick={handleOpenAdd}
                className="group relative overflow-hidden mt-8 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2 z-10">
                  <Plus
                    size={18}
                    className="transition-transform group-hover:rotate-90 duration-300"
                  />
                  Créer mon premier service
                </span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Form Modal (Add / Edit) */}
      <AnimatePresence>
        {showFormModal && !confirmMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md z-[100] overflow-y-auto"
            onClick={() => {
              setShowFormModal(false);
              setEditingService(null);
            }}
          >
            <div className="flex min-h-full p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className={`m-auto w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl border text-left ${isDark ? "bg-[#0f1115]/90 border-white/10 backdrop-blur-2xl" : "bg-white/90 border-white backdrop-blur-2xl"}`}
              >
                <div
                  className={`px-8 py-6 border-b ${isDark ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isDark ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
                    >
                      {editingService ? (
                        <Edit2 size={22} />
                      ) : (
                        <Briefcase size={22} />
                      )}
                    </div>
                    <div>
                      <h2
                        className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        {editingService
                          ? "Modifier la prestation"
                          : "Nouvelle Prestation"}
                      </h2>
                      <p
                        className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {editingService
                          ? "Modifiez librement vos informations"
                          : "Complétez les informations de votre service"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingService(null);
                    }}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-7">
                  {/* Image Uploader */}
                  <div className="space-y-3">
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Photos du service
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 dark:border-white/10 shadow-sm"
                        >
                          <img
                            src={img.url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] gap-2">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, -1)}
                                className="p-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-lg active:scale-95"
                                title="Déplacer à gauche"
                              >
                                <ChevronLeft size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg active:scale-95"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                            {idx < formData.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 1)}
                                className="p-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-lg active:scale-95"
                                title="Déplacer à droite"
                              >
                                <ChevronLeft size={16} className="rotate-180" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${isDark ? "border-white/10 hover:border-blue-500 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400" : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600"}`}
                      >
                        <UploadCloud size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Ajouter
                        </span>
                      </button>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Titre du service
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Ex: Coupe de cheveux, Réparation..."
                      className={`w-full px-5 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white focus:border-blue-500 focus:bg-black/40" : "bg-white/50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Type de service
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            mode: "HOURLY",
                            duration:
                              formData.duration === "" ? 1 : formData.duration,
                          })
                        }
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.mode === "HOURLY" ? (isDark ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700") : isDark ? "bg-black/20 border-white/10 text-gray-300 hover:border-blue-500/30" : "bg-white/50 border-gray-200 text-gray-700 hover:border-blue-300"}`}
                      >
                        Par heure
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            mode: "FULL_DAY",
                            duration:
                              formData.duration === "" ? 1 : formData.duration,
                          })
                        }
                        className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${formData.mode === "FULL_DAY" ? (isDark ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700") : isDark ? "bg-black/20 border-white/10 text-gray-300 hover:border-emerald-500/30" : "bg-white/50 border-gray-200 text-gray-700 hover:border-emerald-300"}`}
                      >
                        Journée complète
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Prix
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          placeholder="0.00"
                          className={`w-full pl-5 pr-14 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white focus:border-blue-500 focus:bg-black/40" : "bg-white/50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"}`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          MAD
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Durée
                      </label>
                      <div className="relative">
                        <Clock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="number"
                          min={1}
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          placeholder="1"
                          className={`w-full pl-11 pr-14 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white focus:border-blue-500 focus:bg-black/40" : "bg-white/50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"}`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          {formData.mode === "FULL_DAY" ? "J" : "H"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder={
                        formData.mode === "FULL_DAY"
                          ? "Décrivez votre prestation journalière (ce qui est inclus par jour, conditions, etc.)..."
                          : "Décrivez votre prestation en quelques mots (ce qui est inclus, conditions, etc.)..."
                      }
                      className={`w-full px-5 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all resize-none custom-scrollbar ${isDark ? "bg-black/20 border-white/10 text-white focus:border-blue-500 focus:bg-black/40" : "bg-white/50 border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"}`}
                    />
                  </div>
                </div>

                <div
                  className={`px-8 py-6 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 ${isDark ? "border-white/10 bg-black/20" : "border-gray-100 bg-gray-50/50"}`}
                >
                  <button
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingService(null);
                    }}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${isDark ? "text-gray-300 hover:bg-white/10" : "text-gray-600 hover:bg-gray-200"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleFormSubmit}
                    className="group relative overflow-hidden px-8 py-3 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="relative flex items-center justify-center gap-1 z-10">
                      Continuer{" "}
                      <ChevronLeft
                        size={16}
                        className="inline rotate-180 transition-transform group-hover:translate-x-1 duration-300"
                      />
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal (For Add / Edit) */}
      <AnimatePresence>
        {confirmMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md z-[200] overflow-y-auto"
            onClick={() => setConfirmMode(null)}
          >
            <div className="flex min-h-full p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`m-auto w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border p-8 text-left ${isDark ? "bg-[#111318]/95 border-white/10 backdrop-blur-2xl" : "bg-white/95 border-white backdrop-blur-2xl"}`}
              >
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${confirmMode === "edit" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"}`}
                >
                  {confirmMode === "edit" ? (
                    <Edit2 size={32} />
                  ) : (
                    <CheckCircle2 size={36} />
                  )}
                </div>

                <h2
                  className={`text-2xl font-black text-center mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {confirmMode === "edit"
                    ? "Confirmer la modification"
                    : "Confirmer la création"}
                </h2>
                <p
                  className={`text-sm text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Veuillez vérifier les informations de votre service avant de
                  valider.
                </p>

                {/* Data Summary Box */}
                <div
                  className={`p-4 rounded-2xl mb-8 space-y-4 shadow-sm border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}
                >
                  <div className="flex justify-between items-start border-b pb-3 border-gray-200 dark:border-white/5">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Titre
                    </span>
                    <span
                      className={`text-sm font-bold text-right ml-4 line-clamp-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}
                    >
                      {formData.title || "Non spécifié"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-white/5">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Prix
                    </span>
                    <span
                      className={`text-sm font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {formData.price || 0} MAD
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-white/5">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Type
                    </span>
                    <span
                      className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {formData.mode === "FULL_DAY"
                        ? "Journée complète"
                        : "Par heure"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Durée
                    </span>
                    <span
                      className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {formData.duration || 0}{" "}
                      {formData.mode === "FULL_DAY" ? "jour(s)" : "heure(s)"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleConfirmSave}
                    disabled={isSaving}
                    className={`group relative overflow-hidden w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 ${confirmMode === "edit" ? "hover:shadow-blue-500/25" : "hover:shadow-emerald-500/25"}`}
                  >
                    <div
                      className={`absolute inset-0 transition-opacity duration-300 opacity-100 group-hover:opacity-0 ${confirmMode === "edit" ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                    />
                    <div
                      className={`absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${confirmMode === "edit" ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gradient-to-r from-emerald-400 to-teal-400"}`}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSaving && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {isSaving ? "Traitement..." : "Oui, je confirme"}
                    </span>
                  </button>
                  <button
                    onClick={() => setConfirmMode(null)}
                    disabled={isSaving}
                    className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <ChevronLeft size={18} /> Retour au formulaire
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingServiceId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md z-[200] overflow-y-auto"
            onClick={() => setDeletingServiceId(null)}
          >
            <div className="flex min-h-full p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`m-auto w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border text-center p-8 ${isDark ? "bg-[#111318]/90 border-white/10 backdrop-blur-2xl" : "bg-white/90 border-white backdrop-blur-2xl"}`}
              >
                <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-50"></div>
                  <AlertTriangle size={36} className="relative z-10" />
                </div>
                <h2
                  className={`text-2xl font-black mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Êtes-vous sûr ?
                </h2>
                <p
                  className={`text-sm mb-8 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Voulez-vous vraiment supprimer ce service ? Cette action est
                  irréversible et retirera le service de votre catalogue public.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmDelete}
                    disabled={isSaving}
                    className="group relative overflow-hidden w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-sm hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-500 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-red-400 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSaving && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      {isSaving
                        ? "Suppression..."
                        : "Oui, supprimer définitivement"}
                    </span>
                  </button>
                  <button
                    onClick={() => setDeletingServiceId(null)}
                    disabled={isSaving}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    Non, annuler
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MesServices;
