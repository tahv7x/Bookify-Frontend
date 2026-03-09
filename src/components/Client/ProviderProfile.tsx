import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PROVIDERS: Record<string, any> = {
  "dr-youssef-alami": {
    name: "Dr. Youssef Alami",
    business: "Cabinet Alami",
    title: "Médecin Généraliste",
    rating: 4.9,
    reviews: 127,
    hired: 43,
    location: "Casablanca, Maroc",
    responseTime: "Répond en 1h",
    memberSince: "2021",
    image: "https://i.pravatar.cc/150?img=12",
    badge: "Top Pro",
    verified: true,
    price: "300 MAD",
    priceNote: "séance",
    intro: "Professionnel certifié avec plus de 10 ans d'expérience. Spécialiste en médecine générale, suivi chronique, et bilans complets. Je m'engage pour votre santé.",
    credentials: ["Certifié", "Assurance incluse", "Contrôle d'antécédents", "Licence vérifiée"],
    photos: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop",
    ],
    services: ["Consultation générale", "Suivi médical", "Bilan complet", "Téléconsultation"],
    faq: [
      { q: "Quelles sont vos disponibilités ?", a: "Je suis disponible du lundi au samedi, de 9h à 19h. Les rendez-vous urgents peuvent être arrangés." },
      { q: "Acceptez-vous les mutuelles ?", a: "Oui, je travaille avec la plupart des mutuelles marocaines. Contactez-moi pour vérifier la vôtre." },
      { q: "Proposez-vous des consultations à domicile ?", a: "Oui, pour les patients à mobilité réduite ou sur demande spéciale." },
    ],
    reviewsList: [
      { name: "Fatima Z.", avatar: "https://i.pravatar.cc/40?img=5", rating: 5, date: "Il y a 2 semaines", text: "Excellent professionnel, très à l'écoute. Je recommande vivement.", hired: true },
      { name: "Mohamed A.", avatar: "https://i.pravatar.cc/40?img=7", rating: 5, date: "Il y a 1 mois", text: "Très professionnel et ponctuel. Exactement ce dont j'avais besoin.", hired: true },
      { name: "Aicha B.", avatar: "https://i.pravatar.cc/40?img=9", rating: 4, date: "Il y a 2 mois", text: "Bon service, explications claires et détaillées. Reviendrai.", hired: true },
      { name: "Omar K.", avatar: "https://i.pravatar.cc/40?img=11", rating: 5, date: "Il y a 3 mois", text: "Rapide, efficace et très compétent. Parfait pour toute la famille.", hired: true },
    ],
  },
  "sara-bennis": {
    name: "Sara Bennis",
    business: "Cabinet Bennis",
    title: "Spécialiste Premium",
    rating: 5.0,
    reviews: 89,
    hired: 61,
    location: "Rabat, Maroc",
    responseTime: "Répond en 30min",
    memberSince: "2020",
    image: "https://i.pravatar.cc/150?img=45",
    badge: "Top Pro",
    verified: true,
    price: "350 MAD",
    priceNote: "séance",
    intro: "Spécialiste avec une approche 100% personnalisée. Chaque client mérite une attention particulière. Mon objectif : des résultats exceptionnels, à chaque fois.",
    credentials: ["Certifiée", "Assurance incluse", "Contrôle d'antécédents"],
    photos: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
    ],
    services: ["Consultation premium", "Suivi personnalisé", "Pack complet"],
    faq: [
      { q: "Quelle est votre spécialité principale ?", a: "Je me spécialise dans le suivi personnalisé et les approches intégratives adaptées à chaque profil." },
    ],
    reviewsList: [
      { name: "Khadija M.", avatar: "https://i.pravatar.cc/40?img=11", rating: 5, date: "Il y a 3 jours", text: "Parfaite ! Service irréprochable et très sympathique.", hired: true },
      { name: "Yassine T.", avatar: "https://i.pravatar.cc/40?img=13", rating: 5, date: "Il y a 3 semaines", text: "La meilleure de sa catégorie. Résultats au-delà de mes attentes.", hired: true },
    ],
  },
};

const Stars = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={rating >= i ? "#f59e0b" : "#e5e7eb"} />
      </svg>
    ))}
  </span>
);

export default function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [activePhoto, setActivePhoto] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [quoteStep, setQuoteStep] = useState(0); // 0=idle, 1=form, 2=sent

  const key = providerId || "dr-youssef-alami";
  const p = PROVIDERS[key] || PROVIDERS["dr-youssef-alami"];
  const displayedReviews = showAll ? p.reviewsList : p.reviewsList.slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Top nav bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", gap: 16,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          color: "#374151", fontSize: 14, fontWeight: 500, padding: "6px 10px",
          borderRadius: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour aux résultats
        </button>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Hero card */}
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            {/* Photo gallery */}
            {p.photos.length > 0 && (
              <div style={{ position: "relative", height: 260, background: "#111", overflow: "hidden" }}>
                <img src={p.photos[activePhoto]} alt="work" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }} />
                {p.photos.length > 1 && (
                  <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                    {p.photos.map((_: any, i: number) => (
                      <button key={i} onClick={() => setActivePhoto(i)} style={{
                        width: i === activePhoto ? 22 : 7, height: 7,
                        borderRadius: 4, border: "none", cursor: "pointer",
                        background: i === activePhoto ? "#fff" : "rgba(255,255,255,0.5)",
                        transition: "all 0.2s",
                        padding: 0,
                      }} />
                    ))}
                  </div>
                )}
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>
                  {activePhoto + 1} / {p.photos.length} photos
                </div>
              </div>
            )}

            {/* Profile info */}
            <div style={{ padding: "20px 24px 24px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={p.image} alt={p.name} style={{
                    width: 72, height: 72, borderRadius: "50%",
                    border: "3px solid #e5e7eb", objectFit: "cover",
                  }} />
                  {p.verified && (
                    <div style={{
                      position: "absolute", bottom: 2, right: 2,
                      background: "#2563eb", borderRadius: "50%",
                      width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #fff",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{p.business}</h1>
                    {p.badge && (
                      <span style={{
                        background: "#fef3c7", color: "#92400e", fontSize: 11,
                        fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                        border: "1px solid #fcd34d",
                      }}>★ {p.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>{p.name} · {p.title}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Stars rating={p.rating} size={14} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{p.rating.toFixed(1)}</span>
                    <span style={{ fontSize: 13, color: "#2563eb", cursor: "pointer" }}>({p.reviews} avis)</span>
                    <span style={{ color: "#d1d5db" }}>·</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{p.hired} recrutements</span>
                    <span style={{ color: "#d1d5db" }}>·</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>📍 {p.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Vérifications & licences</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {p.credentials.map((c: string, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: 10, padding: "7px 14px", fontSize: 13, color: "#166534", fontWeight: 500,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Introduction</h2>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8, margin: 0 }}>{p.intro}</p>

            <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 18, paddingTop: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 10px" }}>Services proposés</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {p.services.map((s: string, i: number) => (
                  <span key={i} style={{
                    background: "#eff6ff", color: "#2563eb",
                    fontSize: 13, padding: "5px 12px", borderRadius: 20, fontWeight: 500,
                  }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, marginTop: 18, paddingTop: 18, borderTop: "1px solid #f3f4f6", flexWrap: "wrap" }}>
              {[
                { icon: "⚡", label: p.responseTime },
                { icon: "📅", label: `Membre depuis ${p.memberSince}` },
                { icon: "👥", label: `${p.hired} clients recrutés` },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Questions fréquentes</h2>
            {p.faq.map((item: any, i: number) => (
              <div key={i} style={{ borderBottom: i < p.faq.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <p style={{ margin: "0 0 14px", fontSize: 14, color: "#4b5563", lineHeight: 1.7 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                  Avis clients
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Stars rating={p.rating} size={16} />
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>{p.rating.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>sur 5 · {p.reviews} avis</span>
                </div>
              </div>
            </div>

            {/* Rating bars */}
            <div style={{ marginBottom: 20 }}>
              {[5,4,3,2,1].map(star => {
                const pct = star === 5 ? 78 : star === 4 ? 16 : star === 3 ? 4 : star === 2 ? 2 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "#6b7280", width: 16 }}>{star}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/></svg>
                    <div style={{ flex: 1, height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: "#9ca3af", width: 28 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {displayedReviews.map((r: any, i: number) => (
                <div key={i} style={{ padding: "16px 0", borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <img src={r.avatar} alt={r.name} style={{ width: 38, height: 38, borderRadius: "50%" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.date}</div>
                        </div>
                        <Stars rating={r.rating} size={12} />
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.7 }}>{r.text}</p>
                  {r.hired && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#059669" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      A engagé ce professionnel
                    </div>
                  )}
                </div>
              ))}
            </div>

            {p.reviewsList.length > 2 && (
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  width: "100%", marginTop: 12, padding: "11px",
                  background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer",
                }}
              >
                {showAll ? "Voir moins" : `Voir les ${p.reviews} avis`}
              </button>
            )}
          </div>

        </div>

        {/* RIGHT STICKY COLUMN — Booking panel */}
        <div style={{ position: "sticky", top: 72, display: "flex", flexDirection: "column", gap: 14 }}>

          {quoteStep === 0 && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.10)", border: "1px solid #e5e7eb",
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>À partir de</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>
                  {p.price}
                  <span style={{ fontSize: 14, fontWeight: 400, color: "#9ca3af" }}> / {p.priceNote}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "10px 14px", background: "#f0fdf4", borderRadius: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>{p.responseTime}</span>
              </div>

              <button
                onClick={() => setQuoteStep(1)}
                style={{
                  width: "100%", background: "#2563eb", color: "#fff", border: "none",
                  borderRadius: 12, padding: "15px",
                  fontSize: 16, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                  marginBottom: 10,
                }}
              >
                Obtenir un devis
              </button>

              <button style={{
                width: "100%", background: "#fff", color: "#374151",
                border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "13px",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
              }}>
                Contacter
              </button>

              <div style={{ marginTop: 16, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
                Aucun engagement requis
              </div>
            </div>
          )}

          {quoteStep === 1 && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            }}>
              <button onClick={() => setQuoteStep(0)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                ← Retour
              </button>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>
                Demander un devis
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Votre nom", "Téléphone", "Ville"].map((label) => (
                  <div key={label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
                    <input style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Description du besoin</label>
                  <textarea style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none", resize: "none", height: 80, boxSizing: "border-box" }} />
                </div>
                <button
                  onClick={() => setQuoteStep(2)}
                  style={{
                    background: "#2563eb", color: "#fff", border: "none",
                    borderRadius: 10, padding: "13px",
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Envoyer la demande
                </button>
              </div>
            </div>
          )}

          {quoteStep === 2 && (
            <div style={{
              background: "#fff", borderRadius: 16, padding: 28,
              boxShadow: "0 4px 20px rgba(0,0,0,0.10)", textAlign: "center",
            }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Demande envoyée !</h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px" }}>
                {p.name} vous répondra dans les plus brefs délais.
              </p>
              <button onClick={() => setQuoteStep(0)} style={{
                background: "#eff6ff", color: "#2563eb", border: "none",
                borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Retour au profil
              </button>
            </div>
          )}

          {/* Stats mini card */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            {[
              { icon: "👥", label: "Recrutements", value: p.hired },
              { icon: "⭐", label: "Note", value: `${p.rating.toFixed(1)}/5` },
              { icon: "💬", label: "Avis", value: p.reviews },
            ].map((stat, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: i < 2 ? "1px solid #f9fafb" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{stat.icon} {stat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "0 8px" }}>
            🔒 Vos informations sont sécurisées
          </div>
        </div>

      </div>
    </div>
  );
}