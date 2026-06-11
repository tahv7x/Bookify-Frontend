import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, CheckCircle2 } from "lucide-react";
import { registerPrestataire } from "../../services/Auth/authRegisterPrestataireService";
import { login } from "../../services/Auth/authLoginService";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";
import { useTheme } from "../../context/ThemeContext";

const FEATURES = [
  { title: "Gagnez en visibilité", desc: "Soyez trouvé par des milliers de clients près de chez vous." },
  { title: "Gérez vos rendez-vous", desc: "Un agenda intelligent qui réduit les no-shows de 30%." },
  { title: "Développez votre chiffre", desc: "Nos outils marketing vous aident à fidéliser votre clientèle." }
];

const PrestataireRegister: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.nomComplet || !formData.email || !formData.telephone || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Veuillez entrer une adresse e-mail valide.");
      return;
    }

    const phoneRegex = /^(06|07)\d{8}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setErrorMessage("Le numéro de téléphone doit commencer par 06 ou 07.");
      return;
    }
    if (formData.telephone.length !== 10) {
      setErrorMessage("Le numéro de téléphone doit contenir exactement 10 chiffres.");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      // Inscription
      await registerPrestataire({ 
        ...formData, 
        address: "Non défini", // Par défaut, sera rempli dans l'onboarding
        latitude: null,
        longitude: null
      });

      // Connexion automatique
      const authData = await login(formData.email, formData.password);
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));

      setSuccessMessage("Compte créé avec succès ! Redirection vers la configuration...");
      setTimeout(() => navigate("/provider/onboarding"), 1500);

    } catch (error: any) {
      const serverError = error.response?.data?.message || error.response?.data;
      if (serverError && typeof serverError === "string" && serverError.toLowerCase().includes("email")) {
        setErrorMessage("Cette adresse e-mail est déjà utilisée. Veuillez vous connecter.");
      } else {
        setErrorMessage(typeof serverError === "string" ? serverError : "Erreur lors de l'inscription. Veuillez réessayer.");
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-7xl px-4 md:px-6 py-12 mt-16 lg:mt-0 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20"
      >
        
        {/* Left Side: Premium Presentation (Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center max-w-[500px]">
          <div className="relative rounded-[3rem] p-12 bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl" />
            
            <h2 className="text-4xl font-fraunces font-bold text-white leading-tight relative z-10">
              Passez au niveau supérieur.
            </h2>
            <p className="text-blue-100 mt-4 text-lg relative z-10 opacity-90">
              Rejoignez les professionnels qui transforment leur activité avec Bookify.
            </p>

            <div className="mt-12 space-y-6 relative z-10">
              {FEATURES.map((feat, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-4 transition-all duration-500 ${activeFeature === idx ? 'opacity-100 translate-x-2' : 'opacity-40'}`}
                >
                  <div className="mt-1 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{feat.title}</h3>
                    <p className="text-blue-100 text-sm mt-1">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Glass decoration */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20" />
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex-1 w-full max-w-[500px]">
          <div className="bg-white/80 dark:bg-[#1a1d27]/90 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#1A6FD1] to-transparent opacity-40" />
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-fraunces font-bold text-slate-900 dark:text-white mb-2">Créer votre profil</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Étape 1 sur 2 : Informations de base</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nom du professionnel ou Salon</label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'nom' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input name="nomComplet" value={formData.nomComplet} onChange={handleChange} onFocus={() => setFocusedInput('nom')} onBlur={() => setFocusedInput(null)} placeholder="Jean Dupont ou Salon Élégance" className="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  {formData.nomComplet.length > 2 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email professionnel</label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'email' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} placeholder="jean@exemple.com" className="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'phone' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input name="telephone" value={formData.telephone} onChange={handleChange} onFocus={() => setFocusedInput('phone')} onBlur={() => setFocusedInput(null)} placeholder="0612345678" className="w-full pl-11 pr-10 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  {formData.telephone.length === 10 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'pass' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedInput('pass')} onBlur={() => setFocusedInput(null)} placeholder="Mot de passe" className="w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {formData.password.length >= 8 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 pointer-events-none" />
                      </motion.div>
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-slate-400 hover:text-[#1A6FD1]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedInput === 'confirm' ? 'text-[#1A6FD1]' : 'text-slate-400'}`} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onFocus={() => setFocusedInput('confirm')} onBlur={() => setFocusedInput(null)} placeholder="Confirmer" className="w-full pl-11 pr-12 py-3 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] outline-none transition-all" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 pointer-events-none" />
                      </motion.div>
                    )}
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1 text-slate-400 hover:text-[#1A6FD1]">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {errorMessage && <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] py-2.5 px-4 rounded-xl text-center font-medium">{errorMessage}</div>}
              {successMessage && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] py-2.5 px-4 rounded-xl text-center font-medium">{successMessage}</div>}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-3.5 rounded-xl font-bold  shadow-[0_4px_16px_-8px_#1A6FD1] hover:shadow-[0_8px_16px_-8px_#1A6FD1] hover:-translate-y-0.5 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                {loading ? "Création..." : "Continuer"} <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6">
                Déjà un compte ? <Link to="/login" className="text-[#1A6FD1] font-bold hover:underline">Connectez-vous</Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrestataireRegister;