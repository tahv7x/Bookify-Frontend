import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/LogoW.png";
import { useNavigate } from "react-router-dom";
import { registerPrestataire } from "../../services/Auth/authRegisterPrestataireService";
import AuthBackground from "../../components/AuthBackground";
import {getStats} from "../../services/provider/getStats";
import { getUpcoming } from "../../services/provider/upComing";

const ADRESSES_AUTORISEES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Agadir",
  "Fes",
  "Oujda",
];
const PrestataireRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    telephone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigate = useNavigate();
  const [stats,setStats] = useState({
    revenus:0,
    rdvToday:0,
  })
  const [upcoming,setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    if(formData.nomComplet === "" || formData.email === "" || formData.telephone === "" || formData.address === "" || formData.password === "" || formData.confirmPassword === ""){
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");

      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage("Son mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
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
      await registerPrestataire({
        ...formData,
        address: adresseFinale,
      });

      setSuccessMessage("Compte créé avec succès !");
      setTimeout(() => navigate("/login"),2000);
    } catch (error: any) {
      if(error.response?.data?.message){
        setErrorMessage(error.response?.data?.message);
      } else if(error.response?.data){
        setErrorMessage(JSON.stringify(error.response?.data)); // show raw response
      } else {
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
  React.useEffect(() => {
    const fetchStats = async() => {
      try{
        const prestataireId = 1;
        const data = await getStats(prestataireId);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  },[]);

  React.useEffect(() => {
    const fetchUpcoming = async() => {
      try{
        const data = await getUpcoming(1);
        setUpcoming(data);
      }catch(error){
        console.log(error);
      }
    };
    fetchUpcoming();
  },[])
  const current = previews[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % previews.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden  flex justify-center items-start md:items-center pt-32 md:pt-0 transition-all duration-500 ease-out">
      <AuthBackground/>
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
{/* Left Side - Dashboard Preview */}
<div className="hidden lg:flex justify-center items-start self-stretch">
  <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl flex flex-col gap-5 p-8"
    style={{ background: "linear-gradient(145deg, #001f4d 0%, #0059B2 60%, #1A6FD1 100%)" }}>

    {/* Decorative circles */}
    <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />

    {/* Hero */}
    <div className="relative z-10">
      <p className="text-2xl font-bold text-white leading-snug">
        Développez votre activité<br/>avec Bookify
      </p>
      <p className="text-sm text-blue-300 mt-2">
        +500 prestataires nous font confiance au Maroc
      </p>
    </div>

    {/* Mini Dashboard */}
    <div className="relative z-10 bg-white/10 border border-white/20 rounded-2xl p-4">
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-xs text-blue-300 mb-1">Revenus ce mois</p>
          <p className="text-xl font-bold text-white">{stats.revenus} <span className="text-xs text-blue-300">MAD</span></p>
          <p className="text-xs text-green-300 mt-1">↑ +18% ce mois</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-xs text-blue-300 mb-1">RDV aujourd'hui</p>
          <p className="text-xl font-bold text-white">{stats.rdvToday}</p>
          <p className="text-xs text-green-300 mt-1">↑ 2 nouveaux</p>
        </div>
      </div>

      {/* Appointments */}
      <p className="text-xs text-blue-300 font-medium mb-2">Rendez-vous à venir</p>
      {upcoming.map((rdv: any, index: number) => (
          <div key={index} className="flex items-center gap-2 py-2 border-b border-white/10">
            
            <div className="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {rdv.client?.charAt(0)}
            </div>

            <p className="text-xs text-white font-medium flex-1">
              {rdv.client}
            </p>

            <p className="text-xs text-blue-300">
              {rdv.time}
            </p>

            <span className="text-[10px] bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full">
              {rdv.statut}
            </span>

          </div>
        ))}
    </div>

    {/* Notification */}
    <div className="relative z-10 bg-white/95 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="w-2 h-2 bg-green-500 rounded-full shrink-0 animate-pulse" />
      <p className="text-xs text-blue-900 font-medium flex-1">Nouveau rendez-vous — Karim T.</p>
      <p className="text-xs text-gray-400">maintenant</p>
    </div>

    {/* Testimonials */}
    <div className="relative z-10 flex flex-col gap-2">
      {[
        { initials: "DA", name: "Dr. Alami", quote: "+40 clients en 2 mois", img: "https://i.pravatar.cc/40?img=12" },
        { initials: "SC", name: "Sara — Coiffeuse", quote: "Revenue x3 depuis Bookify", img: "https://i.pravatar.cc/40?img=45" },
      ].map((t, i) => (
        <div key={i} className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3">
          <img src={t.img} alt={t.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-white font-medium">{t.name}</p>
            <p className="text-xs text-blue-300 mt-0.5">{t.quote}</p>
          </div>
          <span className="text-yellow-400 text-xs">★★★★★</span>
        </div>
      ))}
    </div>

  </div>
</div>            

            {/* Right Side - Registration Form */}
            <div className="w-full flex justify-center ">
              <div className="bg-white/95 backdrop-blur-sm  rounded-2xl md:rounded-3xl shadow-2xl p-5 sm:p-8 md:pl-10 md:pr-10 md:pt-6 md:pb-6 w-full max-w-md lg:max-w-lg">
                {/* Title */}
                <div className="text-center mb-6 md:mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Inscription Prestataire
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
                      placeholder="Nom complet"
                      className={`w-full px-4 py-3 border-2 ${
                        focusedInput === "fullName"
                         ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none bg-white transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
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
                      className={`w-full px-4 py-3 border-2 ${
                        focusedInput === "email"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none bg-white transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
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
                      className={`w-full px-4 py-3 border-2 ${
                        focusedInput === "phone"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none bg-white transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <select
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      onFocus={() => setFocusedInput("address")}
                      onBlur={() => setFocusedInput(null)}
                      className={`w-full px-4 py-3 border-2 ${
                        focusedInput === "address"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10"
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none bg-white transition-all duration-300 text-xs sm:text-sm md:text-base bg-white appearance-none cursor-pointer`}
                      required
                    >
                      <option value="">Sélectionner une ville</option>
                      {ADRESSES_AUTORISEES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {/* Custom arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
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
                      placeholder="Mots de passe"
                      className={`w-full px-4 py-3 border-2 ${
                        focusedInput === "password"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none bg-white transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
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
                      className={`w-full px-4 py-3 border-2 ${
                        focusedInput === "confirmPassword"
                          ? "border-[#0059B2] ring-4 sm:ring-4 ring-blue-500/10 "
                          : "border-gray-200"
                      } rounded-lg sm:rounded-xl outline-none bg-white transition-all duration-300 placeholder-gray-400 text-xs sm:text-sm md:text-base`}
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
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r md:py-3 from-[#28282B] to-[#1f1f22] hover:from-[#1f1f22] hover:to-[#28282B] text-white py-3.5 rounded-xl font-semibold  transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {loading ? "Création du compte..." : "Créer mon compte"}
                  </button>
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="text-red-600 text-sm text-center">
                      {errorMessage}
                    </div>
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

export default PrestataireRegister;
