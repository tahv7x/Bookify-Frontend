import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/LogoB.png";
import { registerClient } from "../../services/Auth/authRegisterClientService";
import { useNavigate } from "react-router-dom";

const ADRESSES_AUTORISEES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Agadir",
  "Fes",
  "Oujda",
];

const ClientRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    telephone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    if (formData.password.length < 8) {
      setErrorMessage("Le mots de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.telephone)) {
      setErrorMessage(
        "Le numéro de téléphone doit contenir exactement 10 chiffres.",
      );
      return;
    }
    let adresseFinale = formData.address?.trim();
    if (!ADRESSES_AUTORISEES.includes(adresseFinale)) {
      adresseFinale = "Casablanca";
    }
    try {
      setLoading(true);
      await registerClient({
        ...formData,
        address: adresseFinale
      });
      console.log(formData);
      setSuccessMessage("Compte client créé avec succès.");
      navigate("/Login");
    } catch (error: any) {
      if(error.response?.data?.message){
        setErrorMessage(error.response?.data?.message);
      }else{
        setErrorMessage("Erreur serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  const previews = [
    {
      name: "Studio BlackCut",
      location: "Rabat",
      rating: 4.6,
      description: "Salon moderne proposant des coupes tendance.",
      services: ["Coupes", "Barbe", "Planning flexible"],
      avatar:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100",
      background:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2000",
    },
    {
      name: "Beauty Lounge",
      location: "Casablanca",
      rating: 4.8,
      description: "Institut de beauté haut de gamme.",
      services: ["Soins visage", "Manucure", "Massage"],
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      background:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000",
    },
    {
      name: "FitPro Gym",
      location: "Marrakech",
      rating: 4.7,
      description: "Salle de sport moderne et équipée.",
      services: ["Coaching", "Musculation", "Cardio"],
      avatar:
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=100",
      background:
        "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=2000",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % previews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = previews[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % previews.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden  flex justify-center items-start md:items-center pt-32 md:pt-0 transition-all duration-500 ease-out">
      {/* Logo - Top Left */}
      <div className="absolute top-[50px] right-5 z-20">
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className="
                              h-12 w-auto
                              cursor-pointer
                              -translate-y-10
                              transition-transform duration-300
                              hover:scale-105
                              active:scale-95
                              "
          />
        </Link>
      </div>

      {/* Main Container */}
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Preview Card (Plus grand) */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative rounded-2xl  md:mt-16 overflow-hidden shadow-2xl w-full h-[420px] sm:h-[480px] md:h-[520px] lg:h-[560px] xl:h-[600px] max-w-3xl">
                {/* Background Image with Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                  style={{
                    backgroundImage: `url('${current.background}')`,
                    transform: "scale(1.05)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                </div>

                {/* Decorative elements */}
                <div
                  className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 80%, 20% 100%)",
                  }}
                />
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500/10 rounded-full backdrop-blur-sm" />

                {/* Profile Card */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-lg">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={current.avatar}
                            alt={current.name}
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {current.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{current.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{current.rating}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-6" />

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {current.description}
                    </p>

                    {/* Services List */}
                    <div className="space-y-3 mb-6">
                      {current.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            {service}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-[#0059B2] hover:bg-[#004a96] text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                      Voir le profil
                    </button>
                  </div>
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-8 right-8 flex items-center space-x-3">
                  <button
                    onClick={goToPrevious}
                    className="w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
                    className="w-12 h-12 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {previews.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full flex justify-center ">
              <div className="bg-white md:mt-16  md:h-[580px]  rounded-2xl md:rounded-3xl  shadow-2xl p-5 sm:p-8 md:pl-10 md:pr-10 md:pt-6 md:pb-6 w-full max-w-md lg:max-w-lg">
                {/* Title */}
                <div className="text-center mb-6 md:mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Client Registration
                  </h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-[#004a96] to-[#1A6FD1] mx-auto rounded-full" />
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <input
                      type="text"
                      name="nomComplet"
                      value={formData.nomComplet}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("fullName")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Nom Complet"
                      className={`w-full px-4 py-3 md:py-2 sm:px-4 sm:py-3 border-2 ${
                        focusedInput === "fullName"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Adresse Email"
                      className={`w-full px-4 py-3 md:py-2 border-2 ${
                        focusedInput === "email"
                         ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("phone")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Numéro de Téléphone"
                      className={`w-full px-4 py-3 md:py-2  border-2 ${
                        focusedInput === "phone"
                         ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("address")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Adresse"
                      className={`w-full px-4 py-3 md:py-2 border-2 ${
                        focusedInput === "address"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Mot de passe"
                      className={`w-full px-4 py-3 md:py-2 pr-12 border-2 ${
                        focusedInput === "password"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0059B2] transition-colors duration-300"
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

                  {/* Confirm Password */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedInput("confirmPassword")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="Confirmer le mot de passe"
                      className={`w-full  px-4 py-3 md:py-2 pr-12 border-2 ${
                        focusedInput === "confirmPassword"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0059B2] transition-colors duration-300"
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

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full md:py-3  bg-gradient-to-r from-[#0059B2] to-[#004a96]
                    hover:from-[#004a96] hover:to-[#0059B2]
                    text-white py-3.5 rounded-xl font-semibold
                    transition-all duration-300 shadow-lg hover:shadow-xl
                    transform hover:scale-[1.02] active:scale-[0.98]
                    text-sm md:text-base
                    ${loading ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                  >
                    {loading ? "Création du compte..." : "Créer mon compte"}
                  </button>
                  {/*Message affichage*/}
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

                  {/* Login Link */}
                  <div className="text-center text-xs md:text-sm text-gray-600">
                    Vous avez déjà un compte ?{" "}
                    <a
                      href="/login"
                      className="text-[#0059B2] hover:text-[#004a96] font-semibold transition-colors inline-flex items-center space-x-1 group"
                    >
                      <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                        Se connecter
                      </span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;
