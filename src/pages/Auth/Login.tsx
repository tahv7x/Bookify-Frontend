import React, {  useEffect, useState } from "react";
import logo from "../../assets/LogoW.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/Auth/authLoginService";
import AuthBackground from "../../components/AuthBackground";

const Login: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() =>{
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user")
    if(token && user){
    const role = JSON.parse(user).role;
    if(role === "ADMIN") navigate("/Admin/Accueil");
    else if (role === "PRESTATAIRE") navigate("/Prestataire/Accueil");
    else if (role === "CLIENT")  navigate("/Dashboard-Client");;
    }
    },[]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Le mots de passe doit contenir au moins 8 caractères.");
      return;
    }
    try {
      setLoading(true);
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccessMessage("Connexion réussie !");
      const role = data.user.role;
      if (role === "CLIENT") {
        navigate("/Dashboard-Client");
      } else if (role == "PRESTATAIRE") {
        navigate("/Prestataire/Accueil");
      } else if (role == "ADMIN") {
        navigate("/Admin/Accueil");
      }
    } catch (error) {
      setErrorMessage("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden  flex justify-center items-start md:items-center pt-32 md:pt-0 transition-all duration-500 ease-out">
      <AuthBackground/>
      {/* Logo - Top Left */}
      <div className="absolute top-[60px] left-5 z-20">
        <Link to="/Home-Client">
          <img
            src={logo}
            alt="Logo"
            className="
                  h-16 w-auto
                  cursor-pointer
                  -translate-y-10
                  transition-transform duration-300
                  hover:scale-105
                  active:scale-95
                "
          />
        </Link>
      </div>

      {/* Sign Up Button - Top Right */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={() => navigate("/")}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          S'inscrire
        </button>
      </div>

      {/* Login Form Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 transform transition-all duration-500 hover:shadow-blue-500/20 hover:shadow-3xl">
          {/* Decorative elements */}
          <div className="absolute -top-1 -left-1 w-20 h-20 bg-blue-500/10 rounded-full filter blur-xl" />
          <div className="absolute -bottom-1 -right-1 w-32 h-32 bg-purple-500/10 rounded-full filter blur-xl" />

          <div className="relative">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Se Connecter
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-[#004a96] to-[#1A6FD1] mx-auto rounded-full" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${focusedInput === "email" ? "text-[#0059B2]" : "text-gray-400"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Veuillez Saisie ton Email"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0059B2] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 ml-1">
                  Mots de Pass
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className={`w-5 h-5 transition-colors duration-300 ${focusedInput === "password" ? "text-[#0059B2]" : "text-gray-400"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="Veuillez Saisie ton Mots de Pass"
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#0059B2] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0059B2] transition-colors duration-300"
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0059B2] to-[#004a96] hover:from-[#004a96] hover:to-[#0059B2] text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion en cours..." : "Se Connecter"}
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

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-[#0059B2] hover:text-[#004a96] text-sm font-medium transition-colors duration-300 inline-flex items-center space-x-1 group"
                >
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    Mots de Pass Oublié ?
                  </span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="6 -2 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/30 text-gray-500 font-medium">
                    OU
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Vous n'avez pas de compte ?{" "}
                  <a
                    href="/"
                    className="text-[#0059B2] hover:text-[#004a96] font-semibold transition-colors  inline-flex items-center space-x-1 group"
                  >
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                      Inscrivez-vous
                    </span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="6 -3 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute -z-10 top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-500" />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-300 rounded-full animate-ping delay-1000" />
        </div>
      </div>
    </div>
  );
};

export default Login;
