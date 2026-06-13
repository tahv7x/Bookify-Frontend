import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Star, ChevronDown } from "lucide-react";
import { registerClient } from "../../services/Auth/authRegisterClientService";
import { getRandomPres } from "../../services/provider/randomPres";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";
import { useTheme } from "../../context/ThemeContext";

const ADRESSES_AUTORISEES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Oujda"
];

const DEFAULT_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0"
];

const ClientRegister: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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

  const [previews, setPreviews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingPres, setLoadingPres] = useState(true);

  useEffect(() => {
    const fetchPrestataires = async () => {
      try {
        const data = await getRandomPres();
        const formatted = data.map((p: any, index: number) => ({
          id: p.id,
          name: p.nom,
          location: p.location,
          rating: p.rating || 0,
          description: p.description || "",
          specialite: p.specialite,
          avatar: p.avatar,
          background: p.background || DEFAULT_BACKGROUNDS[index % DEFAULT_BACKGROUNDS.length]
        }));
        setPreviews(formatted);
      } catch (error) {
        console.error("Erreur chargement prestataires");
      } finally {
        setLoadingPres(false);
      }
    };
    fetchPrestataires();
  }, []);

  useEffect(() => {
    if (previews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % previews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [previews.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getInitials = (name: string) => {
    if (!name) return "PR";
    const parts = name.split(" ");
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
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

    // 3. Vérification du numéro de téléphone (10 chiffres, commence par 06 ou 07)
    const phoneRegex = /^(06|07)\d{8}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setErrorMessage("Le numéro de téléphone doit commencer par 06 ou 07.");
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
      await registerClient({
        ...formData,
        address: formData.address || "Casablanca"
      });
      setSuccessMessage("Compte créé avec succès ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
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
        
        {/* Left Side: Preview Card (Desktop Only) */}
        <div className="hidden lg:flex flex-1 relative h-[650px] w-full">
          <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">
            {previews.map((p, i) => (
              <div key={i} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === currentIndex ? 'opacity-100 scale-105' : 'opacity-0'}`} style={{ backgroundImage: `url('${p.background}')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
            ))}
            
            {/* Profile Info Overlay */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[85%] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              {previews.length > 0 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    {previews[currentIndex].avatar ? (
                      <img src={previews[currentIndex].avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/50 shadow-lg" alt="Avatar" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/50">
                        {getInitials(previews[currentIndex].name)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white font-fraunces">{previews[currentIndex].name}</h3>
                      <p className="text-white/60 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {previews[currentIndex].location}</p>
                    </div>
                    <div className="bg-amber-400/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-400/30 flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-amber-400 font-bold text-sm">{previews[currentIndex].rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <p className="text-white/80 text-sm leading-relaxed italic">"Rejoignez des milliers d'utilisateurs qui font confiance à Bookify pour des services fiables et de qualité."</p>
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
              <h1 className="text-3xl font-fraunces font-bold text-slate-900 dark:text-white mb-2">Rejoindre Bookify</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Créez votre compte client pour trouver les prestataires parfaits.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nom Complet</label>
                  <div className="relative group">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'nom' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                    <input name="nomComplet" value={formData.nomComplet} onChange={handleChange} onFocus={() => setFocusedInput('nom')} onBlur={() => setFocusedInput(null)} placeholder="Ton Nom" className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Adresse E-mail</label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'email' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} placeholder="email@exemple.com" className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Téléphone</label>
                  <div className="relative group">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'phone' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                    <input name="telephone" value={formData.telephone} onChange={handleChange} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)} placeholder="+212" className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  </div>
                </div>
                
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
                      <option value="" className="bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-white">Sélectionnez une ville</option>
                      {ADRESSES_AUTORISEES.map(city => (
                        <option key={city} value={city} className="bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-white">{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'pass' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedInput('pass')} onBlur={() => setFocusedInput(null)} placeholder="Mot de passe" className="w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A6FD1]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'confirm' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onFocus={() => setFocusedInput('confirm')} onBlur={() => setFocusedInput(null)} placeholder="Confirmez le mot de passe" className="w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A6FD1]">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              {errorMessage && <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] py-2.5 px-4 rounded-xl text-center font-medium">{errorMessage}</div>}
              {successMessage && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] py-2.5 px-4 rounded-xl text-center font-medium">{successMessage}</div>}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-3.5 rounded-xl font-bold  shadow-[0_4px_16px_-8px_#1A6FD1] hover:shadow-[0_8px_16px_-8px_#1A6FD1] hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                {loading ? "Création en cours..." : "Créer le compte"} <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
                Vous avez déjà un compte ? <Link to="/login" className="text-[#1A6FD1] font-bold hover:underline">Se connecter</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;