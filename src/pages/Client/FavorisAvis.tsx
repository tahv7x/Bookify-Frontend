import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  MapPin,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Check,
  X,
  MessageSquare,
  User,
  Sparkles,
  Smile,
  ShieldCheck,
  HeartOff,
  UserCheck,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import Navbar from "../../components/Client/Navbar";
import TopBar from "../../components/Client/TopBar";
import Footer from "../../components/Client/Footer";
import MobileBottomNav from "../../components/Client/MobileBottomNav";

// Define Interfaces
interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  location: string;
  image: string;
  city: string;
  availability: string;
}

interface Review {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerImage: string;
  date: string;
  rating: number;
  text: string;
  aspects?: {
    welcome: number;
    cleanliness: number;
    quality: number;
    value: number;
  };
}

// Initial Mock Data
const INITIAL_FAVORITES: Professional[] = [
  {
    id: "1",
    name: "Dr. Leila Bensouda",
    specialty: "Dermatologue",
    rating: 4.9,
    reviewsCount: 128,
    location: "Casablanca, Gauthier",
    city: "Casablanca",
    image:
      "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Disponible demain",
  },
  {
    id: "2",
    name: "Yassine Barber & Spa",
    specialty: "Salon de coiffure & Soins",
    rating: 4.8,
    reviewsCount: 92,
    location: "Rabat, Agdal",
    city: "Rabat",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Disponible jeudi",
  },
  {
    id: "3",
    name: "Dr. Amine Lahlou",
    specialty: "Chirurgien Dentiste",
    rating: 4.95,
    reviewsCount: 210,
    location: "Marrakech, Guéliz",
    city: "Marrakech",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Disponible aujourd'hui",
  },
  {
    id: "4",
    name: "Maison de Beauté",
    specialty: "Esthétique & Massage",
    rating: 4.7,
    reviewsCount: 75,
    location: "Casablanca, Maarif",
    city: "Casablanca",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300&h=300",
    availability: "Disponible vendredi",
  },
];

const INITIAL_REVIEWS: Review[] = [];

const FavorisAvis: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"favorites" | "reviews">(
    "favorites",
  );

  const handleTabChange = (tab: "favorites" | "reviews") => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  const [favorites, setFavorites] = useState<Professional[]>(INITIAL_FAVORITES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [bookingProfessional, setBookingProfessional] =
    useState<Professional | null>(null);
  const [providerServices, setProviderServices] = useState<any[]>([]);
  const [providerAvailability, setProviderAvailability] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingRating, setEditingRating] = useState(5);
  const [editingAspects, setEditingAspects] = useState({
    welcome: 5,
    cleanliness: 5,
    quality: 5,
    value: 5,
  });

  const [lastRemovedFav, setLastRemovedFav] = useState<Professional | null>(
    null,
  );
  const [showToast, setShowToast] = useState(false);

  // ── CSS vars depending on theme — matching Messages & MesRendezVous ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
    .font-fraunces { font-family: 'Fraunces', serif; }

    .bg-dot-pattern {
      background-image: radial-gradient(${
        isDark ? "rgba(255,255,255,0.022)" : "rgba(26,111,209,0.06)"
      } 1px, transparent 1px);
      background-size: 28px 28px;
    }

    .glass-card {
      background: ${
        isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))"
          : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,255,0.85))"
      };
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(200,215,255,0.6)"};
      box-shadow: ${
        isDark
          ? "0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)"
      };
      transition: all 0.3s ease;
    }
    .glass-card:hover {
      transform: translateY(-3px);
      box-shadow: ${
        isDark
          ? "0 14px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 14px 60px rgba(26,111,209,0.15), inset 0 1px 0 rgba(255,255,255,1)"
      };
      border-color: ${isDark ? "rgba(26,111,209,0.35)" : "rgba(26,111,209,0.3)"};
    }

    .glass-input {
      background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(240,245,255,0.95)"};
      border: 1.5px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.45)"};
      color: ${isDark ? "#f1f5f9" : "#1e2a3b"};
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .glass-input::placeholder { color: ${isDark ? "rgba(255,255,255,0.28)" : "#aab8d0"}; }
    .glass-input:focus { border-color: #1a6fd1; box-shadow: 0 0 0 3px rgba(26,111,209,0.12); outline: none; }

    .glass-modal {
      background: ${
        isDark
          ? "linear-gradient(145deg, rgba(20,26,40,0.97), rgba(13,17,27,0.98))"
          : "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(245,249,255,0.97))"
      };
      backdrop-filter: blur(40px) saturate(200%);
      -webkit-backdrop-filter: blur(40px) saturate(200%);
      border: 1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(200,215,255,0.6)"};
      box-shadow: ${
        isDark
          ? "0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 24px 80px rgba(26,111,209,0.18), inset 0 1px 0 rgba(255,255,255,1)"
      };
    }

    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .skeleton {
      background: linear-gradient(90deg,
        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(200,215,255,0.35)"} 25%,
        ${isDark ? "rgba(255,255,255,0.09)" : "rgba(220,232,255,0.65)"} 50%,
        ${isDark ? "rgba(255,255,255,0.05)" : "rgba(200,215,255,0.35)"} 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }

    .sba::-webkit-scrollbar { width: 4px; }
    .sba::-webkit-scrollbar-track { background: transparent; }
    .sba::-webkit-scrollbar-thumb { background: ${isDark ? "rgba(255,255,255,0.11)" : "rgba(26,111,209,0.18)"}; border-radius: 4px; }
    .sba::-webkit-scrollbar-thumb:hover { background: ${isDark ? "rgba(255,255,255,0.22)" : "rgba(26,111,209,0.35)"}; }

    .tab-active {
      color: #1a6fd1;
    }
    .tab-inactive {
      color: ${isDark ? "rgba(255,255,255,0.38)" : "#94a3b8"};
    }
    .tab-inactive:hover {
      color: ${isDark ? "rgba(255,255,255,0.7)" : "#64748b"};
    }

    .stat-icon-red { background: ${isDark ? "rgba(239,68,68,0.1)" : "rgba(254,242,242,1)"}; }
    .stat-icon-blue { background: ${isDark ? "rgba(26,111,209,0.1)" : "rgba(239,246,255,1)"}; }
    .stat-icon-amber { background: ${isDark ? "rgba(245,158,11,0.1)" : "rgba(255,251,235,1)"}; }

    .search-wrap {
      background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)"};
      border: 1.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(190,210,255,0.5)"};
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-wrap:focus-within {
      border-color: #1a6fd1;
      box-shadow: 0 0 0 3px rgba(26,111,209,0.12);
    }
  `;

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) {
      const u = JSON.parse(s);
      setUserName(u.nomComplet || u.nom || "Utilisateur");
    }
  }, []);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const { getMyFavorites } =
          await import("../../services/Client/favorisService");
        const data = await getMyFavorites();
        if (data) {
          const mappedFavs = data.map((f: any) => ({
            id: f.id.toString(),
            name: f.nom,
            specialty: f.specialite || "Spécialité non spécifiée",
            rating: f.rating || 0,
            reviewsCount: 0,
            location: f.location || "Adresse non spécifiée",
            city: f.location ? f.location.split(",")[0] : "Ville",
            image: f.avatar
              ? f.avatar
              : "https://ui-avatars.com/api/?name=" + f.nom,
            availability: f.availableToday
              ? "Disponible aujourd'hui"
              : "Non disponible",
          }));
          setFavorites(mappedFavs);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des favoris", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const s = localStorage.getItem("user");
        if (s) {
          const u = JSON.parse(s);
          const clientId = u.idUtilisateur || u.id;
          if (clientId) {
            const { getAvisByClient } =
              await import("../../services/Client/avisService");
            const data = await getAvisByClient(clientId);
            if (data) {
              const mappedReviews = data.map((r: any) => ({
                id: r.id.toString(),
                providerId: r.providerId.toString(),
                providerName: r.providerName,
                providerSpecialty: r.service, // reusing service for specialty display
                providerImage:
                  "https://ui-avatars.com/api/?name=" + r.providerName,
                date: r.date,
                rating: r.rating,
                text: r.comment,
                aspects: {
                  welcome: r.rating,
                  cleanliness: r.rating,
                  quality: r.rating,
                  value: r.rating,
                },
              }));
              setReviews(mappedReviews);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des avis", err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFavs(), fetchReviews()]);
      setTimeout(() => setLoading(false), 500);
    };

    loadData();
  }, []);

  const filteredFavorites = favorites.filter(
    (fav) =>
      fav.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fav.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fav.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredReviews = reviews.filter(
    (rev) =>
      rev.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.providerSpecialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.text.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRemoveFavorite = async (prof: Professional) => {
    try {
      const { toggleFavori } =
        await import("../../services/Client/favorisService");
      await toggleFavori(Number(prof.id));
      setLastRemovedFav(prof);
      setFavorites((prev) => prev.filter((f) => f.id !== prof.id));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (e) {
      console.error("Error toggling favorite", e);
    }
  };

  const handleUndoRemove = async () => {
    if (lastRemovedFav) {
      try {
        const { toggleFavori } =
          await import("../../services/Client/favorisService");
        await toggleFavori(Number(lastRemovedFav.id));
        setFavorites((prev) => [...prev, lastRemovedFav]);
        setLastRemovedFav(null);
        setShowToast(false);
      } catch (e) {
        console.error("Error undoing toggle", e);
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet avis ?")) {
      try {
        const { deleteAvis } =
          await import("../../services/Client/avisService");
        await deleteAvis(Number(reviewId));
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (e) {
        console.error("Erreur lors de la suppression de l'avis", e);
      }
    }
  };

  const handleOpenEditReview = (review: Review) => {
    setEditingReview(review);
    setEditingText(review.text);
    setEditingRating(review.rating);
    setEditingAspects(
      review.aspects || { welcome: 5, cleanliness: 5, quality: 5, value: 5 },
    );
  };

  const handleSaveReview = () => {
    if (!editingReview) return;
    // For now we don't have update in backend, let's just do UI update or implement later
    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === editingReview.id
          ? {
              ...rev,
              text: editingText,
              rating: editingRating,
              aspects: editingAspects,
              date: "Modifié aujourd'hui",
            }
          : rev,
      ),
    );
    setEditingReview(null);
  };

  const handleOpenBooking = async (prof: Professional) => {
    setBookingProfessional(prof);
    setSelectedService("");
    setSelectedDate("");
    setSelectedTimeSlot("");
    setIsBookingSuccess(false);
    setProviderServices([]);
    setProviderAvailability([]);

    try {
      const { default: api } = await import("../../services/api");
      const res = await api.get(`Prestataires/profile/${prof.id}`);
      if (res.data && res.data.services) {
        setProviderServices(res.data.services);
      }

      const { getDisponibilites } =
        await import("../../services/provider/disponibiliteService");
      const availabilityData = await getDisponibilites(Number(prof.id));
      if (availabilityData) {
        setProviderAvailability(availabilityData);
      }
    } catch (e) {
      console.error("Could not fetch data for booking", e);
    }
  };

  const selectedServiceObj = React.useMemo(
    () =>
      providerServices.find(
        (s: any) => String(s.id) === String(selectedService),
      ),
    [providerServices, selectedService],
  );

  const isSelectedServiceFullDay = React.useMemo(() => {
    if (!selectedServiceObj) return false;
    return (
      Boolean(selectedServiceObj?.isFullDay) ||
      /jour/i.test(selectedServiceObj?.uniteDuree || "")
    );
  }, [selectedServiceObj]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProfessional || !selectedService || !selectedDate) return;
    if (!isSelectedServiceFullDay && !selectedTimeSlot) return;

    const toLocalISOString = (date: Date) => {
      const pad = (n: number) => (n < 10 ? "0" + n : n);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    try {
      const { createRendezVous } =
        await import("../../services/Client/rendezVousService");

      const targetDate = new Date(selectedDate);
      if (isSelectedServiceFullDay) {
        targetDate.setHours(0, 0, 0, 0);
      } else {
        const [hours, minutes] = selectedTimeSlot.split(":");
        targetDate.setHours(Number(hours), Number(minutes), 0, 0);
      }

      const endDate = new Date(targetDate);
      if (isSelectedServiceFullDay) {
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate.setHours(targetDate.getHours() + 1);
      }

      await createRendezVous({
        idPres: Number(bookingProfessional.id),
        idServ: Number(selectedService),
        DateDebut: toLocalISOString(targetDate),
        DateFin: toLocalISOString(endDate),
        Lieu: "",
      });

      setIsBookingSuccess(true);
      setTimeout(() => {
        setBookingProfessional(null);
        setIsBookingSuccess(false);
      }, 2500);
    } catch (err) {
      console.error("Erreur lors de la réservation", err);
      toast.error("Une erreur est survenue lors de la réservation.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 320, damping: 26 },
    },
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const availableSlotsForDate = React.useMemo(() => {
    if (!selectedDate || !providerAvailability.length) return [];
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();
    const daysMap = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const dayName = daysMap[dayOfWeek];

    const dayData = providerAvailability.find((d) => d.day === dayName);
    if (!dayData || !dayData.slots) return [];
    return dayData.slots
      .filter((s: any) => s.available)
      .map((s: any) => s.time);
  }, [selectedDate, providerAvailability]);

  return (
    <div
      className="min-h-screen transition-colors duration-200 overflow-x-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: isDark ? "#0d1117" : "#eef2fc",
      }}
    >
      <style>{css}</style>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(10,14,22,0.72)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Navbar
          activeSection={activeTab === "favorites" ? "favoris" : "avis"}
          onSectionChange={() => setIsSidebarOpen(false)}
        />
      </div>

      <main className="min-h-screen relative bg-dot-pattern pb-20 md:pb-0">
        <TopBar
          userName={userName}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1
                className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight mb-1"
                style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
              >
                Mes Favoris & Avis
              </h1>
              <p
                className="text-sm"
                style={{ color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8" }}
              >
                Gérez vos professionnels favoris et consultez l'historique des
                avis que vous avez rédigés.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aab8d0" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  activeTab === "favorites"
                    ? "Rechercher un favori..."
                    : "Rechercher un avis..."
                }
                className="search-wrap w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm"
                style={{ color: isDark ? "#f1f5f9" : "#1e2a3b" }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.3)" : "#aab8d0",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Stats cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {/* Favoris */}
            <div className="glass-card rounded-3xl p-5 flex items-center justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-red-500 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <Heart size={100} fill="currentColor" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl stat-icon-red flex items-center justify-center">
                  <Heart
                    className="text-red-500"
                    size={22}
                    fill="rgba(239,68,68,0.15)"
                  />
                </div>
                <div>
                  <span
                    className="font-fraunces text-2xl font-bold"
                    style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                  >
                    {favorites.length}
                  </span>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Favoris enregistrés
                  </p>
                </div>
              </div>
            </div>

            {/* Avis */}
            <div className="glass-card rounded-3xl p-5 flex items-center justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-[#1a6fd1] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <MessageSquare size={100} fill="currentColor" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl stat-icon-blue flex items-center justify-center">
                  <MessageSquare className="text-[#1a6fd1]" size={22} />
                </div>
                <div>
                  <span
                    className="font-fraunces text-2xl font-bold"
                    style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                  >
                    {reviews.length}
                  </span>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Avis publiés
                  </p>
                </div>
              </div>
            </div>

            {/* Note moyenne */}
            <div className="glass-card rounded-3xl p-5 flex items-center justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 group-hover:scale-110 transition-all duration-500">
                <Star size={100} fill="currentColor" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl stat-icon-amber flex items-center justify-center">
                  <Star
                    className="text-amber-500"
                    size={22}
                    fill="currentColor"
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="font-fraunces text-2xl font-bold"
                      style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                    >
                      {averageRating}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                      }}
                    >
                      /5.0
                    </span>
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Note moyenne donnée
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tab navigation ── */}
          <div
            className="flex items-center justify-between mb-8 pb-px"
            style={{
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"}`,
            }}
          >
            <div className="flex space-x-6 relative">
              <button
                onClick={() => handleTabChange("favorites")}
                className={`pb-4 text-sm font-semibold relative transition-all duration-300 ${activeTab === "favorites" ? "tab-active" : "tab-inactive"}`}
              >
                Professionnels Favoris
                {activeTab === "favorites" && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                    style={{
                      background: "#1a6fd1",
                      boxShadow: "0 0 8px rgba(26,111,209,0.6)",
                    }}
                  />
                )}
              </button>
              <button
                onClick={() => handleTabChange("reviews")}
                className={`pb-4 text-sm font-semibold relative transition-all duration-300 ${activeTab === "reviews" ? "tab-active" : "tab-inactive"}`}
              >
                Mes Avis Rédigés
                {activeTab === "reviews" && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                    style={{
                      background: "#1a6fd1",
                      boxShadow: "0 0 8px rgba(26,111,209,0.6)",
                    }}
                  />
                )}
              </button>
            </div>
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium"
              style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
            >
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Données chiffrées & sécurisées</span>
            </div>
          </div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-5 h-[180px]"
                  >
                    <div className="flex gap-4 w-full">
                      <div className="skeleton w-20 h-20 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="skeleton h-5 w-1/3" />
                        <div className="skeleton h-4 w-2/3" />
                        <div className="skeleton h-3 w-1/4 mt-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : activeTab === "favorites" ? (
              <motion.div
                key="favorites-tab"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredFavorites.map((prof) => (
                      <motion.div
                        key={prof.id}
                        variants={itemVariants}
                        layout
                        className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row justify-between gap-5 relative group/card"
                      >
                        <div className="flex gap-4">
                          <div
                            className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0"
                            style={{
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(200,215,255,0.5)"}`,
                            }}
                          >
                            <img
                              src={prof.image}
                              alt={prof.name}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div>
                            <span
                              className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                              style={{
                                background: isDark
                                  ? "rgba(26,111,209,0.14)"
                                  : "rgba(26,111,209,0.08)",
                                color: isDark ? "#60a5fa" : "#1a6fd1",
                                border: `1px solid ${isDark ? "rgba(26,111,209,0.3)" : "rgba(26,111,209,0.18)"}`,
                              }}
                            >
                              {prof.specialty}
                            </span>
                            <h3
                              className="font-fraunces font-bold text-lg mt-1.5"
                              style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                            >
                              {prof.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Star
                                size={13}
                                className="text-amber-400"
                                fill="currentColor"
                              />
                              <span
                                className="text-xs font-bold"
                                style={{
                                  color: isDark ? "#f1f5f9" : "#1a2540",
                                }}
                              >
                                {prof.rating}
                              </span>
                              <span
                                className="text-xs"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.38)"
                                    : "#94a3b8",
                                }}
                              >
                                ({prof.reviewsCount} avis)
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1 mt-1.5 text-xs"
                              style={{
                                color: isDark
                                  ? "rgba(255,255,255,0.38)"
                                  : "#94a3b8",
                              }}
                            >
                              <MapPin size={12} />
                              <span>{prof.location}</span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex sm:flex-col justify-between items-end gap-3 shrink-0 pt-4 sm:pt-0"
                          style={{
                            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(26,111,209,0.07)"}`,
                          }}
                        >
                          <button
                            onClick={() => handleRemoveFavorite(prof)}
                            className="p-2.5 rounded-full transition-all self-start sm:self-auto"
                            style={{
                              background: isDark
                                ? "rgba(239,68,68,0.1)"
                                : "rgba(254,242,242,1)",
                              color: "#ef4444",
                            }}
                            title="Retirer des favoris"
                          >
                            <Heart size={17} fill="currentColor" />
                          </button>
                          <div className="w-full sm:w-auto text-right">
                            <span className="block text-[11px] font-semibold text-emerald-500 mb-1.5">
                              {prof.availability}
                            </span>
                            <button
                              onClick={() => navigate(`/Service-Provider-Profile/${prof.id}`)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2176d8, #0f4fa0)",
                                boxShadow: "0 4px 16px rgba(26,111,209,0.32)",
                              }}
                            >
                              Réserver à nouveau
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto mt-6"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: isDark
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(254,242,242,1)",
                      }}
                    >
                      <HeartOff className="text-red-500" size={28} />
                    </div>
                    <h3
                      className="font-fraunces text-lg font-bold mb-2"
                      style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                    >
                      Aucun favori trouvé
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                      }}
                    >
                      {searchTerm
                        ? "Aucun professionnel ne correspond à votre recherche. Essayez d'autres mots-clés."
                        : "Vous n'avez pas encore ajouté de professionnels à vos favoris. Cliquez sur le cœur lors de votre recherche pour en enregistrer !"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reviews-tab"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {filteredReviews.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {filteredReviews.map((rev) => (
                      <motion.div
                        key={rev.id}
                        variants={itemVariants}
                        layout
                        className="glass-card rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-6"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3.5 mb-4">
                            <img
                              src={rev.providerImage}
                              alt={rev.providerName}
                              className="w-11 h-11 rounded-full object-cover"
                              style={{
                                border: `1.5px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(200,215,255,0.6)"}`,
                              }}
                            />
                            <div>
                              <h3
                                className="font-bold text-sm"
                                style={{
                                  color: isDark ? "#f1f5f9" : "#1a2540",
                                }}
                              >
                                {rev.providerName}
                              </h3>
                              <p
                                className="text-xs"
                                style={{
                                  color: isDark
                                    ? "rgba(255,255,255,0.38)"
                                    : "#94a3b8",
                                }}
                              >
                                {rev.providerSpecialty} · Consulté le {rev.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={14}
                                  className={
                                    s <= rev.rating
                                      ? "text-amber-400"
                                      : "text-gray-200 dark:text-gray-700"
                                  }
                                  fill={
                                    s <= rev.rating ? "currentColor" : "none"
                                  }
                                />
                              ))}
                            </div>
                            <span
                              className="text-xs font-bold"
                              style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                            >
                              {rev.rating}/5
                            </span>
                          </div>

                          <p
                            className="text-sm leading-relaxed italic"
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,0.65)"
                                : "#475569",
                            }}
                          >
                            "{rev.text}"
                          </p>

                          {rev.aspects && (
                            <div
                              className="mt-4 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4"
                              style={{
                                borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(26,111,209,0.07)"}`,
                              }}
                            >
                              {[
                                { label: "Accueil", val: rev.aspects.welcome },
                                {
                                  label: "Propreté",
                                  val: rev.aspects.cleanliness,
                                },
                                { label: "Qualité", val: rev.aspects.quality },
                                {
                                  label: "Rapport Q/P",
                                  val: rev.aspects.value,
                                },
                              ].map(({ label, val }) => (
                                <div key={label}>
                                  <span
                                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1"
                                    style={{
                                      color: isDark
                                        ? "rgba(255,255,255,0.28)"
                                        : "#94a3b8",
                                    }}
                                  >
                                    {label}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="text-xs font-bold"
                                      style={{
                                        color: isDark ? "#f1f5f9" : "#1a2540",
                                      }}
                                    >
                                      {val}
                                    </span>
                                    <div
                                      className="h-1.5 flex-1 rounded-full overflow-hidden"
                                      style={{
                                        background: isDark
                                          ? "rgba(255,255,255,0.06)"
                                          : "rgba(26,111,209,0.08)",
                                      }}
                                    >
                                      <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: `${(val / 5) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div
                          className="flex md:flex-col justify-end items-end gap-3 shrink-0 pt-4 md:pt-0"
                          style={{
                            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(26,111,209,0.07)"}`,
                          }}
                        >
                          <button
                            onClick={() => handleOpenEditReview(rev)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{
                              background: isDark
                                ? "rgba(26,111,209,0.14)"
                                : "rgba(26,111,209,0.08)",
                              color: isDark ? "#60a5fa" : "#1a6fd1",
                              border: `1px solid ${isDark ? "rgba(26,111,209,0.28)" : "rgba(26,111,209,0.16)"}`,
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Modifier</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto mt-6"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        background: isDark
                          ? "rgba(26,111,209,0.1)"
                          : "rgba(239,246,255,1)",
                      }}
                    >
                      <MessageSquare className="text-[#1a6fd1]" size={28} />
                    </div>
                    <h3
                      className="font-fraunces text-lg font-bold mb-2"
                      style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                    >
                      Aucun avis trouvé
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                      }}
                    >
                      {searchTerm
                        ? "Aucun avis ne correspond à votre recherche. Essayez d'autres termes."
                        : "Vous n'avez pas encore laissé d'avis sur l'application Bookify. Vos avis s'afficheront ici après vos rendez-vous terminés !"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />
        <MobileBottomNav />
      </main>

      {/* ── Toast undo ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
            style={{
              background: isDark
                ? "rgba(13,17,27,0.95)"
                : "rgba(15,23,42,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <AlertCircle size={17} className="text-red-400" />
            <span className="text-sm font-medium text-white">
              Favori retiré.
            </span>
            <button
              onClick={handleUndoRemove}
              className="text-sm font-bold ml-2 text-[#60a5fa] hover:text-blue-300 transition-colors"
            >
              Annuler
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Booking ── */}
      <AnimatePresence>
        {bookingProfessional && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(10,14,22,0.72)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="glass-modal w-full max-w-lg rounded-3xl overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-6 flex justify-between items-center"
                style={{
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={bookingProfessional.image}
                    alt={bookingProfessional.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3
                      className="font-bold text-base"
                      style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                    >
                      {bookingProfessional.name}
                    </h3>
                    <p
                      className="text-xs"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                      }}
                    >
                      {bookingProfessional.specialty} ·{" "}
                      {bookingProfessional.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBookingProfessional(null)}
                  className="p-2 rounded-xl transition-all"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(26,111,209,0.05)",
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
                {isBookingSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-emerald-500"
                      style={{
                        background: isDark
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(220,252,231,1)",
                        boxShadow: "0 0 0 8px rgba(34,197,94,0.08)",
                      }}
                    >
                      <Check
                        size={34}
                        strokeWidth={2.5}
                        className="animate-pulse"
                      />
                    </div>
                    <h4
                      className="font-fraunces text-lg font-bold mb-1"
                      style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                    >
                      Réservation confirmée !
                    </h4>
                    <p
                      className="text-xs text-center max-w-xs leading-relaxed"
                      style={{
                        color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                      }}
                    >
                      Votre rendez-vous a été planifié avec succès. Vous
                      recevrez un SMS et un e-mail de confirmation.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                        }}
                      >
                        Choisir une prestation
                      </label>
                      <select
                        required
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="glass-input w-full px-4 py-3 rounded-2xl text-sm"
                        style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                      >
                        <option value="">Sélectionner une prestation</option>
                        {providerServices.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name || s.nom} ({s.prix} MAD)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                        }}
                      >
                        Sélectionner une date
                      </label>
                      <div className="relative">
                        <Calendar
                          size={15}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.3)" : "#aab8d0",
                          }}
                        />
                        <input
                          type="date"
                          required
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm cursor-pointer"
                          style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                        />
                      </div>
                    </div>

                    {!isSelectedServiceFullDay && (
                      <div>
                        <label
                          className="block text-xs font-semibold uppercase tracking-wider mb-2"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.38)"
                              : "#94a3b8",
                          }}
                        >
                          Créneaux horaires disponibles
                        </label>
                        {!selectedDate ? (
                          <p className="text-sm italic text-gray-500 py-2">
                            Veuillez d'abord sélectionner une date.
                          </p>
                        ) : availableSlotsForDate.length === 0 ? (
                          <p className="text-sm italic text-red-500 py-2">
                            Aucun créneau disponible pour cette date.
                          </p>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {availableSlotsForDate.map((slot: string) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                className="py-2 px-1 text-center rounded-xl text-xs font-bold transition-all"
                                style={
                                  selectedTimeSlot === slot
                                    ? {
                                        background:
                                          "linear-gradient(135deg, #2176d8, #0f4fa0)",
                                        color: "#fff",
                                        boxShadow:
                                          "0 4px 12px rgba(26,111,209,0.32)",
                                        border: "1px solid transparent",
                                      }
                                    : {
                                        background: isDark
                                          ? "rgba(255,255,255,0.05)"
                                          : "rgba(240,245,255,0.95)",
                                        color: isDark ? "#f1f5f9" : "#1a2540",
                                        border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.5)"}`,
                                      }
                                }
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className="flex gap-3 pt-4"
                      style={{
                        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setBookingProfessional(null)}
                        className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                          border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.5)"}`,
                          background: isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(240,245,255,0.6)",
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !selectedService ||
                          !selectedDate ||
                          (!isSelectedServiceFullDay && !selectedTimeSlot)
                        }
                        className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(135deg, #2176d8, #0f4fa0)",
                          boxShadow: "0 4px 20px rgba(26,111,209,0.32)",
                        }}
                      >
                        Confirmer le rendez-vous
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Edit Review ── */}
      <AnimatePresence>
        {editingReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(10,14,22,0.72)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-modal w-full max-w-lg rounded-3xl overflow-hidden"
            >
              {/* Header */}
              <div
                className="p-6 flex justify-between items-center"
                style={{
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"}`,
                }}
              >
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                  >
                    Modifier mon avis
                  </h3>
                  <p
                    className="text-xs"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Pour {editingReview.providerName}
                  </p>
                </div>
                <button
                  onClick={() => setEditingReview(null)}
                  className="p-2 rounded-xl transition-all"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    background: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(26,111,209,0.05)",
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 sba max-h-[75vh] overflow-y-auto">
                {/* Note globale */}
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Note globale
                  </label>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setEditingRating(v)}
                        type="button"
                        className="transition-transform active:scale-95"
                      >
                        <Star
                          size={28}
                          className={
                            v <= editingRating
                              ? "text-amber-400"
                              : "text-gray-200 dark:text-gray-700"
                          }
                          fill={v <= editingRating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                    <span
                      className="text-sm font-bold ml-2"
                      style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                    >
                      {editingRating} sur 5
                    </span>
                  </div>
                </div>

                {/* Aspects */}
                <div
                  className="space-y-3 pt-3"
                  style={{
                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(26,111,209,0.07)"}`,
                  }}
                >
                  <h4
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Évaluation détaillée
                  </h4>
                  {[
                    { key: "welcome" as const, label: "Qualité de l'accueil" },
                    {
                      key: "cleanliness" as const,
                      label: "Propreté & Hygiène",
                    },
                    {
                      key: "quality" as const,
                      label: "Qualité de la prestation",
                    },
                    { key: "value" as const, label: "Rapport qualité / prix" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span
                        className="text-sm"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                        }}
                      >
                        {label}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() =>
                              setEditingAspects((prev) => ({
                                ...prev,
                                [key]: v,
                              }))
                            }
                            className="w-7 h-7 text-xs font-bold rounded-lg flex items-center justify-center transition-all"
                            style={
                              editingAspects[key] === v
                                ? {
                                    background: "#22c55e",
                                    color: "#fff",
                                    border: "1px solid transparent",
                                  }
                                : {
                                    background: isDark
                                      ? "rgba(255,255,255,0.05)"
                                      : "rgba(240,245,255,0.95)",
                                    color: isDark
                                      ? "rgba(255,255,255,0.5)"
                                      : "#64748b",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.5)"}`,
                                  }
                            }
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Textarea */}
                <div>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                    }}
                  >
                    Votre avis détaillé
                  </label>
                  <textarea
                    rows={4}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    placeholder="Écrivez votre commentaire ici..."
                    className="glass-input w-full px-4 py-3 rounded-2xl text-sm resize-none"
                    style={{ color: isDark ? "#f1f5f9" : "#1a2540" }}
                  />
                </div>

                <div
                  className="flex gap-3 pt-4"
                  style={{
                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(26,111,209,0.09)"}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(190,210,255,0.5)"}`,
                      background: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(240,245,255,0.6)",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={!editingText.trim()}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #2176d8, #0f4fa0)",
                      boxShadow: "0 4px 20px rgba(26,111,209,0.32)",
                    }}
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavorisAvis;
