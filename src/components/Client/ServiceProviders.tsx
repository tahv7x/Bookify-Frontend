import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import TopBar from '../../components/Client/TopBar';
import Navbar from '../../components/Client/Navbar';

const providers = [
  {
    name: "Dr. Youssef Alami",
    rating: 4.9,
    reviews: 127,
    location: "Casablanca",
    price: "300 MAD",
    priceNote: "/ séance",
    image: "https://i.pravatar.cc/150?img=12",
    badge: "Top Pro",
    hired: 43,
    responseTime: "Répond en 1h",
    tags: ["Certifié", "Expérimenté", "Disponible"],
    description:
      "Professionnel certifié avec plus de 10 ans d'expérience. Je m'engage à fournir un service de haute qualité adapté à vos besoins.",
    verified: true,
  },
  {
    name: "Sara Bennis",
    rating: 5.0,
    reviews: 89,
    location: "Rabat",
    price: "350 MAD",
    priceNote: "/ séance",
    image: "https://i.pravatar.cc/150?img=45",
    badge: "Top Pro",
    hired: 61,
    responseTime: "Répond en 30min",
    tags: ["Certifiée", "Bilingue", "Premium"],
    description:
      "Spécialiste reconnue dans son domaine. Mon approche personnalisée garantit des résultats exceptionnels pour chaque client.",
    verified: true,
  },
  {
    name: "Karim Tahiri",
    rating: 4.7,
    reviews: 54,
    location: "Marrakech",
    price: "250 MAD",
    priceNote: "/ séance",
    image: "https://i.pravatar.cc/150?img=33",
    badge: null,
    hired: 28,
    responseTime: "Répond en 2h",
    tags: ["Expérimenté", "Flexible"],
    description:
      "Passionné par mon métier, je propose des services flexibles adaptés à votre emploi du temps et votre budget.",
    verified: false,
  },
  {
    name: "Nadia Oufkir",
    rating: 4.8,
    reviews: 112,
    location: "Fès",
    price: "280 MAD",
    priceNote: "/ séance",
    image: "https://i.pravatar.cc/150?img=47",
    badge: "Top Pro",
    hired: 39,
    responseTime: "Répond en 45min",
    tags: ["Certifiée", "Multi-spécialités"],
    description:
      "Professionnelle dévouée avec une expertise dans plusieurs spécialités. Satisfaction client garantie à chaque prestation.",
    verified: true,
  },
  {
    name: "Hassan Berrada",
    rating: 4.6,
    reviews: 37,
    location: "Tanger",
    price: "220 MAD",
    priceNote: "/ séance",
    image: "https://i.pravatar.cc/150?img=15",
    badge: null,
    hired: 19,
    responseTime: "Répond en 3h",
    tags: ["Disponible", "Tarif abordable"],
    description:
      "Je mets mon expertise au service de vos projets avec sérieux et professionnalisme. Devis gratuit sur demande.",
    verified: false,
  },
  {
    name: "Leila Mansouri",
    rating: 4.9,
    reviews: 203,
    location: "Casablanca",
    price: "400 MAD",
    priceNote: "/ séance",
    image: "https://i.pravatar.cc/150?img=44",
    badge: "Top Pro",
    hired: 88,
    responseTime: "Répond en 20min",
    tags: ["Premium", "Certifiée", "Experte"],
    description:
      "L'excellence comme standard. Avec plus de 8 ans d'expérience, je vous offre une prestation haut de gamme personnalisée.",
    verified: true,
  },
];


const Stars = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => {
      const filled = rating >= i ? "#f59e0b" : rating >= i - 0.5 ? "#f59e0b" : "#d1d5db";
      const opacity = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 1;
      return (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" style={{ opacity }}>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={filled}
            stroke={filled}
            strokeWidth="1"
          />
        </svg>
      );
    })}
  </div>
);

export default function ServiceProviders() {
  const { serviceName } = useParams();
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const cities = ["all", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger"];

  const filtered = providers
    .filter((p) => selectedCity === "all" || p.location === selectedCity)
    .filter((p) => p.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return parseInt(a.price) - parseInt(b.price);
      if (sortBy === "price_desc") return parseInt(b.price) - parseInt(a.price);
      return b.hired - a.hired;
    });

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Top Bar */}
        <TopBar 
          userName = {userName}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isSidebarOpen}
        />
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40 "
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>

        <Navbar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false);
          }}
        />
      </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 22, padding: 4 }}
            onClick={() => window.history.back()}
          >←</button>
          <div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Résultats pour</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
              {decodeURIComponent(serviceName || "Service")}
            </div>
          </div>
        </div>
        <div style={{
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: "#92400e",
        }}>
          {filtered.length} prestataires disponibles
        </div>
      </div>

      {/* Layout */}
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "28px 20px",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 28,
        alignItems: "start",
      }}>
        {/* Sidebar */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
          position: "sticky",
          top: 80,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Filtres</div>

          {/* Sort */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Trier par
            </div>
            {[
              { val: "recommended", label: "Recommandés" },
              { val: "rating", label: "Meilleure note" },
              { val: "price_asc", label: "Prix croissant" },
              { val: "price_desc", label: "Prix décroissant" },
            ].map((opt) => (
              <label key={opt.val} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                cursor: "pointer", fontSize: 14,
                color: sortBy === opt.val ? "#2563eb" : "#374151",
                fontWeight: sortBy === opt.val ? 600 : 400,
              }}>
                <input type="radio" name="sort" value={opt.val} checked={sortBy === opt.val}
                  onChange={() => setSortBy(opt.val)} style={{ accentColor: "#2563eb" }} />
                {opt.label}
              </label>
            ))}
          </div>
          

          {/* City */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Ville
            </div>
            {cities.map((city) => (
              <label key={city} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                cursor: "pointer", fontSize: 14,
                color: selectedCity === city ? "#2563eb" : "#374151",
                fontWeight: selectedCity === city ? 600 : 400,
              }}>
                <input type="radio" name="city" value={city} checked={selectedCity === city}
                  onChange={() => setSelectedCity(city)} style={{ accentColor: "#2563eb" }} />
                {city === "all" ? "Toutes les villes" : city}
              </label>
            ))}
          </div>

          {/* Rating */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Note minimale
            </div>
            {[
              { val: 0, label: "Toutes les notes" },
              { val: 4, label: "4+ ⭐" },
              { val: 4.5, label: "4.5+ ⭐" },
              { val: 4.8, label: "4.8+ ⭐" },
            ].map((opt) => (
              <label key={opt.val} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                cursor: "pointer", fontSize: 14,
                color: minRating === opt.val ? "#2563eb" : "#374151",
                fontWeight: minRating === opt.val ? 600 : 400,
              }}>
                <input type="radio" name="rating" value={opt.val} checked={minRating === opt.val}
                  onChange={() => setMinRating(opt.val)} style={{ accentColor: "#2563eb" }} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((p, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "22px 24px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 20,
                alignItems: "start",
                border: "1.5px solid transparent",
                transition: "border-color 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#2563eb";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(37,99,235,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.07)";
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative" }}>
                <img src={p.image} alt={p.name} style={{
                  width: 76, height: 76, borderRadius: "50%",
                  objectFit: "cover", border: "3px solid #e5e7eb",
                }} />
                {p.verified && (
                  <div style={{
                    position: "absolute", bottom: 1, right: 1,
                    background: "#2563eb", borderRadius: "50%",
                    width: 22, height: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid #fff",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>{p.name}</span>
                  {p.badge && (
                    <span style={{
                      background: "#fef3c7", color: "#92400e",
                      fontSize: 11, fontWeight: 700,
                      padding: "2px 10px", borderRadius: 20,
                      border: "1px solid #fcd34d",
                    }}>★ {p.badge}</span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <Stars rating={p.rating} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{p.rating.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>({p.reviews} avis)</span>
                  <span style={{ color: "#d1d5db" }}>·</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>📍 {p.location}</span>
                </div>

                <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, marginBottom: 12, maxWidth: 480 }}>
                  {p.description}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {p.tags.map((tag, ti) => (
                    <span key={ti} style={{
                      background: "#eff6ff", color: "#2563eb",
                      fontSize: 12, fontWeight: 500,
                      padding: "3px 10px", borderRadius: 20,
                    }}>{tag}</span>
                  ))}
                  <span style={{ fontSize: 12, color: "#6b7280" }}>👥 {p.hired} clients</span>
                  <span style={{ fontSize: 12, color: "#059669" }}>⚡ {p.responseTime}</span>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, minWidth: 140 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{p.price}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.priceNote}</div>
                </div>
                <button
                  style={{
                    background: "#2563eb", color: "#fff", border: "none",
                    borderRadius: 10, padding: "11px 22px",
                    fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = "#1d4ed8")}
                  onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "#2563eb")}
                >
                  Contacter
                </button>
                <button onClick={() => navigate(`/Service-Provider-Profile/${p.name.toLowerCase().replace(/ /g, "-")}`)}
                style={{
                  background: "#fff", color: "#2563eb",
                  border: "2px solid #2563eb", borderRadius: 10,
                  padding: "9px 22px", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", width: "100%",
                }}>
                  Voir le profil
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", color: "#6b7280" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun prestataire trouvé</div>
              <div style={{ fontSize: 14 }}>Essayez de modifier vos filtres</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}