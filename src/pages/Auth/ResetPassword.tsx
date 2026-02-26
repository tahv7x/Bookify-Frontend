import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthBackground from "../../components/AuthBackground";
import logo from "../../assets/LogoB.png";
import { resetPassword } from "../../services/Auth/authResetPasswordService";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const code = location.state?.code;
  if (!email || !code) {
    return (
      <p className="text-center text-red-600 mt-10">
        Email manquant. Veuillez recommencer la procédure.
      </p>
    );
  }

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      setSuccessMessage("Mot de passe réinitialisé avec succès.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setErrorMessage("Erreur lors de la réinitialisation du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background */}
      <AuthBackground />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-14" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">
          Réinitialiser le mot de passe
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Créez un nouveau mot de passe d'au moins 8 caractères. Un mot de passe
          fort est une combinaison de lettres, de chiffres et de signes de
          ponctuation.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              className={`w-full px-4 py-3 pr-12 border-2 mb-6 ${
                focusedInput === "password"
                  ? "border-[#0059B2] ring-4 ring-blue-500/10 "
                  : "border-gray-200"
              } rounded-xl outline-none transition-all duration-300 placeholder-gray-400`}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute  right-4 top-1/3 -translate-y-1/2 text-gray-400 hover:text-[#0059B2] transition-colors duration-300"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
              className={`w-full px-4 py-3 pr-12 border-2 mb-6 ${
                focusedInput === "confirmPassword"
                  ? "border-[#0059B2] ring-4 ring-blue-500/10 "
                  : "border-gray-200"
              } rounded-xl outline-none transition-all duration-300 placeholder-gray-400`}
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/3 -translate-y-1/2 text-gray-400 hover:text-[#0059B2]"
            >
              {showConfirmPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#0059B2] to-[#004a96]
              hover:from-[#004a96] hover:to-[#0059B2]
              text-white py-3.5 rounded-xl font-semibold
              transition-all duration-300 shadow-lg hover:shadow-xl
              transform hover:scale-[1.02] active:scale-[0.98]
              text-sm md:text-base mb-2
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Traitement..." : "Valider"}
          </button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-green-600 text-sm text-center">
              {successMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
