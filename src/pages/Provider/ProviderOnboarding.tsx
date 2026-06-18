import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateMyProviderProfile } from "../../services/provider/providerService";
import { uploadAvatar } from "../../services/provider/avatarService";
import { addService } from "../../services/provider/serviceService";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Briefcase, FileText, ArrowRight, ArrowLeft, CheckCircle2, UploadCloud, PlusCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";

const ADRESSES_AUTORISEES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Oujda"
];

const CATEGORIES = [
  "Santé & médical", "Beauté & Bien-être", "Services professionnels", "Services techniques"
];

const SPECIALITES: Record<string, string[]> = {
  "Santé & médical": ["Médecin Généraliste", "Dentiste", "Kinésithérapeute", "Infirmier", "Psychologue", "Autre"],
  "Beauté & Bien-être": ["Coiffeur", "Esthéticienne", "Masseur", "Maquilleur", "Manucure", "Autre"],
  "Services professionnels": ["Avocat", "Comptable", "Consultant", "Architecte", "Traducteur", "Autre"],
  "Services techniques": ["Plombier", "Électricien", "Mécanicien", "Informaticien", "Menuisier", "Autre"]
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ProviderOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    adresse: "",
    categorie: "",
    specialite: "",
    bio: "",
    avatar: "",
    enLocal: false,
    aDomicile: false,
  });

  const [customSpecialite, setCustomSpecialite] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [serviceData, setServiceData] = useState({
    nom: "",
    prix: 0,
    duree: 1,
    uniteDuree: "Heures",
    description: ""
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "PRESTATAIRE") {
        navigate("/");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return position === null ? null : <Marker position={position}></Marker>;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.enLocal && !formData.aDomicile) {
        setError("Veuillez choisir au moins un mode d'intervention.");
        return;
      }
      if (!formData.adresse) {
        setError("Veuillez sélectionner une ville principale.");
        return;
      }
      setError("");
      setStep(2);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(1);
  };

  const submitProfileAndGoToAvatar = async () => {
    if (!formData.categorie || !formData.specialite || !formData.bio) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const finalSpecialite = formData.specialite === "Autre" ? customSpecialite : formData.specialite;

      const payload = {
        nomComplet: JSON.parse(localStorage.getItem("user") || "{}").nom || "Prestataire",
        telephone: JSON.parse(localStorage.getItem("user") || "{}").telephone || "0000000000",
        avatar: formData.avatar,
        adresse: formData.adresse,
        categorie: formData.categorie,
        specialite: finalSpecialite,
        bio: formData.bio,
        latitude: position?.lat,
        longitude: position?.lng,
        enLocal: formData.enLocal,
        aDomicile: formData.aDomicile
      };

      await updateMyProviderProfile(payload);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.adresse = formData.adresse;
      localStorage.setItem("user", JSON.stringify(user));

      setStep(3); // Go to Avatar
    } catch (err: any) {
      setError("Erreur lors de l'enregistrement de votre profil.");
    } finally {
      setLoading(false);
    }
  };

  const submitAvatarAndGoToService = async () => {
    if (!avatarFile) {
      setStep(4);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.idUtilisateur) {
        const url = await uploadAvatar(user.idUtilisateur, avatarFile);
        user.avatar = url;
        localStorage.setItem("user", JSON.stringify(user));
      }
      setStep(4);
    } catch (err: any) {
      setError("Erreur lors du téléchargement de l'avatar.");
    } finally {
      setLoading(false);
    }
  };

  const skipAvatar = () => {
    setStep(4);
  };

  const submitServiceAndFinish = async () => {
    if (!serviceData.nom || serviceData.prix <= 0) {
      setError("Veuillez renseigner le nom et un prix valide.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await addService(serviceData);
      setStep(5); // Success Step
      setTimeout(() => navigate("/Dashboard-Provider"), 2500);
    } catch (err: any) {
      setError("Erreur lors de la création du service.");
    } finally {
      setLoading(false);
    }
  };

  const skipServiceAndFinish = () => {
    setStep(5);
    setTimeout(() => navigate("/Dashboard-Provider"), 2500);
  };

  return (
    <>
      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(${theme === 'dark' ? 'rgba(255,255,255,0.022)' : 'rgba(26,111,209,0.06)'
        } 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .glass-card {
          background: ${theme === 'dark'
          ? 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,255,0.85))'
        };
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(200,215,255,0.6)'};
          box-shadow: ${theme === 'dark'
          ? '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)'
        };
          transition: all 0.3s ease;
        }
      `}</style>
      <div className="min-h-screen bg-dot-pattern flex flex-col font-poppins relative overflow-hidden transition-colors duration-500" style={{ background: theme === 'dark' ? '#0d1117' : '#eef2fc' }}>

        {/* Background Decor */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1A6FD1]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#004a96]/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-md relative z-10">
          <img src={theme === "dark" ? logoDark : logoLight} alt="Bookify" className="h-8 md:h-10 w-auto" />
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${step >= i ? 'w-10 bg-[#1A6FD1]' : 'w-2.5 bg-slate-300 dark:bg-slate-700'}`} />
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-6 relative z-10">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 md:p-12 transition-all duration-500 relative overflow-hidden">

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Comment travaillez-vous ?</h1>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">Indiquez vos modes d'intervention pour que les clients sachent comment vous trouver.</p>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Vos modes d'intervention</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-4 transition-all ${formData.enLocal ? 'border-[#1A6FD1] bg-[#1A6FD1]/5' : 'border-slate-200 dark:border-white/10 hover:border-[#1A6FD1]/50'}`}>
                          <input type="checkbox" name="enLocal" checked={formData.enLocal} onChange={handleChange} className="w-5 h-5 mt-0.5 accent-[#1A6FD1]" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">🏢 En Local / Cabinet</p>
                            <p className="text-xs text-slate-500 mt-1">Les clients viennent à votre adresse.</p>
                          </div>
                        </label>
                        <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-start gap-4 transition-all ${formData.aDomicile ? 'border-[#1A6FD1] bg-[#1A6FD1]/5' : 'border-slate-200 dark:border-white/10 hover:border-[#1A6FD1]/50'}`}>
                          <input type="checkbox" name="aDomicile" checked={formData.aDomicile} onChange={handleChange} className="w-5 h-5 mt-0.5 accent-[#1A6FD1]" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">🚗 À Domicile</p>
                            <p className="text-xs text-slate-500 mt-1">Vous vous déplacez chez le client.</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <MapPin size={18} className="text-[#1A6FD1]" /> Ville principale
                      </label>
                      <select
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none"
                      >
                        <option value="" className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">Sélectionnez votre ville</option>
                        {ADRESSES_AUTORISEES.map(city => (
                          <option key={city} value={city} className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">{city}</option>
                        ))}
                      </select>
                    </div>

                    {formData.enLocal && (
                      <div className="space-y-2 animate-in fade-in zoom-in duration-500">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Localisation exacte sur la carte
                        </label>
                        <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner z-0 relative">
                          <MapContainer center={[33.5731, -7.5898]} zoom={11} className="h-full w-full">
                            <TileLayer
                              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                              attribution='&copy; Carto'
                            />
                            <LocationMarker />
                          </MapContainer>
                        </div>
                        {position && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓ Position enregistrée</p>}
                      </div>
                    )}

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <div className="pt-4 flex justify-end">
                      <button onClick={handleNext} className="group relative overflow-hidden text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#1A6FD1]/30">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                        <span className="relative flex items-center justify-center gap-2 z-10">
                          Suivant <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 duration-300" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Votre profil professionnel</h1>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">Parlez-nous de votre métier et de votre expertise.</p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Briefcase size={18} className="text-[#1A6FD1]" /> Catégorie d'activité
                      </label>
                      <select
                        name="categorie"
                        value={formData.categorie}
                        onChange={handleChange}
                        className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none"
                      >
                        <option value="" className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">Sélectionnez une catégorie</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Briefcase size={18} className="text-[#1A6FD1]" /> Spécialité
                      </label>
                      <select
                        name="specialite"
                        value={formData.specialite}
                        onChange={handleChange}
                        disabled={!formData.categorie}
                        className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none disabled:opacity-50"
                      >
                        <option value="" className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                          {formData.categorie ? "Sélectionnez votre spécialité" : "Sélectionnez d'abord une catégorie"}
                        </option>
                        {formData.categorie && SPECIALITES[formData.categorie]?.map(spec => (
                          <option key={spec} value={spec} className="bg-white dark:bg-gray-800 text-slate-900 dark:text-white">{spec}</option>
                        ))}
                      </select>
                    </div>

                    {formData.specialite === "Autre" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Précisez votre spécialité</label>
                        <input
                          type="text"
                          value={customSpecialite}
                          onChange={(e) => setCustomSpecialite(e.target.value)}
                          placeholder="Saisissez votre titre professionnel..."
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FileText size={18} className="text-[#1A6FD1]" /> Bio & Description
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Décrivez votre expérience, vos prestations et ce qui vous rend unique..."
                        className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none h-32 resize-none"
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <div className="pt-4 flex items-center justify-between">
                      <button onClick={handleBack} className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-2 px-4 py-2 transition-colors">
                        <ArrowLeft size={18} /> Retour
                      </button>
                      <button onClick={submitProfileAndGoToAvatar} disabled={loading} className="group relative overflow-hidden text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#1A6FD1]/30 disabled:opacity-50 disabled:hover:translate-y-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                        <span className="relative flex items-center justify-center gap-2 z-10">
                          {loading ? "Enregistrement..." : "Suivant"} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 duration-300" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Photo de profil</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Mettez un visage sur votre expertise !</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#1a1d27] border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg" />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                          <UploadCloud size={48} className="text-slate-400" />
                        </div>
                      )}
                      <label className="cursor-pointer bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-6 py-2 rounded-lg text-sm font-bold text-[#1A6FD1] hover:bg-[#1A6FD1] hover:text-white transition-colors">
                        Choisir une photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAvatarFile(file);
                              setAvatarPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <div className="pt-4 flex items-center justify-between">
                      <button onClick={skipAvatar} className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold px-4 py-2 transition-colors">
                        Passer
                      </button>
                      <button onClick={submitAvatarAndGoToService} disabled={loading} className="group relative overflow-hidden text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#1A6FD1]/30 disabled:opacity-50 disabled:hover:translate-y-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                        <span className="relative flex items-center justify-center gap-2 z-10">
                          {loading ? "Chargement..." : "Suivant"} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 duration-300" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Votre premier service</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Qu'allez-vous proposer à vos clients ?</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom du service</label>
                      <input
                        type="text"
                        value={serviceData.nom}
                        onChange={(e) => setServiceData({ ...serviceData, nom: e.target.value })}
                        placeholder="ex: Consultation standard"
                        className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Prix (MAD)</label>
                        <input
                          type="number"
                          value={serviceData.prix}
                          onChange={(e) => setServiceData({ ...serviceData, prix: parseFloat(e.target.value) })}
                          className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Durée ({serviceData.uniteDuree})</label>
                        <input
                          type="number"
                          value={serviceData.duree}
                          onChange={(e) => setServiceData({ ...serviceData, duree: parseInt(e.target.value) })}
                          className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        Description courte
                      </label>
                      <textarea
                        value={serviceData.description}
                        onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                        placeholder="Description du service..."
                        className="w-full p-4 bg-slate-50 dark:bg-[#1a1d27] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none h-24 resize-none"
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <div className="pt-4 flex items-center justify-between">
                      <button onClick={skipServiceAndFinish} className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold px-4 py-2 transition-colors">
                        Passer
                      </button>
                      <button onClick={submitServiceAndFinish} disabled={loading} className="group relative overflow-hidden text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#1A6FD1]/30 disabled:opacity-50 disabled:hover:translate-y-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                        <span className="relative flex items-center justify-center gap-2 z-10">
                          {loading ? "Création..." : "Terminer"} <CheckCircle2 size={18} />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Profil configuré !</h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Bienvenue sur Bookify. Vous allez être redirigé vers votre tableau de bord.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </>
  );
};

export default ProviderOnboarding;
