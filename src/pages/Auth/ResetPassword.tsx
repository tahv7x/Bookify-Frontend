import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, Sun, Moon, CheckCircle2, Link } from "lucide-react";
import { resetPassword } from "../../services/Auth/authResetPasswordService";
import logoLight from "../../assets/LogoB.png";
import logoDark from "../../assets/LogoW.png";
import { useTheme } from "../../context/ThemeContext";

/**
 * Bookify Premium Reset Password Component
 * 
 * Features:
 * - Immersive dynamic background matching the Login theme
 * - Glassmorphism card UI with Fraunces & Poppins typography
 * - Full integration with authResetPasswordService
 * - Responsive & theme-aware (Light/Dark)
 */

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme: toggle } = useTheme();

  const email = location.state?.email;
  const code = location.state?.code;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!email || !code) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0f1117] bg-dot-pattern font-poppins transition-colors duration-500">
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-6 md:px-12 z-20">
          <Link to="/" className="group flex items-center">
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Bookify"
              className="h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
            />
          </Link>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-white/10 transition-all duration-300"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="bg-white/80 dark:bg-[#1a1d27]/90 backdrop-blur-3xl p-8 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/60 dark:border-white/10 text-center relative z-10 max-w-sm w-full mx-6">
          <p className="text-red-600 dark:text-red-400 font-bold text-lg mb-6">Email ou code manquant.</p>
          <button onClick={() => navigate("/forgot-password")} className="w-full relative group bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-3 rounded-2xl font-bold shadow-[0_4px_16px_-8px_#1A6FD1] hover:shadow-[0_8px_16px_-8px_#1A6FD1] hover:-translate-y-0.5 transition-all duration-300">
            Recommencer la procédure
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, code, password);
      setSuccessMessage("Mot de passe réinitialisé ! Redirection...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage("Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0f1117] bg-dot-pattern font-poppins transition-colors duration-500">
      
      {/* Background & Keyframes */}
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }

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
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="Bookify"
            className="h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          />
        </Link>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:border-[#1A6FD1]/50 hover:bg-white dark:hover:bg-white/10 transition-all duration-300"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[480px] px-6">
        <div className="bg-white/80 dark:bg-[#1a1d27]/90 backdrop-blur-3xl border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#1A6FD1] to-transparent opacity-40" />
          
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-fraunces font-bold text-slate-900 dark:text-white mb-3">Réinitialiser le mot de passe</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Entrez votre nouveau mot de passe ci-dessous.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Nouveau mot de passe</label>
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

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Confirmer le mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedInput === 'confirmPassword' ? 'text-[#1A6FD1]' : 'text-slate-400 dark:text-slate-500'}`} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#1A6FD1]/50 focus:border-[#1A6FD1] transition-all duration-300 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-[#1A6FD1] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              className="w-full relative group bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-4 rounded-2xl font-bold shadow-[0_4px_16px_-8px_#1A6FD1] hover:shadow-[0_8px_16px_-8px_#1A6FD1] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Mise à jour..." : (
                <>
                  Mettre à jour le mot de passe <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;