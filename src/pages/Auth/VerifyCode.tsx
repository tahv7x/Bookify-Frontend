import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyCode } from "../../services/Auth/authVerifyCodeService";
import AuthBackground from "../../components/AuthBackground";
import logo from "../../assets/LogoB.png";

const VerifyCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!code || code.length !== 6) {
      setErrorMessage("Veuillez saisir un code valide de 6 chiffres.");
      return;
    }

    try {
      setLoading(true);
      await verifyCode(email, code);
      navigate("/reset-password", { state: { email, code } });
    } catch (error) {
      setErrorMessage("Code incorrect ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md "
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="h-14" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">
            Vérification du code
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Veuillez consulter votre boîte mail pour trouver un message
            contenant votre code. Votre code est composé de 6 chiffres.
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]*"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); 
              setCode(value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Entrez le code"
            className="input_field w-full pl-4 pr-4 mb-6 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0059B2] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#0059B2] to-[#004a96]
                hover:from-[#004a96] hover:to-[#0059B2]
                text-white py-3.5 rounded-xl font-semibold
                transition-all duration-300 shadow-lg hover:shadow-xl
                transform hover:scale-[1.02] active:scale-[0.98]
                text-sm md:text-base mb-2
                ${loading ? "opacity-60 cursor-not-allowed" : ""}
                `}
          >
            {loading ? "Vérification..." : "Vérifier"}
          </button>
          {errorMessage && (
            <p className="text-red-600  text-sm text-center">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
