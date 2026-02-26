import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/LogoB.png";
import { forgotPassword } from "../../services/Auth/authForgotPasswordService";
import { useNavigate } from "react-router-dom";
import AuthBackground from "../../components/AuthBackground";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Veuillez saisir votre email.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      navigate("/verify-code", { state: { email } });
    } catch (error) {
      setErrorMessage("Email introuvable. Veuillez réessayer.");
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

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Mot de passe oublié
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 ml-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0059B2] focus:ring-4 focus:ring-blue-500/10 outline-none"
              required
            />
          </div>

          <button
            type="submit" 
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#0059B2] to-[#004a96]
            hover:from-[#004a96] hover:to-[#0059B2]
            text-white py-3.5 rounded-xl font-semibold
            transition-all duration-300 shadow-lg hover:shadow-xl
            transform hover:scale-[1.02] active:scale-[0.98]
            text-sm md:text-base
            ${loading ? "opacity-60 cursor-not-allowed" : ""}
          `}
          >    
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center font-medium">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="text-green-600 text-sm text-center font-medium">
              {successMessage}
            </p>
          )}
        </form>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-[#0059B2] font-medium hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
