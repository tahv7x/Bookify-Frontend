import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion"; // ZEDNA FRAMER MOTION HNA
import { login } from "../../services/Auth/authLoginService";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";
import { useTheme } from "../../context/ThemeContext"; 

// HADA L'BACKGROUND DYAL HOME M-COPIER HNA BACH YB9A NAFS L'AESTHETIC
// BACKGROUND VERIZON-STYLE (N9I F LIGHT MODE, W MJEHED F DARK MODE)
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      
      {/* Blobs avec un effet subtil en Light mode et intense en Dark mode */}
      <motion.div
        animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-[#1A6FD1]/5 dark:bg-[#1A6FD1]/15 blur-[100px] dark:blur-[120px] opacity-100"
      />
      
      <motion.div
        animate={{ rotate: [360, 270, 180, 90, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[20%] -left-[10%] w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-[#004a96]/5 dark:bg-[#004a96]/20 blur-[100px] dark:blur-[120px] opacity-100"
      />
      
      <motion.div
        animate={{ y: ["-5%", "5%", "-5%"], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#1A6FD1]/5 dark:bg-[#1A6FD1]/10 blur-[100px] dark:blur-[120px]"
      />
      
    </div>
  );
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        redirectBasedOnRole(user.role);
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  const redirectBasedOnRole = (role: string) => {
    if (role === "ADMIN") navigate("/Admin");
    else if (role === "PRESTATAIRE") navigate("/Home-Provider");
    else if (role === "CLIENT") navigate("/Home-Client");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      setLoading(true);
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userAvatar", data.user.avatar);
      setSuccessMessage("Connexion réussie !");
      setTimeout(() => redirectBasedOnRole(data.user.role), 1500);
    } catch (error) {
      setErrorMessage("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0B0F19] bg-dot-pattern font-poppins transition-colors duration-500">
      
      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif !important; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        /* Subtle Dot Grid pattern for background */
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26, 111, 209, 0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>

      {/* L'BACKGROUND LWA3R HNA */}
      <AnimatedBackground />

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-6 md:px-12 z-20">
        <Link to="/" className="group flex items-center">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="Bookify"
            className="h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={() => navigate("/ClientRegister")}
            className="hidden sm:flex px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white font-semibold hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
          >
            S'inscrire
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[480px] px-6 mt-12 md:mt-0">
        <div className="bg-white/80 dark:bg-[#1a1d27]/90 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#1A6FD1] to-transparent opacity-40" />
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-fraunces font-bold text-slate-900 dark:text-white mb-3">Se Connecter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Accédez à votre espace Bookify</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedInput === 'email' ? 'text-[#1A6FD1]' : 'text-slate-400 dark:text-slate-500'}`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] transition-all duration-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mot de Passe</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#1A6FD1] hover:text-[#0059B2] transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedInput === 'password' ? 'text-[#1A6FD1]' : 'text-slate-400 dark:text-slate-500'}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] transition-all duration-300 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-[#1A6FD1] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs py-3.5 px-4 rounded-xl text-center animate-shake font-medium">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs py-3.5 px-4 rounded-xl text-center font-medium">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-4 rounded-2xl font-bold shadow-[0_4px_16px_-8px_#1A6FD1] hover:shadow-[0_8px_16px_-8px_#1A6FD1] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? "Connexion..." : (
                <>
                  Se Connecter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
              Pas encore de compte ?{" "}
              <Link to="/ClientRegister" className="text-[#1A6FD1] font-extrabold hover:underline underline-offset-4 decoration-2">
                Inscrivez-vous
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;