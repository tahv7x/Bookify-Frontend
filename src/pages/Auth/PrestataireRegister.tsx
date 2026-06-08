import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, TrendingUp, Calendar, Bell, Star, ChevronDown } from "lucide-react";
import { registerPrestataire } from "../../services/Auth/authRegisterPrestataireService";
import { getStats } from "../../services/provider/getStats";
import { getUpcoming } from "../../services/provider/upComing";
import { getLatest } from "../../services/provider/latest";
import { getTopPrestataires } from "../../services/provider/bestPrest";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";
import { useTheme } from "../../context/ThemeContext";


const ADRESSES_AUTORISEES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Oujda"
];

const PrestataireRegister: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Form State
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    telephone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Dashboard Preview Data
  const [stats, setStats] = useState({ revenus: 0, rdvToday: 0 });
  const [topPrestataires, setTopPrestataires] = useState<any[]>([]);
  const [latest, setLatest] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prestId = 1; // Mock ID for preview
        const [statsData, upcomingData, latestData, topData] = await Promise.all([
          getStats(prestId),
          getUpcoming(prestId),
          getLatest(prestId),
          getTopPrestataires()
        ]);
        setStats(statsData);
        setUpcoming(upcomingData);
        setLatest(latestData);
        setTopPrestataires(topData.slice(0, 3));
      } catch (err) {
        console.error("Error fetching preview data", err);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Vérification des champs vides
    if (!formData.nomComplet || !formData.email || !formData.telephone || !formData.address || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

    // 2. Vérification du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    // 3. Vérification du numéro de téléphone
    const phoneRegex = /^(06|07)\d{8}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setErrorMessage("Le numéro de téléphone commencer par 06 ou 07.");
      return;
    }
    if(formData.telephone.length !== 10) {
      setErrorMessage("Le numéro de téléphone doit contenir exactement 10 chiffres.");
      return;
    }

    // 4. Vérification de la longueur du mot de passe
    if (formData.password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    // 5. Vérification de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      await registerPrestataire({ ...formData, address: formData.address || "Casablanca" });
      setSuccessMessage("Compte pro créé avec succès ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      // 6. Gestion de l'erreur email existant
      const serverError = error.response?.data?.message;
      if (serverError && serverError.toLowerCase().includes("email")) {
        setErrorMessage("Cette adresse e-mail est déjà utilisée. Veuillez vous connecter.");
      } else {
        setErrorMessage(serverError || "Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0f1117] bg-dot-pattern font-poppins transition-colors duration-500">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif !important; }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        .animate-float { animation: float 22s infinite ease-in-out; }
        .animate-float-delayed { animation: float 28s infinite ease-in-out reverse; }

        /* Subtle Dot Grid pattern for background */
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26, 111, 209, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[70%] bg-[#1A6FD1]/5 dark:bg-blue-600/20 blur-[100px] md:blur-[140px] rounded-full animate-float" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[70%] h-[70%] bg-[#004a96]/5 dark:bg-[#1A6FD1]/10 blur-[100px] md:blur-[140px] rounded-full animate-float-delayed" />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-6 md:px-12 z-20">
        <Link to="/" className="group flex items-center">
          <img src={theme === "dark" ? logoDark : logoLight} alt="Bookify" className="h-10 md:h-12 w-auto transition-all group-hover:scale-105" />
        </Link>
        <button onClick={toggleTheme} className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:border-[#1A6FD1]/50 transition-all shadow-sm">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl px-6 py-12 mt-16 lg:mt-0 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Side: Dashboard Preview (Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col gap-6 w-full">
          <div className="bg-gradient-to-br from-[#001f4d] via-[#0059B2] to-[#1A6FD1] rounded-[3rem] p-10 shadow-2xl border border-white/10 overflow-hidden relative">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
            
            <div className="relative z-10 mb-10">
              <h2 className="text-3xl font-bold text-white font-fraunces leading-tight">Développez votre activité avec Bookify</h2>
              <p className="text-blue-200 mt-3">+500 prestataires nous font confiance au Maroc.</p>
            </div>

            <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200 mb-1">Revenus (mois)</p>
                  <p className="text-2xl font-bold text-white">{stats.revenus} <span className="text-xs">MAD</span></p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200 mb-1">RDV à venir</p>
                  <p className="text-2xl font-bold text-white">{upcoming.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-widest text-blue-200 ml-1">Prochains rendez-vous</p>
                {upcoming.slice(0, 2).map((rdv, idx) => (
                  <div key={idx} className="bg-white/5 rounded-2xl p-3 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-white">{rdv.client.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-bold text-white">{rdv.client}</p>
                        <p className="text-[10px] text-blue-300">Consultation</p>
                      </div>
                    </div>
                    <p className="text-xs text-white font-mono">{rdv.time?.slice(0, 5)}</p>
                  </div>
                ))}
              </div>

              {latest && (
                <div className="bg-white p-3 rounded-2xl flex items-center gap-3 shadow-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[11px] text-slate-900 font-bold flex-1">Nouveau RDV — {latest.client} à {latest.time?.slice(0,5)}</p>
                  <p className="text-[10px] text-slate-400">maintenant</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex-1 w-full max-w-[500px]">
          <div className="bg-white/80 dark:bg-[#1a1d27]/90 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#1A6FD1] to-transparent opacity-40" />
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-fraunces font-bold text-slate-900 dark:text-white mb-2">Créer un compte pro</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Commencez à accepter des réservations en quelques minutes.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nom complet</label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'nom' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input name="nomComplet" value={formData.nomComplet} onChange={handleChange} onFocus={() => setFocusedInput('nom')} onBlur={() => setFocusedInput(null)} placeholder="Jean Dupont" className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email professionnel</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'email' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} placeholder="jean@exemple.com" className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Numéro de téléphone</label>
                  <div className="relative">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'phone' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                    <input name="telephone" value={formData.telephone} onChange={handleChange} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)} placeholder="0612345678" className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  </div>
                </div>
                
                {/* 👇 SELECT STYLISÉ B7AL CLIENT 👇 */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Ville</label>
                  <div className="relative group">
                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'city' ? 'text-[#1A6FD1]' : 'text-slate-400 z-10'}`} />
                    <select 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedInput('city')} 
                      onBlur={() => setFocusedInput(null)} 
                      className="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-white">Sélectionnez votre ville</option>
                      {ADRESSES_AUTORISEES.map(city => (
                        <option key={city} value={city} className="bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-white">{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'pass' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedInput('pass')} onBlur={() => setFocusedInput(null)} placeholder="Mot de passe" className="w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A6FD1]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'confirm' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onFocus={() => setFocusedInput('confirm')} onBlur={() => setFocusedInput(null)} placeholder="Confirmer" className="w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A6FD1]">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              {errorMessage && <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] py-2.5 px-4 rounded-xl text-center font-medium">{errorMessage}</div>}
              {successMessage && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] py-2.5 px-4 rounded-xl text-center font-medium">{successMessage}</div>}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-3.5 rounded-xl font-bold  shadow-[0_4px_16px_-8px_#1A6FD1] hover:shadow-[0_8px_16px_-8px_#1A6FD1] hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                {loading ? "Création..." : "S'inscrire gratuitement"} <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
                Déjà un compte ? <Link to="/login" className="text-[#1A6FD1] font-bold hover:underline">Connectez-vous</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestataireRegister;